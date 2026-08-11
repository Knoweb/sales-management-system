package com.knoweb.salesmanagement.virtualtour.dto;

public class VirtualTourAnalyticsDTO {
    private long completedTours;
    private double averageProbabilityIncrease;

    public VirtualTourAnalyticsDTO(long completedTours, double averageProbabilityIncrease) {
        this.completedTours = completedTours;
        this.averageProbabilityIncrease = averageProbabilityIncrease;
    }

    public long getCompletedTours() { return completedTours; }
    public void setCompletedTours(long completedTours) { this.completedTours = completedTours; }

    public double getAverageProbabilityIncrease() { return averageProbabilityIncrease; }
    public void setAverageProbabilityIncrease(double averageProbabilityIncrease) { this.averageProbabilityIncrease = averageProbabilityIncrease; }
}
