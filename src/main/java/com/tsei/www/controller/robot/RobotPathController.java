package com.tsei.www.controller.robot;

import com.tsei.www.dto.robot.RobotPathPointDTO;
import com.tsei.www.service.robot.RobotPathService;
import com.tsei.www.vo.RobotPath;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/arims/robotPath")
public class RobotPathController {
    @Autowired
    private RobotPathService service;

    @PostMapping("/save")
    public ResponseEntity<String> savePath(@RequestBody RobotPathPointDTO dto){
        service.saveRobotPath(dto);
        return ResponseEntity.ok("Saved Successfully");
    }

    @GetMapping("/get")
    public ResponseEntity<List<RobotPath>> getPath(
            @RequestParam String carCode,
            @RequestParam String date
    ){
        LocalDate localDate = LocalDate.parse(date);
        List<RobotPath> result = service.getRobotPath(carCode, localDate);
        return ResponseEntity.ok(result);
    }
}
