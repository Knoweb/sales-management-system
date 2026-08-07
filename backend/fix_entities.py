import os
import re

entity_dir = r"d:\Knoweb Projects\Marketing App\sales-management-system\backend\src\main\java\com\knoweb\salesmanagement\projectexecution\entity"
dto_dir = r"d:\Knoweb Projects\Marketing App\sales-management-system\backend\src\main\java\com\knoweb\salesmanagement\projectexecution\dto"
service_dir = r"d:\Knoweb Projects\Marketing App\sales-management-system\backend\src\main\java\com\knoweb\salesmanagement\projectexecution\service"

# Entities to replace `User` with `Employee`
# 1. ProjectExecutionWorkspace: private User projectManager;
# 2. ProjectEmployeeAllocation: private User employee;
# 3. ProjectTask: private User assignee;
# 4. DailyProgressUpdate: private User employee;
# 5. ProjectLabourEntry: private User employee;

for filename in os.listdir(entity_dir):
    if filename.endswith(".java"):
        filepath = os.path.join(entity_dir, filename)
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
            
        modified = False
        if "User projectManager" in content:
            content = content.replace("User projectManager", "Employee projectManager")
            content = content.replace("public User getProjectManager", "public Employee getProjectManager")
            content = content.replace("setProjectManager(User projectManager)", "setProjectManager(Employee projectManager)")
            modified = True
            
        if "User employee" in content:
            content = content.replace("User employee", "Employee employee")
            content = content.replace("public User getEmployee", "public Employee getEmployee")
            content = content.replace("setEmployee(User employee)", "setEmployee(Employee employee)")
            modified = True
            
        if "User assignee" in content:
            content = content.replace("User assignee", "Employee assignee")
            content = content.replace("public User getAssignee", "public Employee getAssignee")
            content = content.replace("setAssignee(User assignee)", "setAssignee(Employee assignee)")
            modified = True
            
        if modified:
            if "import com.knoweb.salesmanagement.employee.entity.Employee;" not in content:
                content = content.replace("import com.knoweb.salesmanagement.auth.entity.User;", "import com.knoweb.salesmanagement.auth.entity.User;\nimport com.knoweb.salesmanagement.employee.entity.Employee;")
                if "import com.knoweb.salesmanagement.auth.entity.User;" not in content:
                   # Find a good place for import
                   content = content.replace("import jakarta.persistence.*;", "import jakarta.persistence.*;\nimport com.knoweb.salesmanagement.employee.entity.Employee;")
            with open(filepath, 'w', encoding='utf-8') as f:
                f.write(content)

print("Done fixing entities")
