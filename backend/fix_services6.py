import os
import re

service_dir = r"d:\Knoweb Projects\Marketing App\sales-management-system\backend\src\main\java\com\knoweb\salesmanagement\projectexecution\service"

for filename in os.listdir(service_dir):
    if filename.endswith(".java"):
        filepath = os.path.join(service_dir, filename)
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
            
        modified = False
        
        if filename in ["ProjectMonitoringService.java", "ProjectResourceService.java"]:
            if "EmployeeRepository employeeRepository" not in content:
                # Add field
                content = re.sub(r'(private final UserRepository userRepository;)', r'\1\n    private final EmployeeRepository employeeRepository;', content)
                # Add to constructor
                class_name = filename.replace(".java", "")
                constructor_pattern = r'(public ' + class_name + r'\s*\([^)]+)(\))'
                content = re.sub(constructor_pattern, r'\1, EmployeeRepository employeeRepository\2', content)
                # Add to constructor body
                content = re.sub(r'(this\.userRepository = userRepository;)', r'\1\n        this.employeeRepository = employeeRepository;', content)
                modified = True
                
        if filename == "ProjectTaskService.java":
            if "import package com.knoweb.salesmanagement.employee.entity.Employee;" in content:
                content = content.replace("import package com.knoweb.salesmanagement.employee.entity.Employee;", "import com.knoweb.salesmanagement.employee.entity.Employee;")
                modified = True
            if "import com.knoweb.salesmanagement.user.entity.Employee;" in content:
                content = content.replace("import com.knoweb.salesmanagement.user.entity.Employee;", "import com.knoweb.salesmanagement.employee.entity.Employee;")
                modified = True

        if modified:
            with open(filepath, 'w', encoding='utf-8') as f:
                f.write(content)

print("Done fixing services pass 6")
