"""Fix image orientations by processing EXIF rotation data"""
import os
from PIL import Image, ImageOps

folder = r"C:\Users\pc\Desktop\gurjas ai\Dr G S GILL WEBSITE"
images = ["hero.jpg", "doctor.jpg", "doctor2.jpg", "doctor3.jpg", 
          "clinic1.jpg", "clinic2.jpg", "clinic3.jpg", "clinic4.jpg", 
          "clinic5.jpg", "og-image.jpg"]

for img_name in images:
    path = os.path.join(folder, img_name)
    if not os.path.exists(path):
        print(f"❌ {img_name} not found")
        continue
    
    try:
        img = Image.open(path)
        # Check EXIF orientation
        exif = img.getexif()
        orientation = exif.get(0x0112, 1)  # 1 = normal
        
        if orientation != 1:
            print(f"🔄 {img_name}: orientation={orientation} -> fixing...")
            # Auto-rotate based on EXIF
            img = ImageOps.exif_transpose(img)
            # Save with corrected orientation (strip EXIF to prevent double-rotation)
            img.save(path, quality=95)
            print(f"   ✅ Fixed!")
        else:
            print(f"✅ {img_name}: orientation normal (1)")
            
    except Exception as e:
        print(f"❌ {img_name}: Error - {e}")

print("\n🎯 All done!")
