from __future__ import annotations

import argparse
import subprocess
import uuid
from pathlib import Path


def convert_one(
    ffmpeg: Path,
    source: Path,
    output: Path,
    max_size: int,
    similarity: float,
    blend: float,
    quality: int,
) -> None:
    scale_filter = (
        f"scale='if(gt(iw,ih),{max_size},-2)':'if(gt(iw,ih),-2,{max_size})':flags=lanczos,"
        f"format=rgba,colorkey=0x000000:{similarity}:{blend}"
    )
    output.parent.mkdir(parents=True, exist_ok=True)
    temp_output = output.parents[3] / f".neko-webm-alpha-{uuid.uuid4().hex}.webp"
    subprocess.run(
        [
            str(ffmpeg),
            "-hide_banner",
            "-loglevel",
            "error",
            "-y",
            "-i",
            str(source),
            "-an",
            "-vf",
            scale_filter,
            "-loop",
            "0",
            "-c:v",
            "libwebp_anim",
            "-pix_fmt",
            "yuva420p",
            "-lossless",
            "0",
            "-compression_level",
            "5",
            "-q:v",
            str(quality),
            str(temp_output),
        ],
        check=True,
    )
    if output.exists():
        output.unlink()
    temp_output.replace(output)


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--ffmpeg", required=True, type=Path)
    parser.add_argument("--root", default=".", type=Path)
    parser.add_argument("--similarity", default=0.045, type=float)
    parser.add_argument("--blend", default=0.04, type=float)
    parser.add_argument("--quality", default=76, type=int)
    parser.add_argument("--suffix", default="-alpha", help="Suffix before .webp")
    args = parser.parse_args()

    root = args.root.resolve()
    webms = sorted(root.glob("imgs/characters/Amins/*.webm"))
    webms += sorted(root.glob("imgs/characters/Q/Anims/*.webm"))
    if not webms:
        raise RuntimeError("No WebM files found")

    for source in webms:
        rel = source.relative_to(root).as_posix()
        if "/Q/Anims/" in rel:
            max_size = 520
        elif "/3C-Pics/" in rel:
            max_size = 960
        else:
            max_size = 720

        output = source.with_name(f"{source.stem}{args.suffix}.webp")
        convert_one(
            args.ffmpeg,
            source,
            output,
            max_size=max_size,
            similarity=args.similarity,
            blend=args.blend,
            quality=args.quality,
        )
        size_mb = output.stat().st_size / (1024 * 1024)
        print(f"{rel} -> {output.name} ({size_mb:.1f} MB)")


if __name__ == "__main__":
    main()
