import os
import re

service_dir = r"d:\Knoweb Projects\Marketing App\sales-management-system\backend\src\main\java\com\knoweb\salesmanagement\projectexecution\service"

for filename in os.listdir(service_dir):
    if filename.endswith(".java"):
        filepath = os.path.join(service_dir, filename)
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
            
        modified = False
        
        if "User manager = userRepository.findById" in content:
            content = content.replace("User manager = userRepository.findById", "Employee manager = employeeRepository.findById")
            modified = True
        
        if "User employee = userRepository.findById" in content:
            content = content.replace("User employee = userRepository.findById", "Employee employee = employeeRepository.findById")
            modified = True
            
        if "User assignee = userRepository.findById" in content:
            content = content.replace("User assignee = userRepository.findById", "Employee assignee = employeeRepository.findById")
            modified = True

        if modified and "EmployeeRepository employeeRepository" not in content:
            # Import
            content = content.replace("import com.knoweb.salesmanagement.auth.repository.UserRepository;", "import com.knoweb.salesmanagement.auth.repository.UserRepository;\nimport com.knoweb.salesmanagement.employee.repository.EmployeeRepository;\nimport com.knoweb.salesmanagement.employee.entity.Employee;")
            
            # Field
            content = re.sub(r'(private final UserRepository userRepository;)', r'\1\n    private final EmployeeRepository employeeRepository;', content)
            
            # Constructor
            # Find the constructor public ClassName(...)
            class_name = filename.replace(".java", "")
            constructor_pattern = r'(public ' + class_name + r'\s*\([^)]+)(\))'
            # We want to add , EmployeeRepository employeeRepository
            content = re.sub(constructor_pattern, r'\1, EmployeeRepository employeeRepository\2', content)
            
            # Body of constructor
            # Need to find this.userRepository = userRepository; and add this.employeeRepository = employeeRepository;
            content = re.sub(r'(this\.userRepository = userRepository;)', r'\1\n        this.employeeRepository = employeeRepository;', content)

        if modified:
            with open(filepath, 'w', encoding='utf-8') as f:
                f.write(content)

print("Done fixing services pass 2")
