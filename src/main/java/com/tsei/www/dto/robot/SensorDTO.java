package com.tsei.www.dto.robot;

import lombok.Data;
import lombok.Getter;
import lombok.Setter;

@Data
@Getter
@Setter
public class SensorDTO {
    private Double ppmRefGo;
    private Double temp;
    private Double humi;
    private Double pre;
    private Double ratio;
    private Double ppm;
    private Double ppmGo;
    private Double rs;
    private Double ro;
    private Double refFactor;
}
