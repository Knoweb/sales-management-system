import os

service_dir = r"d:\Knoweb Projects\Marketing App\sales-management-system\backend\src\main\java\com\knoweb\salesmanagement\projectexecution\service"

for filename in os.listdir(service_dir):
    if filename.endswith(".java"):
        filepath = os.path.join(service_dir, filename)
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
            
        modified = False
        
        # Check if missing imports
        if "EmployeeRepository" in content and "import com.knoweb.salesmanagement.employee.repository.EmployeeRepository;" not in content:
            content = content.replace("import org.springframework.stereotype.Service;", "import com.knoweb.salesmanagement.employee.repository.EmployeeRepository;\nimport org.springframework.stereotype.Service;")
            modified = True
            
        if " Employee" in content and "import com.knoweb.salesmanagement.employee.entity.Employee;" not in content:
            content = content.replace("import org.springframework.stereotype.Service;", "import com.knoweb.salesmanagement.employee.entity.Employee;\nimport org.springframework.stereotype.Service;")
            modified = True
            
        # Fix the remaining compiler errors where 'User' cannot be converted to 'Employee'
        # Let's just do a manual replace of `User` to `Employee` for those specific lines
        if "ProjectMonitoringService.java" in filename:
            content = content.replace("User assignee = ", "Employee assignee = ")
            modified = True
            
        if "ProjectResourceService.java" in filename:
            content = content.replace("User employee = ", "Employee employee = ")
            modified = True
            
        if "ProjectTaskService.java" in filename:
            content = content.replace("User assignee = ", "Employee assignee = ")
            content = content.replace("import com.knoweb.salesmanagement.user.entity.Employee;", "")
            modified = True
            
        if modified:
            with open(filepath, 'w', encoding='utf-8') as f:
                f.write(content)

print("Done fixing services pass 3")
