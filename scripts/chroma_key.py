"""Remove only background magenta connected to the image edge."""

from __future__ import annotations

from collections import deque
from pathlib import Path

import numpy as np
from PIL import Image

CHROMA = np.array([255, 0, 255], dtype=np.int32)
THRESHOLD = 42.0


def chroma_distance(rgb: np.ndarray) -> np.ndarray:
    delta = rgb.astype(np.int32) - CHROMA
    return np.sqrt(np.sum(delta.astype(np.float32) ** 2, axis=2))


def key_file(path: Path) -> None:
    pixels = np.array(Image.open(path).convert("RGBA"))
    height, width = pixels.shape[:2]
    near = chroma_distance(pixels[:, :, :3]) <= THRESHOLD
    background = np.zeros((height, width), dtype=bool)
    queue: deque[tuple[int, int]] = deque()
    for x in range(width):
        for y in (0, height - 1):
            if near[y, x]:
                background[y, x] = True
                queue.append((x, y))
    for y in range(height):
        for x in (0, width - 1):
            if near[y, x] and not background[y, x]:
                background[y, x] = True
                queue.append((x, y))
    while queue:
        x, y = queue.popleft()
        for dx, dy in ((-1, 0), (1, 0), (0, -1), (0, 1)):
            nx, ny = x + dx, y + dy
            if 0 <= nx < width and 0 <= ny < height and near[ny, nx] and not background[ny, nx]:
                background[ny, nx] = True
                queue.append((nx, ny))
    pixels[background, 3] = 0
    pixels[background, :3] = 0
    Image.fromarray(pixels).save(path)


def main() -> None:
    folder = Path(__file__).resolve().parents[1] / "assets" / "expr"
    for path in sorted(folder.glob("*.png")):
        key_file(path)
        print(f"keyed {path.name}")


if __name__ == "__main__":
    main()
