package com.tsei.www.dto.ai;

import lombok.Data;

@Data
public class PredictedChemicalDTO {
    private int detailId;
    private String chemicalName;
    private double predictedValue;
}