package com.tsei.www.service.tracking;

import java.util.List;

import com.tsei.www.dto.tracking.carDTO;
import com.tsei.www.dto.robot.chemicalDataDTO;
import com.tsei.www.dto.tracking.placeDataDTO;
import com.tsei.www.vo.location;

public interface arimsService {

  // getMsvForCar
  // msvforcar 테이블에서 전체 행을 arimsMsvDataVO 타입으로 받아온다
  public chemicalDataDTO getMsv(String chemicalName) throws Exception;

  // getplace
  //place_data_ulsan 테이블에서 전체 행을 placeDataVO 타입으로 받아온다.
  public List<placeDataDTO> getplace() throws Exception;



  //getCsvContent
//차량이 관측한 화학 물질 리스트 반환
//car_sift_data 테이블에 csv_filename과 일치하는 chemical_name, chemical_value을 arims2DataVO 타입으로 반환
public List<chemicalDataDTO> getCarCsvContent(String detailId) throws Exception;

public List<chemicalDataDTO> getPlaceCsvContent(String companyIndex) throws Exception;

// 키값 사용
// public List<chemicalDataDTO> getCarCsvContent(String detailId) throws Exception;

// public List<chemicalDataDTO> getPlaceCsvContent(String companyIndex) throws Exception;


//getGpsData
// 차량 정보 반환
//car_sift_main 테이블에 Carcode를 포함하는 머신이 있는 행들 중 reg_date가 시작시간 이상 끝시간 이하인 모든 행들의 모든 필드를 arimsGpsDataVO 타입으로 반환
  public List<carDTO> getCar(
    String startTime,
    String endTime,
    String selectCar
  ) throws Exception;


  public List<location> getCarLocation(
    String startTime,
    String endTime,
    String selectCar
  ) throws Exception;

  //getRealtimeGpsData
  //car_sift_main 테이블에 Carcode를 포함하는 머신이 있는 행들중 가장 최신인 1개의 행의 모든 필드를 arimsGpsDataVO로 반환
  public List<carDTO> getRealtimeCar(
    String startTime,
    String endTime,
    String selectCar,
    String lastQueryTime
  ) throws Exception;

  public List<location> getRealtimeCarLocation(
    String startTime,
    String endTime,
    String selectCar,
    String lastQueryTime
  ) throws Exception;


  //getGPSDate
  //날짜 가져오기
//car_gps 테이블에 Carcode를 포함하는 머신이 있는 행들에서 gps_date를 reg_data 형식으로 바꾸고 그룹화한후 오름차순 정렬하고 String[] 타입으로 반환
  public String[] getGPSDate(String carCode) throws Exception;

  
  public String[] searchPlace(String name) throws Exception;


  // 방지시설연동
  public List<placeDataDTO> searchCompany(String name) throws Exception;



}
