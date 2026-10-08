import os
from PIL import Image, ImageDraw, ImageFont

# Dimensions
WIDTH = 1400
HEIGHT = 560

# Base image (RGB - 24 bits, NO alpha)
img = Image.new("RGB", (WIDTH, HEIGHT), color=(15, 23, 42)) # Slate 900
draw = ImageDraw.Draw(img)

# Background gradient / decorative shapes
for y in range(HEIGHT):
    # subtle gradient from #0f172a (15,23,42) to #1e1b4b (30,27,75)
    r = int(15 + (30 - 15) * (y / HEIGHT))
    g = int(23 + (27 - 23) * (y / HEIGHT))
    b = int(42 + (75 - 42) * (y / HEIGHT))
    draw.line([(0, y), (WIDTH, y)], fill=(r, g, b))

# Add soft radial-like decorative circles in background
overlay = Image.new("RGBA", (WIDTH, HEIGHT), (0, 0, 0, 0))
overlay_draw = ImageDraw.Draw(overlay)

# Glow on top left
overlay_draw.ellipse([(-100, -100), (500, 500)], fill=(59, 130, 246, 35))
# Glow on center right
overlay_draw.ellipse([(850, 60), (1450, 600)], fill=(99, 102, 241, 40))

# Fonts (use standard Windows system fonts)
def get_font(name, size):
    fonts_dir = "C:/Windows/Fonts"
    path = os.path.join(fonts_dir, name)
    if os.path.exists(path):
        return ImageFont.truetype(path, size)
    return ImageFont.load_default()

font_title = get_font("segoeui.ttf", 52)
font_title_bold = get_font("segoeuib.ttf", 54)
font_subtitle = get_font("segoeuil.ttf", 26)
font_badge = get_font("segoeuib.ttf", 18)
font_small = get_font("segoeui.ttf", 16)

# Load and paste App Icon (with alpha blending onto overlay)
icon_path = "public/icons/icon128.png"
if os.path.exists(icon_path):
    icon = Image.open(icon_path).convert("RGBA")
    icon = icon.resize((110, 110), Image.Resampling.LANCZOS)
    overlay.paste(icon, (80, 110), icon)

# Title & Subtitle
overlay_draw.text((215, 115), "InstantSign PDF", font=font_title_bold, fill=(255, 255, 255, 255))
overlay_draw.text((215, 180), "Private & Offline Document Signer", font=font_subtitle, fill=(147, 197, 253, 255)) # blue-300

# Badges (Client-Side, No Servers, Instant & Free)
badges = [
    ("🔒  100% Client-Side Privacy", (30, 58, 138, 200), (191, 219, 254)),
    ("⚡  Zero Server Uploads", (17, 24, 39, 220), (226, 232, 240)),
    ("✍️  Draw, Type & Stamp Dates", (17, 24, 39, 220), (226, 232, 240)),
    ("🚀  100% Free & Open", (17, 24, 39, 220), (226, 232, 240))
]

bx = 80
by = 265
for text, bg_color, text_color in badges:
    # draw pill
    bbox = font_badge.getbbox(text)
    w = bbox[2] - bbox[0] + 36
    h = 42
    overlay_draw.rounded_rectangle([bx, by, bx + w, by + h], radius=21, fill=bg_color, outline=(96, 165, 250, 120), width=1)
    overlay_draw.text((bx + 18, by + 8), text, font=font_badge, fill=text_color)
    bx += w + 16
    if bx > 650:
        bx = 80
        by += 56

# Right side: Load and showcase a preview screenshot framed nicely
preview_path = "store-assets/screenshot-2-editor-1280x800.png"
if not os.path.exists(preview_path):
    preview_path = "store-assets/screenshot-1-upload-1280x800.png"

if os.path.exists(preview_path):
    preview = Image.open(preview_path).convert("RGBA")
    # Target size: width around 580px, height proportional
    pw = 560
    ph = int(pw * (800 / 1280)) # 350px
    preview = preview.resize((pw, ph), Image.Resampling.LANCZOS)
    
    # Shadow and border for the preview card
    px = 760
    py = 105
    # Shadow
    for s in range(12, 0, -2):
        overlay_draw.rounded_rectangle([px - s, py - s, px + pw + s, py + ph + s], radius=16, fill=(0, 0, 0, int(15 * (13 - s)/12)))
    
    # Border
    overlay_draw.rounded_rectangle([px - 4, py - 4, px + pw + 4, py + ph + 4], radius=12, fill=(30, 41, 59, 255), outline=(99, 102, 241, 180), width=2)
    overlay.paste(preview, (px, py), preview)

# Merge overlay onto RGB image
img.paste(Image.alpha_composite(Image.new("RGBA", (WIDTH, HEIGHT), (0,0,0,0)), overlay), (0, 0), overlay)

# Final guarantee: convert strictly to RGB (24 bits, no alpha channel)
final_rgb = img.convert("RGB")
output_path = "store-assets/marquee-promo-1400x560.png"
final_rgb.save(output_path, "PNG")
print(f"Generated successfully: {output_path} | Size: {final_rgb.size} | Mode: {final_rgb.mode}")
