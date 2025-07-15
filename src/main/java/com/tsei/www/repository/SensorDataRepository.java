package com.tsei.www.repository;

import com.tsei.www.vo.SensorDataEntity;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface SensorDataRepository extends JpaRepository<SensorDataEntity, Long> {

    // id가 startId ~ endId 사이에 있는 센서 데이터 12개 조회
    List<SensorDataEntity> findByIdBetween(Long start, Long end);
}
