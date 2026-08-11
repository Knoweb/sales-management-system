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

    private Boolean clientAccepted;
    private LocalDate clientAcceptanceDate;
    private String clientAcceptanceNotes;

    private LocalDate warrantyStartDate;
    private LocalDate warrantyEndDate;
    private String warrantyNotes;

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

    public Boolean getClientAccepted() { return clientAccepted; }
    public void setClientAccepted(Boolean clientAccepted) { this.clientAccepted = clientAccepted; }
    public LocalDate getClientAcceptanceDate() { return clientAcceptanceDate; }
    public void setClientAcceptanceDate(LocalDate clientAcceptanceDate) { this.clientAcceptanceDate = clientAcceptanceDate; }
    public String getClientAcceptanceNotes() { return clientAcceptanceNotes; }
    public void setClientAcceptanceNotes(String clientAcceptanceNotes) { this.clientAcceptanceNotes = clientAcceptanceNotes; }
    public LocalDate getWarrantyStartDate() { return warrantyStartDate; }
    public void setWarrantyStartDate(LocalDate warrantyStartDate) { this.warrantyStartDate = warrantyStartDate; }
    public LocalDate getWarrantyEndDate() { return warrantyEndDate; }
    public void setWarrantyEndDate(LocalDate warrantyEndDate) { this.warrantyEndDate = warrantyEndDate; }
    public String getWarrantyNotes() { return warrantyNotes; }
    public void setWarrantyNotes(String warrantyNotes) { this.warrantyNotes = warrantyNotes; }
}
