import os

tabs_dir = r"d:\Knoweb Projects\Marketing App\sales-management-system\frontend\src\components\projectexecution\tabs"

for filename in os.listdir(tabs_dir):
    if filename.endswith("Tab.tsx"):
        filepath = os.path.join(tabs_dir, filename)
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
            
        # Replace the specific button pattern
        if "setIsModalVisible(true)" in content:
            # We want to replace <button ... setIsModalVisible(true) ... </button>
            import re
            content = re.sub(r'(<button\s+onClick=\{\(\)\s*=>\s*\{?\s*[^}]*setIsModalVisible\(true\)[^}]*\}?\}.*?</button>)', r'{canEdit && \1}', content, flags=re.DOTALL)
            
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)

print("Done processing tabs pass 3")
