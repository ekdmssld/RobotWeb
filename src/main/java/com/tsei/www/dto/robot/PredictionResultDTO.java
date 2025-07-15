package com.tsei.www.dto.robot;

import lombok.Getter;
import lombok.Setter;

import java.util.Map;

@Getter
@Setter
public class PredictionResultDTO {
    private Map<String, Double> predictedValues; //chemical_name -> value
}
