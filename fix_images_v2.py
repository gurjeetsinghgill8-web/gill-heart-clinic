"""Fix images: strip EXIF so browsers display raw pixel data correctly"""
import os
from PIL import Image

folder = r"C:\Users\pc\Desktop\gurjas ai\Dr G S GILL WEBSITE"

images = ["hero.jpg","doctor.jpg","doctor2.jpg","doctor3.jpg",
          "clinic1.jpg","clinic2.jpg","clinic3.jpg","clinic4.jpg",
          "clinic5.jpg","og-image.jpg"]

for img_name in images:
    path = os.path.join(folder, img_name)
    img = Image.open(path)
    w, h = img.size
    print(f"{img_name}: {w}x{h}")
    
    # Read current pixels
    pixels = list(img.getdata())
    
    # Create new image with same data but NO EXIF
    clean = Image.new(img.mode, (w, h))
    clean.putdata(pixels)
    clean.save(path, quality=92)
    print(f"  ✅ EXIF stripped, saved as {w}x{h}")

print("\n✅ All done - EXIF stripped from all images")
