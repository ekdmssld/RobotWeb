package com.tsei.www.vo;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import javax.persistence.Entity;
import javax.persistence.Id;
import javax.persistence.Table;

@Entity
@Table(name = "sensor_data")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class SensorDataEntity {

    @Id
    private Long id;

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

    // created_at 등 필요한 필드는 추가로 작성
}
