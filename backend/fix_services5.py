import os

service_dir = r"d:\Knoweb Projects\Marketing App\sales-management-system\backend\src\main\java\com\knoweb\salesmanagement\projectexecution\service"

for filename in os.listdir(service_dir):
    if filename.endswith(".java"):
        filepath = os.path.join(service_dir, filename)
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
            
        modified = False
        
        if filename == "ProjectMonitoringService.java":
            if "update.setEmployee(userRepository.findById(dto.getEmployeeId()).orElseThrow());" in content:
                content = content.replace("userRepository.findById(dto.getEmployeeId())", "employeeRepository.findById(dto.getEmployeeId())")
                modified = True
                
        if filename == "ProjectResourceService.java":
            if "allocation.setEmployee(userRepository.findById(dto.getEmployeeId()).orElseThrow());" in content:
                content = content.replace("userRepository.findById(dto.getEmployeeId())", "employeeRepository.findById(dto.getEmployeeId())")
                modified = True
                
        if filename == "ProjectTaskService.java":
            if "task.setAssignee(userRepository.findById(dto.getAssigneeId()).orElse(null));" in content:
                content = content.replace("userRepository.findById(dto.getAssigneeId())", "employeeRepository.findById(dto.getAssigneeId())")
                modified = True
                
            if "import package com.knoweb.salesmanagement.user.entity.Employee;" in content:
                content = content.replace("import package com.knoweb.salesmanagement.user.entity.Employee;", "import com.knoweb.salesmanagement.employee.entity.Employee;")
                modified = True

        if modified:
            with open(filepath, 'w', encoding='utf-8') as f:
                f.write(content)

print("Done fixing services pass 5")
