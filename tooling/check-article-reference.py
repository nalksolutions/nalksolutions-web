"""Reject incomplete recovered reference captures before pixel comparison."""
import argparse
import json
from pathlib import Path

from capture_integrity import reference_integrity

ROOT = Path(__file__).resolve().parents[1]


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('directory', type=Path)
    parser.add_argument('--report', type=Path)
    args = parser.parse_args()
    directory = args.directory.resolve()
    report = (args.report or directory.parent / 'reference-integrity.json').resolve()
    if not all(path.is_relative_to(ROOT / 'tmp') for path in [directory, report]):
        raise ValueError('Reference and report must stay inside workspace tmp')
    result = reference_integrity(directory)
    report.parent.mkdir(parents=True, exist_ok=True)
    report.write_text(json.dumps(result, indent=2) + '\n')
    print(json.dumps(result))
    raise SystemExit(0 if result['passed'] else 1)


if __name__ == '__main__':
    main()
