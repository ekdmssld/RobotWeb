package com.tsei.www.dto.robot;

import lombok.Getter;
import lombok.Setter;

import java.security.Timestamp;

@Getter
@Setter
public class RobotSensorDTO {
    private Long detailId;
    private String carCode;
    // 추가
    private int sensorInfoId;       // 추가
    private String sensorModel;
    private String manufacturer;    // 추가
    private String targetGas;
    private float ppm; //추가
    private Timestamp timestamp;
    private Float pressure;
    private Float ratio;
    private Float temp;
    private Float humi;
    private Float rs;
    private Float ro;
}
