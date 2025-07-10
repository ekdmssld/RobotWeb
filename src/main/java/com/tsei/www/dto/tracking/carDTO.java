package com.tsei.www.dto.tracking;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class carDTO {
    private Long carId;
    private float latitude;
    private float longitude;
    private String date;
    private String detailId;
    private String csvFilename;
    private float windDirection;



}
