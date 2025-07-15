package com.tsei.www.vo;

import lombok.*;

import javax.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name="prediction_result")
@Getter
@Setter
@Data
@NoArgsConstructor
@AllArgsConstructor
public class PredictionResultEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name="chemical_name")
    private String chemicalName;

    @Column(name="predicted_value")
    private Double predictedValue;

    @Column(name="created_at", insertable = false, updatable = false)
    private LocalDateTime createdAt;

//    @PrePersist
//    protected void onCreate() {
//        this.createdAt = LocalDateTime.now();
//    }
}
