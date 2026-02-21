import os
import re

files_to_revert = [
    'templates/landing.html',
    'templates/admin_dashboard.html',
    'templates/teacher_dashboard.html',
    'templates/parent_dashboard.html',
    'templates/home.html',
    'templates/learning.html',
    'templates/index.html',
    'templates/upload.html',
    'templates/login.html',
    'templates/signup.html',
    'static/style.css',
    'static/learning-style.css'
]

replacements = [
    # Revert solid backgrounds to gradients
    (r'background:\s*#6EA4BF;', 'background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);'),
    (r'background:\s*#E8F4F8;', 'background: white;'),
    
    # Revert borders to box-shadows
    (r'border:\s*2px\s+solid\s+#BCD8C1;', 'box-shadow: 0 4px 6px rgba(0,0,0,0.1);'),
    (r'border:\s*2px\s+solid\s+#6EA4BF;', 'box-shadow: 0 4px 6px rgba(0,0,0,0.1);'),
]

for file_path in files_to_revert:
    full_path = os.path.join('d:\\demo model ai', file_path)
    if os.path.exists(full_path):
        with open(full_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        original_content = content
        for pattern, replacement in replacements:
            content = re.sub(pattern, replacement, content)
        
        if content != original_content:
            with open(full_path, 'w', encoding='utf-8') as f:
                f.write(content)
            print(f"[OK] Reverted: {file_path}")
        else:
            print(f"[SKIP] No changes: {file_path}")
    else:
        print(f"[ERROR] Not found: {file_path}")

print("\nCard styling reverted to gradients and shadows!")
