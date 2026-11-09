"""Draw an exact, authored teaching diagram. No provider or image-model call."""
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont

root = Path(__file__).resolve().parents[2]
font = root / "apps/agentproof/src/Inter.ttf"
image = Image.new("RGB", (1200, 900), "#102f43")
draw = ImageDraw.Draw(image)

def label(x, y, text, size, color="#f5f9fc"):
    draw.text((x, y), text, font=ImageFont.truetype(str(font), size), fill=color)

label(70, 70, "RELIABLE VOICE AGENTS", 27, "#83d7cd")
label(70, 128, "Facts before decisions.", 62)
label(70, 223, "A learning workflow using fictional shipment records.", 27, "#c2d4df")
for y, number, title, body in [
    (325, "1", "Look up the exact reference", "A missing record stays unknown."),
    (475, "2", "Check the source and tool result", "Untrusted instructions cannot override policy."),
    (625, "3", "Preserve human approval", "The assistant cannot release a shipment."),
]:
    draw.rounded_rectangle((70, y, 1130, y + 120), radius=18, fill="#f5f9fc")
    draw.ellipse((96, y + 28, 158, y + 90), fill="#147c78")
    label(114, y + 36, number, 34)
    label(185, y + 18, title, 33, "#102f43")
    label(185, y + 65, body, 25, "#426073")
label(70, 806, "Original HarborVoice diagram · independent educational material", 23, "#c2d4df")
image.save(root / "public/recognition/learning-boundaries.png", optimize=True)
