package com.tsei.www.dto.robot;

import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
public class SensorVectorDTO {
    private Long detailId;
    private List<Float> vector; //48개 값
}
