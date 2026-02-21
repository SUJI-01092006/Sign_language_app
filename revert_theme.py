import os
import re

files_to_revert = [
    'templates/landing.html',
    'templates/admin_dashboard.html',
    'templates/teacher_dashboard.html',
    'templates/parent_dashboard.html',
    'templates/index.html',
    'templates/learning.html',
    'templates/login.html',
    'templates/signup.html',
    'static/theme.css',
    'static/learning-style.css',
    'static/dashboard-style.css'
]

# Reverse the color mappings
color_replacements = [
    ('#FCF7F8', '#f5f5f5'),  # Background
    ('#503156', '#667eea'),  # Primary
    ('#A31621', '#ff6b6b'),  # CTA
    ('#BCD8C1', '#4ecdc4'),  # Accent
    ('#6EA4BF', '#45b7d1'),  # Secondary
]

for file_path in files_to_revert:
    full_path = os.path.join('d:\\demo model ai', file_path)
    if os.path.exists(full_path):
        with open(full_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        original_content = content
        for new_color, old_color in color_replacements:
            content = content.replace(new_color, old_color)
        
        if content != original_content:
            with open(full_path, 'w', encoding='utf-8') as f:
                f.write(content)
            print(f"[OK] Reverted: {file_path}")
        else:
            print(f"[SKIP] No changes: {file_path}")
    else:
        print(f"[ERROR] Not found: {file_path}")

print("\nTheme colors reverted to original!")
