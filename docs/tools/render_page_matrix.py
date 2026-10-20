"""Render the human page matrix from the working route register."""
import collections
import json
from pathlib import Path
from urllib.parse import unquote, urlsplit

DOCS = Path(__file__).resolve().parents[1]


def cell(value):
    return str(value).replace("|", "\\|").replace("\n", " ")


def main():
    source = DOCS / "registers/routes.json"
    data = json.loads(source.read_text(encoding="utf-8"))
    routes = data["routes"]
    counts = collections.Counter(r["plan"]["disposition"] for r in routes)
    accepted = sum(r["progress"]["acceptance"]["status"] == "accepted" for r in routes)
    lines = [
        "# Page-by-page migration matrix", "",
        "Generated from [routes.json](routes.json) by [render_page_matrix.py](../tools/render_page_matrix.py). Do not hand-edit this table.", "",
        f"Baseline: `{data['baseline_id']}`. Routes: **{len(routes)}**. Accepted replacement routes: **{accepted}**.", "",
        "Template families and locale hints are provisional until inspected. The HTTP column is the original response, not a new-site test result. D/T/M link to the archived desktop/tablet/mobile PNGs. For a redirect they show the final destination. Individual implementation, visual, content, SEO, behavior and acceptance states/evidence live in the JSON register.", "",
        "Default dispositions: " + ", ".join(f"{k}: {v}" for k, v in sorted(counts.items())) + ". Existing 200/noindex pages remain in scope.", "",
        "| Route ID | Public path | Candidate family | HTTP / robots | Baseline | Final acceptance |",
        "| --- | --- | --- | --- | --- | --- |",
    ]
    for route in routes:
        observed, plan = route["observed"], route["plan"]
        path = unquote(urlsplit(route["url"]).path)
        if observed["query"]:
            path += "?" + observed["query"]
        shots = route["baseline"]["screenshots"]
        links = " / ".join(f"[{label}]({shots[profile]})" for profile, label in [("desktop", "D"), ("tablet", "T"), ("mobile", "M")])
        robots = "noindex" if "noindex" in observed["robots"] else "not-noindex" if observed["initial_status"] == 200 else "status rule"
        lines.append("| " + " | ".join([
            f"`{route['id']}`", f"[{cell(path)}]({route['url']})",
            cell(plan["candidate_template_family"]), f"{observed['initial_status']} / {robots}",
            links, route["progress"]["acceptance"]["status"],
        ]) + " |")
    lines += ["", "## Reading the matrix", "",
              "`not-noindex` reports only the captured directive; it does not assert Google indexing or automatic sitemap eligibility. A retained page still requires content, canonical, language and visual review. All initial acceptance states are uncompleted application work, even though the original archive passed integrity checks.", "",
              "Use the [legacy register](legacy-rules.json) for the full configured-rule set, including sources not found by link crawling. Record intended corrections through the [decision register](decisions.md), retaining the original observation.", ""]
    target = DOCS / "registers/page-matrix.md"
    target.write_text("\n".join(lines), encoding="utf-8")
    print(json.dumps({"matrix": str(target), "routes": len(routes), "accepted": accepted}))


if __name__ == "__main__":
    main()
