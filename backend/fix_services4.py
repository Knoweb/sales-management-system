import os

service_dir = r"d:\Knoweb Projects\Marketing App\sales-management-system\backend\src\main\java\com\knoweb\salesmanagement\projectexecution\service"

for filename in os.listdir(service_dir):
    if filename.endswith(".java"):
        filepath = os.path.join(service_dir, filename)
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
            
        modified = False
        
        if filename == "ProjectExecutionWorkspaceService.java":
            if "!manager.isActive()" in content:
                content = content.replace("!manager.isActive()", "!manager.getUser().isActive()")
                modified = True
            if "manager.getRoles().stream()" in content:
                content = content.replace("manager.getRoles().stream()", "manager.getUser().getRoles().stream()")
                modified = True
                
        if filename == "ProjectMonitoringService.java":
            # line 132
            if "User assignee = userRepository.findById" in content:
                content = content.replace("User assignee = userRepository.findById", "Employee assignee = employeeRepository.findById")
                modified = True
            if "User employee = userRepository.findById" in content:
                content = content.replace("User employee = userRepository.findById", "Employee employee = employeeRepository.findById")
                modified = True
                
        if filename == "ProjectResourceService.java":
            # line 75
            if "User employee = userRepository.findById" in content:
                content = content.replace("User employee = userRepository.findById", "Employee employee = employeeRepository.findById")
                modified = True
                
        if filename == "ProjectTaskService.java":
            if "import com.knoweb.salesmanagement.user.entity.Employee;" in content:
                content = content.replace("import com.knoweb.salesmanagement.user.entity.Employee;", "import com.knoweb.salesmanagement.employee.entity.Employee;")
                modified = True
            if "User employee = userRepository.findById" in content:
                content = content.replace("User employee = userRepository.findById", "Employee employee = employeeRepository.findById")
                modified = True
            if "User assignee = userRepository.findById" in content:
                content = content.replace("User assignee = userRepository.findById", "Employee assignee = employeeRepository.findById")
                modified = True

        if modified:
            with open(filepath, 'w', encoding='utf-8') as f:
                f.write(content)

print("Done fixing services pass 4")
