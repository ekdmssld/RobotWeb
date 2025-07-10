package com.tsei.www.dto.robot;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class chemicalDataDTO {
    private String chemicalName;
    private float chemicalValue;
    private float msv;
    private String type;
    private double value;

    public float getConcentration() {
        return chemicalValue;
    }

    public float getThreshold() {
        return msv;
    }

}
