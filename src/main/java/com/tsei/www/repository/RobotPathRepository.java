package com.tsei.www.repository;

import com.tsei.www.vo.RobotPath;
import org.apache.ibatis.annotations.Param;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.time.LocalDate;
import java.util.List;

public interface RobotPathRepository extends JpaRepository<RobotPath, Long> {
    List<RobotPath> findByCarCodeAndDate(String carCode, LocalDate date);

    @Query("SELECT DISTINCT r.pathGroup FROM RobotPath r WHERE r.carCode = :carCode AND r.date = :date")
    List<String> findPathGroups(@Param("carCode") String carCode, @Param("date") LocalDate date);
}
