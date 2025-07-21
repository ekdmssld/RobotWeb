package com.tsei.www.service.robot;

import com.tsei.www.dto.robot.RobotPathPointDTO;
import com.tsei.www.repository.RobotPathRepository;
import com.tsei.www.vo.RobotPath;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.*;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class RobotPathService {

    @Autowired
    private RobotPathRepository repository;

    public void saveRobotPath(RobotPathPointDTO dto) {
        LocalDate pathDate = LocalDate.parse(dto.getDate());

        List<RobotPath> pathList = dto.getPoints().stream().map(p -> {
            RobotPath entity = new RobotPath();
            entity.setCarCode(dto.getCarCode());
            entity.setDate(pathDate);
            entity.setRouteType(dto.getType());
            entity.setLatitude(p.getLatitude());
            entity.setLongitude(p.getLongitude());
            DateTimeFormatter formatter = DateTimeFormatter.ISO_DATE_TIME;
// 또는 ofPattern("yyyy-MM-dd'T'HH:mm:ss.SSS'Z'")
            entity.setRecordTime(LocalDateTime.parse(p.getDate(), formatter));

            entity.setWindDir(p.getWindDirection());
            return entity;
        }).collect(Collectors.toList());

        repository.saveAll(pathList);
    }

    public List<RobotPath> getRobotPath(String carCode, LocalDate date) {
        return repository.findByCarCodeAndDate(carCode, date);
    }
}
