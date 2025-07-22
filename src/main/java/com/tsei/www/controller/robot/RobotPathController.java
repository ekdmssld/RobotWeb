package com.tsei.www.controller.robot;

import com.tsei.www.dto.robot.RobotPathPointDTO;
import com.tsei.www.service.robot.RobotPathService;
import com.tsei.www.vo.RobotPath;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/arims")
public class RobotPathController {
    @Autowired
    private RobotPathService service;

    @PostMapping("/robotPath/save")
    public ResponseEntity<String> savePath(@RequestBody RobotPathPointDTO dto){
        service.saveRobotPath(dto);
        return ResponseEntity.ok("Saved Successfully");
    }

    @GetMapping("/robotPath/get")
    public ResponseEntity<List<RobotPath>> getPath(
            @RequestParam String carCode,
            @RequestParam String date
    ){
        LocalDate localDate = LocalDate.parse(date);
        List<RobotPath> result = service.getRobotPath(carCode, localDate);
        return ResponseEntity.ok(result);
    }

//    @DeleteMapping("/robotPath/delete")
//    public ResponseEntity<String> deletePath(@RequestParam String carCode){
//
//    }

    @GetMapping("/robotPath/groups")
    public ResponseEntity<List<String>> getPathGroups(
            @RequestParam String carCode,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        List<String> groups = service.findPathGroups(carCode, date);
        return ResponseEntity.ok(groups);
    }

}
