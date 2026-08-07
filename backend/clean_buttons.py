import os
import re

tabs_dir = r"d:\Knoweb Projects\Marketing App\sales-management-system\frontend\src\components\projectexecution\tabs"

for filename in os.listdir(tabs_dir):
    if filename.endswith("Tab.tsx"):
        filepath = os.path.join(tabs_dir, filename)
        with open(filepath, 'r', encoding='utf-8') as f:
            lines = f.readlines()
            
        new_lines = []
        for line in lines:
            if "setIsModalVisible(true)" in line and "<button" in line:
                # Remove existing canEdit wrappers if any got messed up
                clean_line = re.sub(r'\{canEdit &&\s*', '', line)
                clean_line = clean_line.replace('}', '', 1) if '{canEdit &&' in line else clean_line # rough cleanup
                
                # If the line already has canEdit, don't double wrap
                if "canEdit && <button" not in line and "{canEdit &&" not in line:
                    # just prefix {canEdit &&  and suffix }
                    # Find where <button starts
                    idx = line.find("<button")
                    if idx != -1:
                        # find where button ends
                        end_idx = line.find("</button>", idx)
                        if end_idx != -1:
                            end_tag_len = len("</button>")
                            # reconstruct
                            prefix = line[:idx]
                            button_str = line[idx:end_idx + end_tag_len]
                            suffix = line[end_idx + end_tag_len:]
                            
                            # If it's inside a JSX expression, we might need a wrapper, but usually it's bare HTML or already in brackets.
                            # Usually prefix has whitespace.
                            line = f"{prefix}{{canEdit && {button_str}}}{suffix}"
            new_lines.append(line)
            
        with open(filepath, 'w', encoding='utf-8') as f:
            f.writelines(new_lines)

print("Done cleaning buttons")
