package com.tsei.www.service.ai;

import java.util.Map;

public interface RobotPredictService {
    Map<String, Double> predictChemicalsByCarCode(String carCode, String timestamp );
}
