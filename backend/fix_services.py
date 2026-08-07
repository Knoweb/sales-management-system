import os
import re

service_dir = r"d:\Knoweb Projects\Marketing App\sales-management-system\backend\src\main\java\com\knoweb\salesmanagement\projectexecution\service"

for filename in os.listdir(service_dir):
    if filename.endswith(".java"):
        filepath = os.path.join(service_dir, filename)
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
            
        modified = False
        
        if "com.knoweb.salesmanagement.user.entity.User" in content:
            # We don't want to blindly replace all User with Employee, but where compilation failed.
            pass
            
        # specifically fix:
        # User manager = userRepository.findById(projectManagerId) -> Employee manager = employeeRepository.findById(projectManagerId)
        if "User manager = userRepository.findById" in content:
            content = content.replace("User manager = userRepository.findById", "Employee manager = employeeRepository.findById")
            modified = True
        
        # User employee = userRepository.findById(employeeId) -> Employee employee = employeeRepository.findById(employeeId)
        if "User employee = userRepository.findById" in content:
            content = content.replace("User employee = userRepository.findById", "Employee employee = employeeRepository.findById")
            modified = True
            
        # User assignee = userRepository.findById(assigneeId) -> Employee assignee = employeeRepository.findById(assigneeId)
        if "User assignee = userRepository.findById" in content:
            content = content.replace("User assignee = userRepository.findById", "Employee assignee = employeeRepository.findById")
            modified = True

        # And we might need to inject employeeRepository if it's not there!
        if modified and "private final EmployeeRepository employeeRepository;" not in content:
            # we must add EmployeeRepository!
            # The python script might struggle to inject dependencies gracefully. Let's do it if needed, or we just rely on regex
            if "UserRepository userRepository;" in content:
                content = content.replace("UserRepository userRepository;", "UserRepository userRepository;\n    private final EmployeeRepository employeeRepository;")
                
        # Also need to import EmployeeRepository
        if modified and "import com.knoweb.salesmanagement.employee.repository.EmployeeRepository;" not in content:
            content = content.replace("import com.knoweb.salesmanagement.user.repository.UserRepository;", "import com.knoweb.salesmanagement.user.repository.UserRepository;\nimport com.knoweb.salesmanagement.employee.repository.EmployeeRepository;")
            content = content.replace("import com.knoweb.salesmanagement.auth.repository.UserRepository;", "import com.knoweb.salesmanagement.auth.repository.UserRepository;\nimport com.knoweb.salesmanagement.employee.repository.EmployeeRepository;")
            
        if modified:
            with open(filepath, 'w', encoding='utf-8') as f:
                f.write(content)

print("Done fixing services")
