import json
import os
import shutil

JSON_FILE = 'items.json'
OUTPUT_DIR = 'images'

PRIORITIES = [
    '_1.PNG', '_0.PNG', '_2.PNG', '_3.PNG',
    '_1.png', '_0.png', '_2.png', '_3.png'
]

def copy_icons():
    if not os.path.exists(JSON_FILE):
        print(f"Cannot find {JSON_FILE}.")
        return

    with open(JSON_FILE, 'r', encoding='utf-8') as f:
        items = json.load(f)

    print(f"Found {len(items)} items. Starting to copy images...\n")

    success_count = 0
    missing_count = 0

    for item in items:
        icon_path = item.get('icon', '')
        if not icon_path:
            continue

        base_path = os.path.splitext(icon_path)[0]
        base_path = os.path.normpath(base_path)

        found_file = None
        for suffix in PRIORITIES:
            test_path = base_path + suffix
            if os.path.exists(test_path):
                found_file = test_path
                break

        if found_file:
            clean_icon_path = os.path.splitext(icon_path)[0] + '.png'
            dest_path = os.path.normpath(os.path.join(OUTPUT_DIR, clean_icon_path))
            dest_dir = os.path.dirname(dest_path)

            if os.path.isdir(dest_path):
                shutil.rmtree(dest_path)

            os.makedirs(dest_dir, exist_ok=True)

            shutil.copy2(found_file, dest_path)
            success_count += 1
        else:
            missing_count += 1

    print("=== Copy Complete ===")
    print(f"Successfully copied icons: {success_count} (Saved to: ./{OUTPUT_DIR}/)")
    if missing_count > 0:
        print(f"Missing icons: {missing_count} (Check the path or filename)")

if __name__ == "__main__":
    copy_icons()
    