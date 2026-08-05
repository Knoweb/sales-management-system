package com.knoweb.salesmanagement.costing.dto;

import com.knoweb.salesmanagement.costing.enums.EstimateLineItemCategory;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;
import java.util.UUID;

public class DepartmentEstimateLineItemRequest {

    private UUID id;

    @NotNull(message = "Category is required")
    private EstimateLineItemCategory category;

    @NotBlank(message = "Description is required")
    private String description;

    @NotNull(message = "Quantity is required")
    @DecimalMin(value = "0.0001", message = "Quantity must be greater than 0")
    private BigDecimal quantity = BigDecimal.ONE;

    @NotBlank(message = "Unit of measure is required")
    private String unitOfMeasure;

    @NotNull(message = "Unit cost is required")
    @DecimalMin(value = "0.00", message = "Unit cost cannot be negative")
    private BigDecimal unitCost = BigDecimal.ZERO;

    private UUID employeeAllocationId;
    private String notes;

    public DepartmentEstimateLineItemRequest() {}

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

    public UUID getEmployeeAllocationId() { return employeeAllocationId; }
    public void setEmployeeAllocationId(UUID employeeAllocationId) { this.employeeAllocationId = employeeAllocationId; }

    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }
}
