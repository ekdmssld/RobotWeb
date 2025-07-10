package com.tsei.www.service.robot;

import com.tsei.www.dto.robot.*;
import com.tsei.www.dto.tracking.*;
import com.tsei.www.mapper.no2.RobotMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class RobotServiceImpl implements RobotService {

    private final RobotMapper robotMapper;

    @Override
    public List<RobotLocationDTO> getRobotRoute(String startTime, String endTime, String carCode) {
        return robotMapper.getRobotRoute(startTime, endTime, carCode);
    }

    @Override
    public List<RobotLocationDTO> getRobotRouteByDate(String carCode, String startTime, String endTime){
        return robotMapper.getRobotRouteByDate(carCode, startTime, endTime);
    }

    @Override
    public List<RobotSensorDTO> getChemicalInfoByDetailId(Long detailId) {
        return robotMapper.getSensorDetailInfo(detailId);
    }


    @Override
    public List<chemicalDataDTO> getChemicalInfoByLocation(String date, String time, double lat, double lon) {
        return robotMapper.getChemicalInfoByLocation(date, time, lat, lon);
    }

    @Override
    public boolean checkHighConcentrationChemicals(List<chemicalDataDTO> chemicalList) {
        return chemicalList.stream().anyMatch(c -> c.getConcentration() > c.getThreshold());
    }

    @Override
    public List<SensorDataDTO> getSensorDataByDetailId(Long detailId, String sensorType) {
        return robotMapper.getSensorDataByDetailId(detailId, sensorType);
    }

    @Override
    public List<RobotPathDTO> getRobotMarkers(String carCode, String date) {
        return robotMapper.getRobotMarkers(carCode, date);
    }

    @Override
    public WeatherDTO getWeatherData(String carCode, String timestamp) {
        return robotMapper.getWeatherData(carCode, timestamp);
    }

    @Override
    public List<SensorDataDTO> getSensorData(String carCode, String timestamp) {
        return robotMapper.getSensorData(carCode, timestamp);
    }

    @Override
    public List<String> getAvailableDates(String carCode) {
        return robotMapper.getAvailableDates(carCode);
    }

    @Override
    public List<RobotSensorDTO> getLatestSensorWithInfo(){
        return robotMapper.getLatestSensorWithInfo();
    }

    @Override
    public Float getPpmBySensorId(Long sensorId){
        return robotMapper.getPpmBySensorId(sensorId);
    }
}
