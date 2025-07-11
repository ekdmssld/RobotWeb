package com.tsei.www.service.ai;

import java.util.List;

public interface AiPredictService {
    List<Double> predictChemicalProbabilities(List<Double> sensorVector);
}
