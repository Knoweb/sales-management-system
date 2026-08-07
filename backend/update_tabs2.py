import os
import re

tabs_dir = r"d:\Knoweb Projects\Marketing App\sales-management-system\frontend\src\components\projectexecution\tabs"

for filename in os.listdir(tabs_dir):
    if filename.endswith("Tab.tsx"):
        filepath = os.path.join(tabs_dir, filename)
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
            
        # Hide primary action buttons that open modals
        # match: <button onClick={() => { setForm({}); setIsModalVisible(true); }} className="execution-secondary-button">
        content = re.sub(r'(<button[^>]+onClick=\{\(\)\s*=>\s*\{[^}]*setIsModalVisible\(true\)[^}]*\}[^>]*>.*?</button>)', r'{canEdit && \1}', content, flags=re.DOTALL)
        content = re.sub(r'(<button[^>]+onClick=\{\(\)\s*=>\s*setIsModalVisible\(true\)\}[^>]*>.*?</button>)', r'{canEdit && \1}', content, flags=re.DOTALL)
        
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)

print("Done processing tabs pass 2")
