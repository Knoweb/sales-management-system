import os
import re

tabs_dir = r"d:\Knoweb Projects\Marketing App\sales-management-system\frontend\src\components\projectexecution\tabs"

for filename in os.listdir(tabs_dir):
    if filename.endswith("Tab.tsx"):
        filepath = os.path.join(tabs_dir, filename)
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
            
        # Add canEdit?: boolean; to Props interface
        if "canEdit?:" not in content and "interface Props" in content:
            content = re.sub(r'interface Props\s*\{([^}]+)\}', r'interface Props {\1 canEdit?: boolean; }', content)
        
        # Add canEdit = true to component destructuring
        if "canEdit = true" not in content:
            content = re.sub(r'(const \w+\s*:\s*React\.FC<Props>\s*=\s*\(\{\s*workspaceId\s*,\s*onRefreshSummary)\s*\}\)', r'\1, canEdit = true })', content)
        
        # Hide primary action buttons that open modals
        content = re.sub(r'(<button[^>]+onClick=\{\(\)\s*=>\s*\{?\s*set\w*\(\w*\);\s*setIsModalVisible\(true\)\}?[^>]*>.*?</button>)', r'{canEdit && \1}', content, flags=re.DOTALL)
        content = re.sub(r'(<button[^>]+onClick=\{\(\)\s*=>\s*setIsModalVisible\(true\)\}[^>]*>.*?</button>)', r'{canEdit && \1}', content, flags=re.DOTALL)
        content = re.sub(r'(<button[^>]+onClick=\{\(\)\s*=>\s*\{\s*setIsModalVisible\(true\)\s*\}\}[^>]*>.*?</button>)', r'{canEdit && \1}', content, flags=re.DOTALL)
        
        # Hide action buttons in tables (e.g. deactivate, delete)
        content = re.sub(r'(\{[^\}]*&&[^\}]*<button[^>]+onClick=\{[^}]+\}[^>]*>.*?</button>[^\}]*\})', lambda m: m.group(0).replace('&&', '&& canEdit &&'), content)
        
        # specifically for AllocationsTab deactivate: {a.isActive && <button...
        # The above lambda handles it if written cleanly, but let's do a safe targeted replace
        content = content.replace('{a.isActive && <button onClick={() => deactivate', '{a.isActive && canEdit && <button onClick={() => deactivate')
        
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)

print("Done processing tabs")
