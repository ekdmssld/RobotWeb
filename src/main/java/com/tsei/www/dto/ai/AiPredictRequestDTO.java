package com.tsei.www.dto.ai;

import java.util.List;

public class AiPredictRequestDTO {
    private List<Double> sensor_vector;

    public List<Double> getSensor_vector() {
        return sensor_vector;
    }

    public void setSensor_vector(List<Double> sensor_vector) {
        this.sensor_vector = sensor_vector;
    }
}