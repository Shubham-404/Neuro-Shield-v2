import os
import sys

path = r'd:\Neuro-Shield\controllers\patient.controller.js'
new_path = r'd:\Neuro-Shield\controllers\patient.controller.fixed.js'

try:
    print(f"Reading {path}...")
    with open(path, 'r', encoding='utf-8') as f:
        lines = f.readlines()
    
    print(f"Read {len(lines)} lines.")
    if len(lines) <= 534:
        print("File is already short enough.")
    else:
        new_lines = lines[:534]
        print(f"Writing {len(new_lines)} lines to {new_path}...")
        with open(new_path, 'w', encoding='utf-8') as f:
            f.writelines(new_lines)
        
        print("Replacing original file...")
        try:
            os.replace(new_path, path)
            print("Success!")
        except OSError as e:
            print(f"Replace failed: {e}")
            # Try removing first
            try:
                os.remove(path)
                os.rename(new_path, path)
                print("Success after remove!")
            except OSError as e2:
                print(f"Remove/Rename failed: {e2}")

except Exception as e:
    print(f"Error: {e}")
