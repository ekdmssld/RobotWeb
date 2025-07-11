package com.tsei.www.dto.robot;

import lombok.Getter;
import lombok.Setter;

import java.util.Map;

@Getter
@Setter
public class PredictionResultDTO {
    private Long detailId;
    private Map<String, Float> predictions; //화학 물질명 - 예측 값
}
