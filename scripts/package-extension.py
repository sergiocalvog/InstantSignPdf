import os
import sys
import zipfile

# Ensure utf-8 encoding for console output on Windows
if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

dist_dir = 'dist'
zip_filename = 'instantsign-chrome-extension.zip'

if not os.path.exists(dist_dir):
    print("Error: dist directory does not exist. Run 'npm run build' first.")
    exit(1)

with zipfile.ZipFile(zip_filename, 'w', zipfile.ZIP_DEFLATED) as zipf:
    for root, dirs, files in os.walk(dist_dir):
        for file in files:
            file_path = os.path.join(root, file)
            # Use forward slashes exclusively for Chrome Web Store zip standard
            arcname = os.path.relpath(file_path, dist_dir).replace('\\', '/')
            zipf.write(file_path, arcname)

size_mb = os.path.getsize(zip_filename) / (1024 * 1024)
print(f"[OK] Success! Created {zip_filename} ({size_mb:.2f} MB)")
print("[OK] All zip entry paths normalized for Chrome Web Store Developer Dashboard.")
