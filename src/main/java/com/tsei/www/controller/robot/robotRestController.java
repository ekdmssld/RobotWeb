package com.tsei.www.controller.robot;

import com.tsei.www.dto.robot.*;
import com.tsei.www.dto.tracking.*;
import com.tsei.www.service.robot.RobotService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/arims/robot")
@RequiredArgsConstructor
public class robotRestController {

    private final RobotService robotService;

    @GetMapping("/path")
    public List<RobotLocationDTO> getRobotRoute(
            @RequestParam String startTime,
            @RequestParam String endTime,
            @RequestParam String carCode) {
//        System.out.println("요청 받은 carCode = " + carCode);
//        System.out.println("시작시간 = " + startTime);
//        System.out.println("종료시간 = " + endTime);

        return robotService.getRobotRouteByDate(carCode, startTime, endTime);
    }

    @GetMapping("/chemical-info")
    public ResponseEntity<List<RobotSensorDTO>> getChemicalInfoByDetailId(@RequestParam Long detailId) {
        List<RobotSensorDTO> result = robotService.getChemicalInfoByDetailId(detailId);
        return ResponseEntity.ok(result);
    }
    @GetMapping("/sensor-data")
    public List<SensorDataDTO> getSensorDataByDetailId(
            @RequestParam Long detailId,
            @RequestParam String carCode){
        return robotService.getSensorDataByDetailId(detailId, carCode);
    }

    @PostMapping("/path")
    public ResponseEntity<List<RobotPathDTO>> getPath(@RequestBody Map<String, String> req) {
        String carCode = req.get("car_code");
        String date = req.get("date");
        return ResponseEntity.ok(robotService.getRobotMarkers(carCode, date));
    }

    @PostMapping("/additional")
    public ResponseEntity<Map<String, Object>> getAdditional(@RequestBody Map<String, String> req) {
        String carCode = req.get("car_code");
        String timestamp = req.get("time");

        Map<String, Object> result = new HashMap<>();

        WeatherDTO dto = robotService.getWeatherData(carCode, timestamp);
        if (dto != null) {
            result.put("wind_dir", dto.getWindDir());
            result.put("wind_speed", dto.getWindSpeed());
            result.put("temperature", dto.getTemperature());
            result.put("humidity", dto.getHumidity());
        }

        List<SensorDataDTO> sensors = robotService.getSensorData(carCode, timestamp);

        return ResponseEntity.ok(result);
    }

    @PostMapping("/dates")
    public ResponseEntity<List<String>> getDates(@RequestBody Map<String, String> req) {
        return ResponseEntity.ok(robotService.getAvailableDates(req.get("car_code")));
    }

    @GetMapping("/latest-sensor")
    public ResponseEntity<List<RobotSensorDTO>> getLatestSensorWithInfo(){
        List<RobotSensorDTO> result = robotService.getLatestSensorWithInfo();
        return ResponseEntity.ok(result);
    }

    @GetMapping("/available-dates")
    public ResponseEntity<List<String>> getAvailableDates(@RequestParam String carCode) {
        List<String> dates = robotService.getAvailableDates(carCode);
        return ResponseEntity.ok(dates);
    }

    @GetMapping("/ppm")
    public ResponseEntity<Float> getPpmBySensorId(@RequestParam Long sensorId) {
        Float value = robotService.getPpmBySensorId(sensorId);
        return ResponseEntity.ok(value);
    }

}
