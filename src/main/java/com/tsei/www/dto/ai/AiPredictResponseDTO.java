package com.tsei.www.dto.ai;

import java.util.List;

public class AiPredictResponseDTO {
    private List<Double> prediction;

    public List<Double> getPrediction() {
        return prediction;
    }

    public void setPrediction(List<Double> prediction) {
        this.prediction = prediction;
    }
}