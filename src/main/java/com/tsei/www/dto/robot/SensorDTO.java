package com.tsei.www.dto.robot;

import lombok.Data;
import lombok.Getter;
import lombok.Setter;

@Data
@Getter
@Setter
public class SensorDTO {
    private Float ppmRefGo;
    private Float temp;
    private Float humi;
    private Float pre;
    private Float ratio;
    private Float ppm;
    private Float ppmGo;
    private Float rs;
    private Float ro;
    private Float refFactor;
}
