"""Fill transparent and magenta holes inside sprites; keep edge-connected background."""

from __future__ import annotations

from collections import deque
from pathlib import Path

import numpy as np
from PIL import Image

CHROMA = np.array([255, 0, 255], dtype=np.int32)
MAGENTA_MAX = 100.0
SHIFTS = ((-1, 0), (1, 0), (0, -1), (0, 1), (-1, -1), (-1, 1), (1, -1), (1, 1))


def chroma_distance(rgb: np.ndarray) -> np.ndarray:
    delta = rgb.astype(np.int32) - CHROMA
    return np.sqrt(np.sum(delta.astype(np.float32) ** 2, axis=2))


def inpaint(pixels: np.ndarray, holes: np.ndarray) -> np.ndarray:
    output = pixels.copy()
    dist = chroma_distance(output[:, :, :3])
    rgb = output[:, :, :3].astype(np.int16)
    purple = (
        (rgb[:, :, 0] >= 160)
        & (rgb[:, :, 2] >= 130)
        & (rgb[:, :, 1] <= 85)
        & (rgb[:, :, 2] >= rgb[:, :, 1] + 40)
    )
    filled = (~holes) & (output[:, :, 3] > 0) & (dist > MAGENTA_MAX) & (~purple)
    remaining = holes.copy()
    for _ in range(160):
        if not remaining.any():
            break
        acc = np.zeros(output.shape, dtype=np.float32)
        count = np.zeros(remaining.shape, dtype=np.float32)
        for dy, dx in SHIFTS:
            src = np.roll(np.roll(output, dy, axis=0), dx, axis=1)
            ok = np.roll(np.roll(filled, dy, axis=0), dx, axis=1)
            acc += src * ok[:, :, None]
            count += ok
        ready = remaining & (count > 0)
        if not ready.any():
            break
        output[ready] = (acc[ready] / count[ready, None]).astype(np.uint8)
        output[ready, 3] = 255
        filled |= ready
        remaining &= ~ready
    if remaining.any():
        output[remaining, 3] = 255
    return output


def flood_passable(passable: np.ndarray) -> np.ndarray:
    height, width = passable.shape
    background = np.zeros((height, width), dtype=bool)
    queue: deque[tuple[int, int]] = deque()
    for x in range(width):
        for y in (0, height - 1):
            if passable[y, x]:
                background[y, x] = True
                queue.append((x, y))
    for y in range(height):
        for x in (0, width - 1):
            if passable[y, x] and not background[y, x]:
                background[y, x] = True
                queue.append((x, y))
    while queue:
        x, y = queue.popleft()
        for dx, dy in ((-1, 0), (1, 0), (0, -1), (0, 1)):
            nx, ny = x + dx, y + dy
            if 0 <= nx < width and 0 <= ny < height and passable[ny, nx] and not background[ny, nx]:
                background[ny, nx] = True
                queue.append((nx, ny))
    return background


def cleanup_file(path: Path) -> tuple[int, int, int]:
    pixels = np.array(Image.open(path).convert("RGBA"))
    dist = chroma_distance(pixels[:, :, :3])
    magenta = dist <= MAGENTA_MAX
    passable = (pixels[:, :, 3] == 0) | magenta
    background = flood_passable(passable)

    keyed = int((background & magenta).sum())
    pixels[background, 3] = 0
    pixels[background, :3] = 0

    dist = chroma_distance(pixels[:, :, :3])
    interior_magenta = (dist <= MAGENTA_MAX) & (pixels[:, :, 3] > 0)
    restored_magenta = int(interior_magenta.sum())
    if interior_magenta.any():
        pixels = inpaint(pixels, interior_magenta)

    alpha = pixels[:, :, 3] > 0
    closed = alpha.copy()
    for _ in range(2):
        grown = closed.copy()
        for dy, dx in SHIFTS:
            grown |= np.roll(np.roll(closed, dy, axis=0), dx, axis=1)
        closed = grown
    for _ in range(2):
        shrunk = np.ones_like(closed)
        for dy, dx in SHIFTS:
            shrunk &= np.roll(np.roll(closed, dy, axis=0), dx, axis=1)
        closed = shrunk
    small_holes = closed & (~alpha)
    closed_count = int(small_holes.sum())
    if small_holes.any():
        pixels = inpaint(pixels, small_holes)

    Image.fromarray(pixels).save(path)
    return keyed, restored_magenta, closed_count


def purple_mask(pixels: np.ndarray) -> np.ndarray:
    rgb = pixels[:, :, :3].astype(np.int16)
    return (
        (pixels[:, :, 3] > 0)
        & (rgb[:, :, 0] >= 140)
        & (rgb[:, :, 2] >= 110)
        & (rgb[:, :, 1] <= 110)
        & (rgb[:, :, 2] >= rgb[:, :, 1] + 20)
    )


def fill_purple_file(path: Path) -> int:
    pixels = np.array(Image.open(path).convert("RGBA"))
    mask = purple_mask(pixels)
    count = int(mask.sum())
    if count:
        pixels = inpaint(pixels, mask)
        Image.fromarray(pixels).save(path)
    return count


def main() -> None:
    folder = Path(__file__).resolve().parents[1] / "assets" / "expr"
    for path in sorted(folder.glob("*.png")):
        count = fill_purple_file(path)
        print(f"{path.name}: filled leftover purple {count}")


if __name__ == "__main__":
    main()
