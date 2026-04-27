#!/usr/bin/env python3

from pathlib import Path

from PIL import Image, ImageDraw


ROOT = Path(__file__).resolve().parents[1]
ASSETS_DIR = ROOT / "assets"
LOGO_DIR = ASSETS_DIR / "logo"

INK = "#000000"
TRANSPARENT = (0, 0, 0, 0)


def draw_leaf(draw: ImageDraw.ImageDraw, points):
    draw.polygon(points, fill=INK)


def render_logo(size: int) -> Image.Image:
    image = Image.new("RGBA", (size, size), TRANSPARENT)
    draw = ImageDraw.Draw(image)

    cx = size / 2
    cy = size * 0.62
    body_radius = size * 0.24
    outline_width = max(3, round(size * 0.055))

    outer_body_box = [
        cx - body_radius,
        cy - body_radius,
        cx + body_radius,
        cy + body_radius,
    ]
    inner_radius = body_radius - outline_width
    inner_body_box = [
        cx - inner_radius,
        cy - inner_radius,
        cx + inner_radius,
        cy + inner_radius,
    ]
    draw.ellipse(outer_body_box, fill=INK)
    draw.ellipse(inner_body_box, fill=TRANSPARENT)

    leaf_y = cy - body_radius - size * 0.005
    leaf_span = size * 0.12
    leaf_height = size * 0.075
    draw_leaf(
        draw,
        [
            (cx - size * 0.022, leaf_y),
            (cx - leaf_span, leaf_y - leaf_height * 0.6),
            (cx - leaf_span * 0.56, leaf_y + leaf_height),
        ],
    )
    draw_leaf(
        draw,
        [
            (cx + size * 0.022, leaf_y),
            (cx + leaf_span, leaf_y - leaf_height * 0.6),
            (cx + leaf_span * 0.56, leaf_y + leaf_height),
        ],
    )
    draw.line(
        [
            (cx - size * 0.012, leaf_y - leaf_height * 0.08),
            (cx + size * 0.012, leaf_y - leaf_height * 0.5),
        ],
        fill=INK,
        width=max(2, round(size * 0.024)),
    )

    nib_top = leaf_y - size * 0.14
    nib_mid_y = leaf_y - size * 0.03
    nib_width = size * 0.11
    nib_shoulder = size * 0.04
    draw.polygon(
        [
            (cx, nib_top),
            (cx + nib_width * 0.52, nib_top + size * 0.07),
            (cx + nib_shoulder, nib_mid_y),
            (cx - nib_shoulder, nib_mid_y),
            (cx - nib_width * 0.52, nib_top + size * 0.07),
        ],
        fill=INK,
    )
    slit_width = max(1, round(size * 0.014))
    slit_top = nib_top + size * 0.032
    slit_bottom = nib_top + size * 0.092
    draw.rectangle(
        [cx - slit_width / 2, slit_top, cx + slit_width / 2, slit_bottom],
        fill=TRANSPARENT,
    )

    hand_width = max(2, round(size * 0.05))
    minute_end = (cx + size * 0.12, cy - size * 0.12)
    draw.line([cx, cy, minute_end[0], minute_end[1]], fill=INK, width=hand_width)
    cap_radius = max(2, round(hand_width * 0.52))
    draw.ellipse([cx - cap_radius, cy - cap_radius, cx + cap_radius, cy + cap_radius], fill=INK)

    return image


def main():
    LOGO_DIR.mkdir(parents=True, exist_ok=True)

    large = render_logo(1024)
    large.save(LOGO_DIR / "pomodoro-logo-1024.png")

    medium = render_logo(512)
    medium.save(LOGO_DIR / "pomodoro-logo-512.png")

    small = render_logo(48)
    small.save(ASSETS_DIR / "icon.png")

    print(f"wrote {LOGO_DIR / 'pomodoro-logo-1024.png'}")
    print(f"wrote {LOGO_DIR / 'pomodoro-logo-512.png'}")
    print(f"wrote {ASSETS_DIR / 'icon.png'}")


if __name__ == "__main__":
    main()
