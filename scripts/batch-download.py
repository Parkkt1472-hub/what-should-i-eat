#!/usr/bin/env python3
import subprocess
import sys

# Read URL mapping
urls = {}
with open('scripts/all-image-urls.txt', 'r') as f:
    for line in f:
        if '=' in line:
            menu, url_id = line.strip().split('=')
            urls[menu] = url_id

print(f"📥 Downloading {len(urls)} menu images...")
print("=" * 60)

success_count = 0
failed = []

for idx, (menu, url_id) in enumerate(urls.items(), 1):
    url = f"https://www.genspark.ai/api/files/s/{url_id}"
    output_path = f"public/menus/{menu}.jpg"
    
    print(f"[{idx}/{len(urls)}] {menu}...", end=" ", flush=True)
    
    try:
        result = subprocess.run(
            ['curl', '-sL', url, '-o', output_path],
            capture_output=True,
            timeout=30
        )
        if result.returncode == 0:
            # Check file size
            size_result = subprocess.run(
                ['stat', '-f', '%z', output_path],
                capture_output=True,
                text=True
            )
            if size_result.returncode != 0:
                # Linux stat format
                size_result = subprocess.run(
                    ['stat', '-c', '%s', output_path],
                    capture_output=True,
                    text=True
                )
            
            size = int(size_result.stdout.strip())
            if size > 1000:  # More than 1KB
                print(f"✅ {size // 1024}KB")
                success_count += 1
            else:
                print(f"⚠️ Too small ({size}B)")
                failed.append(menu)
        else:
            print("❌ Failed")
            failed.append(menu)
    except Exception as e:
        print(f"❌ Error: {e}")
        failed.append(menu)

print("=" * 60)
print(f"✅ Successfully downloaded: {success_count}/{len(urls)}")
if failed:
    print(f"❌ Failed: {len(failed)} - {', '.join(failed[:5])}")
print("=" * 60)
