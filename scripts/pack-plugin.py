"""Build the Chestnut Cat plugin zip for Chestnut Editor import."""
from __future__ import annotations

import json
import zipfile
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
MANIFEST_PATH = ROOT / "plugin" / "manifest.json"


def main() -> None:
    manifest = json.loads(MANIFEST_PATH.read_text(encoding="utf-8"))
    plugin_id = manifest["id"]
    version = manifest["version"]
    out_dir = ROOT / "dist"
    out_dir.mkdir(exist_ok=True)
    out_path = out_dir / f"{plugin_id}-{version}.zip"

    files = [
        (ROOT / "plugin" / "manifest.json", "manifest.json"),
        (ROOT / "plugin" / "main.js", "main.js"),
        (ROOT / "web" / "widget.js", "widget.js"),
        (ROOT / "web" / "widget.css", "widget.css"),
        (ROOT / "assets" / "Ya1.mp3", "Ya1.mp3"),
        (ROOT / "assets" / "Ya2.mp3", "Ya2.mp3"),
    ]
    expr = ROOT / "assets" / "expr"
    pngs = sorted(expr.glob("*.png"))
    if not pngs:
        raise SystemExit(f"No PNGs in {expr}")
    files.extend((png, f"expr/{png.name}") for png in pngs)

    missing = [str(src) for src, _ in files if not src.is_file()]
    if missing:
        raise SystemExit("Missing files:\n" + "\n".join(missing))

    with zipfile.ZipFile(out_path, "w", compression=zipfile.ZIP_DEFLATED) as zf:
        for src, dest in files:
            zf.write(src, dest)

    names = zipfile.ZipFile(out_path).namelist()
    leaked = [n for n in names if n.startswith(("expr-v1/", "expr-moe/", "refs/"))]
    if leaked:
        out_path.unlink(missing_ok=True)
        raise SystemExit("Zip leaked archive/reference files:\n" + "\n".join(leaked))

    print(f"Wrote {out_path} ({out_path.stat().st_size} bytes, {len(files)} files)")
    print(f"Packed {len(pngs)} expr PNGs; skipped assets/expr-v1 (archive only)")


if __name__ == "__main__":
    main()
