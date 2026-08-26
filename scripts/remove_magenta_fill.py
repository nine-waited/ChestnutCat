"""Remove leftover dark-magenta chroma fills.

Only those pixels are changed: they become fully transparent, matching the
already-keyed background. Outlines and every other color are left byte-identical.
"""

from __future__ import annotations

from pathlib import Path

import numpy as np
from PIL import Image

# Dark fuchsia leftover, e.g. (148, 16, 93) and edge maroon (110, 15, 37).
# Brown outlines are G>B (e.g. 78, 30, 5) and are excluded by B >= G + 12.


def hsv(rgb: np.ndarray) -> tuple[np.ndarray, np.ndarray, np.ndarray]:
    arr = rgb.astype(np.float32) / 255.0
    red, green, blue = arr[:, :, 0], arr[:, :, 1], arr[:, :, 2]
    mx = np.maximum(np.maximum(red, green), blue)
    mn = np.minimum(np.minimum(red, green), blue)
    diff = mx - mn
    hue = np.zeros_like(mx)
    valid = diff > 1e-6
    match_r = (mx == red) & valid
    hue[match_r] = ((green[match_r] - blue[match_r]) / diff[match_r]) % 6
    match_g = (mx == green) & valid
    hue[match_g] = (blue[match_g] - red[match_g]) / diff[match_g] + 2
    match_b = (mx == blue) & valid
    hue[match_b] = (red[match_b] - green[match_b]) / diff[match_b] + 4
    hue *= 60.0
    sat = np.zeros_like(mx)
    sat[mx > 1e-6] = diff[mx > 1e-6] / mx[mx > 1e-6]
    return hue, sat, mx


def magenta_fill_mask(pixels: np.ndarray) -> np.ndarray:
    rgb = pixels[:, :, :3].astype(np.int16)
    hue, sat, val = hsv(pixels[:, :, :3])
    opaque = pixels[:, :, 3] > 0
    fuchsia = (
        opaque
        & (hue >= 295.0)
        & (hue <= 340.0)
        & (sat >= 0.40)
        & (val >= 0.20)
        & (rgb[:, :, 2] >= rgb[:, :, 1] + 30)
        & (rgb[:, :, 0] >= rgb[:, :, 1] + 60)
        & (rgb[:, :, 2] >= 40)
    )
    # Darker magenta fringe along the cutout; still B>G so brown strokes stay.
    maroon = (
        opaque
        & (rgb[:, :, 0] >= 70)
        & (rgb[:, :, 1] <= 55)
        & (rgb[:, :, 2] >= rgb[:, :, 1] + 12)
        & (rgb[:, :, 0] >= rgb[:, :, 1] + 40)
        & (sat >= 0.30)
    )
    return fuchsia | maroon


def clean_file(path: Path) -> int:
    original = np.array(Image.open(path).convert("RGBA"))
    mask = magenta_fill_mask(original)
    count = int(mask.sum())
    if not count:
        return 0
    pixels = original.copy()
    pixels[mask] = (0, 0, 0, 0)
    unchanged = ~mask
    if not np.array_equal(pixels[unchanged], original[unchanged]):
        raise RuntimeError(f"{path.name}: non-magenta pixels were modified")
    Image.fromarray(pixels).save(path)
    return count


def main() -> None:
    folder = Path(__file__).resolve().parents[1] / "assets" / "expr"
    total = 0
    for path in sorted(folder.glob("*.png")):
        count = clean_file(path)
        leftover = int(magenta_fill_mask(np.array(Image.open(path).convert("RGBA"))).sum())
        total += count
        print(f"{path.name}: removed {count}, leftover {leftover}")
    print(f"total removed {total}")


if __name__ == "__main__":
    main()
