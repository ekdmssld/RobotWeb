package com.tsei.www.dto.tracking;

import lombok.Getter;
import lombok.Setter;

import java.security.Timestamp;

@Getter
@Setter

public class SensorDataDTO {
//    private String carCode;
//    private int sensorInfoId;
//    private float temp;
//    private float humi;
//    private float ppm;
//    private float rs;
//    private float ro;
//    private float ratio;
//    private String modelNo;
//    private String manufacturer;
//    private Timestamp timestamp;
//    private String gasName;
private Integer sensorInfoId;
    private String gasName;    // ← sensor_info.target_gas 로부터 매핑
    private Float ppm;
    private Float rs;
    private Float ro;
    private Float ref;



}
