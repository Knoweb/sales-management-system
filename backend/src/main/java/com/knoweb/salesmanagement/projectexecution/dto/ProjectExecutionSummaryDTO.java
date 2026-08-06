package com.knoweb.salesmanagement.projectexecution.dto;

import java.math.BigDecimal;

public class ProjectExecutionSummaryDTO {
    private BigDecimal overallProgress;
    private long totalTasks;
    private long completedTasks;
    private long blockedTasks;
    private long overdueTasks;
    private BigDecimal totalEstimatedHours;
    private BigDecimal totalActualHours;
    private BigDecimal labourCostTotal;
    private BigDecimal materialCostTotal;

    public BigDecimal getOverallProgress() { return overallProgress; }
    public void setOverallProgress(BigDecimal overallProgress) { this.overallProgress = overallProgress; }
    public long getTotalTasks() { return totalTasks; }
    public void setTotalTasks(long totalTasks) { this.totalTasks = totalTasks; }
    public long getCompletedTasks() { return completedTasks; }
    public void setCompletedTasks(long completedTasks) { this.completedTasks = completedTasks; }
    public long getBlockedTasks() { return blockedTasks; }
    public void setBlockedTasks(long blockedTasks) { this.blockedTasks = blockedTasks; }
    public long getOverdueTasks() { return overdueTasks; }
    public void setOverdueTasks(long overdueTasks) { this.overdueTasks = overdueTasks; }
    public BigDecimal getTotalEstimatedHours() { return totalEstimatedHours; }
    public void setTotalEstimatedHours(BigDecimal totalEstimatedHours) { this.totalEstimatedHours = totalEstimatedHours; }
    public BigDecimal getTotalActualHours() { return totalActualHours; }
    public void setTotalActualHours(BigDecimal totalActualHours) { this.totalActualHours = totalActualHours; }
    public BigDecimal getLabourCostTotal() { return labourCostTotal; }
    public void setLabourCostTotal(BigDecimal labourCostTotal) { this.labourCostTotal = labourCostTotal; }
    public BigDecimal getMaterialCostTotal() { return materialCostTotal; }
    public void setMaterialCostTotal(BigDecimal materialCostTotal) { this.materialCostTotal = materialCostTotal; }
}
