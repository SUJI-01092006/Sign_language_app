import os
import re

# Color mappings: old -> new
color_map = {
    '#F4E1D7': '#FCF7F8',  # Background
    '#70161E': '#503156',  # Primary/Headers
    '#D96432': '#A31621',  # CTA/Buttons
    '#c55528': '#8a1319',  # CTA hover
    '#D9A036': '#BCD8C1',  # Accents
    '#4A5D44': '#BCD8C1',  # Accent elements
    '#4A90E2': '#6EA4BF',  # Secondary
    '#E85D8A': '#A31621',  # Teacher dashboard
}

templates_dir = 'templates'
static_dir = 'static'

def update_colors_in_file(filepath):
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
        
        original = content
        for old_color, new_color in color_map.items():
            content = content.replace(old_color, new_color)
            content = content.replace(old_color.lower(), new_color)
        
        if content != original:
            with open(filepath, 'w', encoding='utf-8') as f:
                f.write(content)
            print(f'Updated: {filepath}')
            return True
        return False
    except Exception as e:
        print(f'Error updating {filepath}: {e}')
        return False

# Update all HTML files in templates
updated_count = 0
for filename in os.listdir(templates_dir):
    if filename.endswith('.html'):
        filepath = os.path.join(templates_dir, filename)
        if update_colors_in_file(filepath):
            updated_count += 1

# Update CSS files in static
for filename in os.listdir(static_dir):
    if filename.endswith('.css'):
        filepath = os.path.join(static_dir, filename)
        if update_colors_in_file(filepath):
            updated_count += 1

print(f'\nTotal files updated: {updated_count}')
print('Theme colors updated successfully!')
