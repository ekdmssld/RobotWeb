package com.tsei.www.service.robot;

import com.tsei.www.dto.robot.*;
import com.tsei.www.dto.tracking.*;

import java.util.List;

public interface RobotService {
    List<RobotLocationDTO> getRobotRoute(String startTime, String endTime, String carCode);

    List<RobotLocationDTO> getRobotRouteByDate(String carCode, String startTime, String endTime);

    List<RobotSensorDTO> getChemicalInfoByDetailId(Long detailId);

    List<chemicalDataDTO> getChemicalInfoByLocation(String date, String time, double lat, double lon);

    boolean checkHighConcentrationChemicals(List<chemicalDataDTO> chemicalList);

    List<SensorDataDTO> getSensorDataByDetailId(Long detailId, String sensorType);

    List<RobotPathDTO> getRobotMarkers(String carCode, String date);
    WeatherDTO getWeatherData(String carCode, String timestamp);
    List<SensorDataDTO> getSensorData(String carCode, String timestamp);
    List<String> getAvailableDates(String carCode);

    List<RobotSensorDTO> getLatestSensorWithInfo();

    Float getPpmBySensorId(Long sensorId);
}