package com.tsei.www.vo;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import javax.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "sensor_data")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class SensorDataEntity {

    @Id
    @GeneratedValue(strategy= GenerationType.IDENTITY)
    private Long id;

    @Column(name = "car_code")
    private String carCode;

    @Column(name = "sensor_info_id")
    private Integer sensorInfoId;

    @Column(name = "ppm_ref_go")
    private Float ppmRefGo;

    private Float temp;
    private Float humi;
    private Float pre;
    private Float ratio;
    private Float ppm;

    @Column(name = "ppm_go")
    private Float ppmGo;

    private Float rs;
    private Float ro;

    @Column(name = "ref_factor")
    private Float refFactor;

    private LocalDateTime timestamp;
}
