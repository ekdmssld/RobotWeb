package com.tsei.www.dto.robot;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class RobotPathDTO {
    private String updateTime;
    private double lat;
    private double lon;
    private double theta;
    private double volt;
    private String controlMode;
    private String errorCode;
    private String measureFlag;
    private Long detailId;
    private String carCode;

}
