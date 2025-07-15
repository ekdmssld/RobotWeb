package com.tsei.www.mapper.no2;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import com.tsei.www.dto.robot.*;
import com.tsei.www.dto.tracking.*;

import java.util.List;

@Mapper
public interface RobotMapper {

    // 로봇 경로 조회
    List<RobotLocationDTO> getRobotRoute(@Param("startTime") String startTime,
                                         @Param("endTime") String endTime,
                                         @Param("carCode") String carCode);

    List<RobotLocationDTO> getRobotRouteByDate(@Param("carCode") String carCode,
                                               @Param("startTime") String startTime,
                                               @Param("endTime") String endTime);


    List<RobotSensorDTO> getSensorDetailInfo(Long detailId);

    List<chemicalDataDTO> getChemicalInfoByLocation(String date, String time, double lat, double lon);

    // 로봇 분석 csv 내용 조회 (화학 정보)
    List<chemicalDataDTO> getRobotCsvContent(@Param("detailId") Long detailId);

    List<SensorDataDTO> getSensorDataByDetailId(@Param("detailId") Long detailId,
                                                @Param("carCode") String carCode);

    List<RobotPathDTO> getRobotMarkers(@Param("carCode") String carCode, @Param("date") String date);

    WeatherDTO getWeatherData(@Param("carCode") String carCode, @Param("timestamp") String timestamp);

    List<SensorDataDTO> getSensorData(@Param("carCode") String carCode, @Param("timestamp") String timestamp);

    List<String> getAvailableDates(@Param("carCode") String carCode);

    List<RobotSensorDTO> getLatestSensorWithInfo();

//    모달창 띄우기 ppm_ref_go
    Float getPpmBySensorId(Long sensorId);
    WeatherDTO findCloseWeather(@Param("carCode") String carCode,
                                @Param("timestamp") String timestamp);

}


