package com.tsei.www.dto.robot;

import lombok.Getter;
import lombok.Setter;

import java.security.Timestamp;
import java.util.Map;

@Getter
@Setter
public class RobotLocationDTO {
    private Long detailId;
    private Double latitude;
    private Double longitude;
    private String date;
    private Integer windDirection;
    private Integer windSpeed;
    private String carCode;

}
