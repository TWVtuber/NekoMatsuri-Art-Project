from pathlib import Path
from PIL import Image, ImageOps


ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / "imgs" / "works"
OUTPUT = ROOT / "imgs" / "work-thumbs"
SUPPORTED = {".jpg", ".jpeg", ".png", ".webp"}
MAX_SIZE = (1200, 1200)


for source in SOURCE.rglob("*"):
    if not source.is_file() or source.suffix.lower() not in SUPPORTED:
        continue

    relative = source.relative_to(SOURCE).with_suffix(".webp")
    target = OUTPUT / relative
    target.parent.mkdir(parents=True, exist_ok=True)

    with Image.open(source) as image:
        image = ImageOps.exif_transpose(image)
        image.thumbnail(MAX_SIZE, Image.Resampling.LANCZOS)
        if image.mode not in ("RGB", "RGBA"):
            image = image.convert("RGBA" if "transparency" in image.info else "RGB")
        image.save(target, "WEBP", quality=82, method=6)
