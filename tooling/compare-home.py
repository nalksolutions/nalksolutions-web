"""Strict homepage comparison; never updates baselines or resizes screenshots.

Writes diagnostics even when fidelity fails, then exits nonzero. Run after production browser
tests, passing their timestamped run directory. Existing tests remain independent engineering
checks; this command is the additional, deliberately strict visual check.
"""
import argparse
from datetime import datetime, timezone
import hashlib
import json
from pathlib import Path
import platform

from PIL import Image, ImageChops, ImageStat

ROOT = Path(__file__).resolve().parents[1]
LANDMARKS = {
    "home-hero": "d0da942", "home-introduction": "2180fc7", "home-services": "fe25950",
    "home-marquee": "7847334", "home-benefits": "0d3600b", "home-testimonials": "7ea04ed",
    "home-stats": "e900665", "home-faq": "7377619", "home-cta": "0e530cb",
}


def sha(file):
    return hashlib.sha256(file.read_bytes()).hexdigest()


def compare(expected, actual, output):
    with Image.open(expected) as left, Image.open(actual) as right:
        left, right = left.convert("RGB"), right.convert("RGB")
        sizes_match = left.size == right.size
        result = {"expectedSize": list(left.size), "actualSize": list(right.size), "dimensionsMatch": sizes_match}
        if sizes_match:
            difference = ImageChops.difference(left, right)
            mask = difference.convert("RGB").point(lambda value: 255 if value else 0)
            channels = mask.split()
            changed = ImageChops.lighter(ImageChops.lighter(channels[0], channels[1]), channels[2])
            changed_count = changed.histogram()[255]
            result.update({"differentPixels": changed_count, "differentPixelRatio": changed_count / (left.width * left.height),
                           "meanAbsoluteChannelDifference": sum(ImageStat.Stat(difference).mean) / 3})
            difference.save(output)
        else:
            # A viewport-sized top region is diagnostic only. Full-page dimension drift always fails.
            height = min(1000, left.height, right.height)
            width = min(left.width, right.width)
            ImageChops.difference(left.crop((0, 0, width, height)), right.crop((0, 0, width, height))).save(output)
        result["passed"] = sizes_match and result.get("differentPixels") == 0
        return result


def main(run):
    run = run.resolve()
    if not run.is_relative_to(ROOT):
        raise ValueError("Expected a workspace-owned report directory")
    output = run / "visual-home"
    output.mkdir(exist_ok=True)
    record = json.loads((ROOT / "nalk-public-archive/pages/home-91d9b62648d713d4.json").read_text(encoding="utf-8"))
    report = {"schemaVersion": 1, "baselineId": "nalk-wordpress-2026-10-15", "createdAt": datetime.now(timezone.utc).isoformat(),
              "platform": platform.platform(), "buildId": (ROOT / ".next/BUILD_ID").read_text().strip(),
              "policy": "Exact pixels and matching full-page dimensions; no masks or automatic baseline changes. Any renderer tolerance requires separate reviewed evidence.",
              "sourceContentSha256": sha(ROOT / "src/content/home/home.generated.json"), "profiles": {}}
    for profile in ["desktop", "tablet", "mobile"]:
        candidates = list((run / "browser/test-results").glob(f"*-chromium-{profile}/homepage.png"))
        if len(candidates) != 1:
            raise ValueError(f"Expected one successful {profile} homepage capture, got {len(candidates)}")
        actual = candidates[0]
        original = ROOT / "nalk-public-archive" / record["profiles"][profile]["screenshot"]
        result = {"original": original.relative_to(ROOT).as_posix(), "originalSha256": sha(original),
                  "actual": actual.relative_to(ROOT).as_posix(), "actualSha256": sha(actual),
                  "historicalComparison": compare(original, actual, output / f"{profile}-historical-diff.png")}
        calibration = ROOT / f"tmp/chunk2-reference/calibration-{profile}.png"
        measurements = ROOT / f"tmp/chunk2-reference/measurements/{profile}.json"
        if calibration.exists() and measurements.exists():
            reference = json.loads(measurements.read_text(encoding="utf-8"))
            result["referenceSha256"] = sha(calibration)
            result["alignedComparison"] = compare(calibration, actual, output / f"{profile}-aligned-diff.png")
            result["referenceCalibration"] = compare(original, calibration, output / f"{profile}-calibration-diff.png")
            geometry = json.loads(actual.with_name("homepage-geometry.json").read_text())
            result["landmarks"] = []
            for name, source_id in LANDMARKS.items():
                expected = next(row["box"] for row in reference["sections"] if row["id"] == source_id)
                observed = next(row["box"] for row in geometry if row["name"].split()[0] == name)
                delta = {key: observed[key] - expected[key] for key in ["x", "y", "width", "height"]}
                result["landmarks"].append({"name": name, "expected": expected, "actual": observed, "delta": delta, "withinOnePixel": all(abs(value) <= 1 for value in delta.values())})
            result["referenceBrowser"] = reference["browser"]
        result["passed"] = result["historicalComparison"]["passed"]
        report["profiles"][profile] = result
    report["passed"] = all(value["passed"] for value in report["profiles"].values())
    (output / "report.json").write_text(json.dumps(report, indent=2) + "\n")
    print(json.dumps({"passed": report["passed"], "report": str(output.relative_to(ROOT) / "report.json"),
                      "dimensions": {key: value["historicalComparison"] for key, value in report["profiles"].items()}}, indent=2))
    if not report["passed"]:
        raise SystemExit(1)


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("run_directory", type=Path)
    main(parser.parse_args().run_directory)
