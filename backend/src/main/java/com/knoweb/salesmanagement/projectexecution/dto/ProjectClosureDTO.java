package com.knoweb.salesmanagement.projectexecution.dto;

import com.knoweb.salesmanagement.projectexecution.enums.InspectionStatus;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDate;

public class ProjectClosureDTO {
    
    @NotNull(message = "Inspection status is required")
    private InspectionStatus inspectionStatus;
    
    private LocalDate inspectionDate;
    
    private String inspectionNotes;
    
    private LocalDate deliveryDate;
    
    private Boolean installationCompleted;
    
    private String deliveryNotes;

    public InspectionStatus getInspectionStatus() {
        return inspectionStatus;
    }

    public void setInspectionStatus(InspectionStatus inspectionStatus) {
        this.inspectionStatus = inspectionStatus;
    }

    public LocalDate getInspectionDate() {
        return inspectionDate;
    }

    public void setInspectionDate(LocalDate inspectionDate) {
        this.inspectionDate = inspectionDate;
    }

    public String getInspectionNotes() {
        return inspectionNotes;
    }

    public void setInspectionNotes(String inspectionNotes) {
        this.inspectionNotes = inspectionNotes;
    }

    public LocalDate getDeliveryDate() {
        return deliveryDate;
    }

    public void setDeliveryDate(LocalDate deliveryDate) {
        this.deliveryDate = deliveryDate;
    }

    public Boolean getInstallationCompleted() {
        return installationCompleted;
    }

    public void setInstallationCompleted(Boolean installationCompleted) {
        this.installationCompleted = installationCompleted;
    }

    public String getDeliveryNotes() {
        return deliveryNotes;
    }

    public void setDeliveryNotes(String deliveryNotes) {
        this.deliveryNotes = deliveryNotes;
    }
}
