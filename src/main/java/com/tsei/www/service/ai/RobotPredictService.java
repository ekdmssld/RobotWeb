package com.tsei.www.service.robot;

import java.util.Map;

public interface RobotPredictService {
    Map<String, Double> predictChemicalsByCarCode(String carCode, String timestamp );
}
