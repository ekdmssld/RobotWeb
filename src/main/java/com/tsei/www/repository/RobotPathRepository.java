package com.tsei.www.repository;

import com.tsei.www.vo.RobotPath;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;

public interface RobotPathRepository extends JpaRepository<RobotPath, Long> {
    List<RobotPath> findByCarCodeAndDate(String carCode, LocalDate date);
}
