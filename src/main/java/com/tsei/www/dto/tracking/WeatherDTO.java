package com.tsei.www.dto.tracking;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class WeatherDTO {
    private String carCode;
    private String regDate;
    private double wdTemp;
    private double wdHumi;
    private int wdWdd;
    private double wdWds;

}
