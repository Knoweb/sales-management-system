package com.knoweb.salesmanagement.dashboard.dto;

import java.math.BigDecimal;
import java.util.List;

public class SalesForecastDto {
    private BigDecimal totalPipelineValue;
    private BigDecimal weightedForecastValue;
    private List<ForecastDetailDto> forecastByStage;

    public static class ForecastDetailDto {
        private String stage;
        private BigDecimal value;
        private int count;

        public ForecastDetailDto(String stage, BigDecimal value, int count) {
            this.stage = stage;
            this.value = value;
            this.count = count;
        }

        public String getStage() { return stage; }
        public void setStage(String stage) { this.stage = stage; }
        public BigDecimal getValue() { return value; }
        public void setValue(BigDecimal value) { this.value = value; }
        public int getCount() { return count; }
        public void setCount(int count) { this.count = count; }
    }

    public BigDecimal getTotalPipelineValue() { return totalPipelineValue; }
    public void setTotalPipelineValue(BigDecimal totalPipelineValue) { this.totalPipelineValue = totalPipelineValue; }

    public BigDecimal getWeightedForecastValue() { return weightedForecastValue; }
    public void setWeightedForecastValue(BigDecimal weightedForecastValue) { this.weightedForecastValue = weightedForecastValue; }

    public List<ForecastDetailDto> getForecastByStage() { return forecastByStage; }
    public void setForecastByStage(List<ForecastDetailDto> forecastByStage) { this.forecastByStage = forecastByStage; }
}
