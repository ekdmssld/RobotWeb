package com.tsei.www.dto.tracking;

import lombok.Getter;
import lombok.Setter;

import java.security.Timestamp;

@Getter
@Setter

public class SensorDataDTO {
    private String carCode;
    private int sensorInfoId;
    private float temp;
    private float humi;
    private float ppmRefGo;
    private float ratio;
    private String modelNo;
    private String manufacturer;
    private Timestamp timestamp;
    private String gasName;
}
