package com.tsei.www.dto.robot;

import lombok.Getter;
import lombok.Setter;

import java.security.Timestamp;
import java.util.Map;

@Getter
@Setter
public class RobotLocationDTO {
    private int detailId;           // car_detail.id
    private double latitude;        // 위도
    private double longitude;       // 경도
    private String csvFilename;     // 분석결과 파일명
    private float windDirection;    // 풍향
    private float windSpeed;        // 풍속
    private String date;              // 날짜 (시간 포함)
    private Map<String, Double> sensorValues; //센서 이름 -> 값 매핑
}
