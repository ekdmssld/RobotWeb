package com.tsei.www.controller.robot;

import com.tsei.www.dto.robot.*;
import com.tsei.www.dto.tracking.*;
import com.tsei.www.mapper.no2.RobotMapper;
import com.tsei.www.service.robot.RobotService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
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
    private final RobotMapper RobotMapper;

    @GetMapping("/path")
    public List<RobotLocationDTO> getRobotRoute(
            @RequestParam String startTime,
            @RequestParam String endTime,
            @RequestParam String carCode) {
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

    @GetMapping("/weather-data")
    public ResponseEntity<WeatherDTO> getWeatherData(@RequestParam String carCode,
                                                     @RequestParam String timestamp) {
        WeatherDTO result = RobotMapper.findCloseWeather(carCode, timestamp);
//        System.out.println("carCode: " + carCode);
//        System.out.println("timestamp: " + timestamp);

        if(result == null){
            System.out.println("날씨 데이터 없음: NULL 반환");
            return ResponseEntity.status(404).body(null); // 명시적 404
        }

        return ResponseEntity.ok(result);
    }



//    @PostMapping("/additional")
//    public ResponseEntity<Map<String, Object>> getAdditional(@RequestBody Map<String, String> req) {
//        String carCode = req.get("car_code");
//        String timestamp = req.get("time");
//
//        Map<String, Object> result = new HashMap<>();
//
//        WeatherDTO dto = robotService.getWeatherData(carCode, timestamp);
//        if (dto != null) {
//            result.put("wind_dir", dto.getWindDir());
//            result.put("wind_speed", dto.getWindSpeed());
//            result.put("temperature", dto.getTemperature());
//            result.put("humidity", dto.getHumidity());
//        }
//
//        List<SensorDataDTO> sensors = robotService.getSensorData(carCode, timestamp);
//
//        return ResponseEntity.ok(result);
//    }

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
