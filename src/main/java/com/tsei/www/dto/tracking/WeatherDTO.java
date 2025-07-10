package com.tsei.www.dto.tracking;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class WeatherDTO {
    private Integer windDir;
    private Double windSpeed;
    private Double temperature;
    private Double humidity;

}
