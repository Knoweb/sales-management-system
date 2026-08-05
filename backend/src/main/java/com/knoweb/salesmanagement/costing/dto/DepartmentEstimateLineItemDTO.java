package com.knoweb.salesmanagement.costing.dto;

import com.knoweb.salesmanagement.costing.enums.EstimateLineItemCategory;
import java.math.BigDecimal;
import java.util.UUID;

public class DepartmentEstimateLineItemDTO {

    private UUID id;
    private EstimateLineItemCategory category;
    private String description;
    private BigDecimal quantity;
    private String unitOfMeasure;
    private BigDecimal unitCost;
    private BigDecimal totalCost;
    private UUID employeeAllocationId;
    private String employeeName;
    private String projectRole;
    private String notes;

    public DepartmentEstimateLineItemDTO() {}

    public DepartmentEstimateLineItemDTO(UUID id, EstimateLineItemCategory category, String description,
                                         BigDecimal quantity, String unitOfMeasure, BigDecimal unitCost,
                                         BigDecimal totalCost, UUID employeeAllocationId, String employeeName,
                                         String projectRole, String notes) {
        this.id = id;
        this.category = category;
        this.description = description;
        this.quantity = quantity;
        this.unitOfMeasure = unitOfMeasure;
        this.unitCost = unitCost;
        this.totalCost = totalCost;
        this.employeeAllocationId = employeeAllocationId;
        this.employeeName = employeeName;
        this.projectRole = projectRole;
        this.notes = notes;
    }

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }

    public EstimateLineItemCategory getCategory() { return category; }
    public void setCategory(EstimateLineItemCategory category) { this.category = category; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public BigDecimal getQuantity() { return quantity; }
    public void setQuantity(BigDecimal quantity) { this.quantity = quantity; }

    public String getUnitOfMeasure() { return unitOfMeasure; }
    public void setUnitOfMeasure(String unitOfMeasure) { this.unitOfMeasure = unitOfMeasure; }

    public BigDecimal getUnitCost() { return unitCost; }
    public void setUnitCost(BigDecimal unitCost) { this.unitCost = unitCost; }

    public BigDecimal getTotalCost() { return totalCost; }
    public void setTotalCost(BigDecimal totalCost) { this.totalCost = totalCost; }

    public UUID getEmployeeAllocationId() { return employeeAllocationId; }
    public void setEmployeeAllocationId(UUID employeeAllocationId) { this.employeeAllocationId = employeeAllocationId; }

    public String getEmployeeName() { return employeeName; }
    public void setEmployeeName(String employeeName) { this.employeeName = employeeName; }

    public String getProjectRole() { return projectRole; }
    public void setProjectRole(String projectRole) { this.projectRole = projectRole; }

    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }
}
