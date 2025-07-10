package com.tsei.www.mapper.no1;

import java.util.List;

import org.apache.ibatis.annotations.Mapper;

import com.tsei.www.dto.tracking.carDTO;
import com.tsei.www.dto.robot.chemicalDataDTO;
import com.tsei.www.dto.tracking.placeDataDTO;
import com.tsei.www.vo.location;

@Mapper
public interface arimsMapper {

  public chemicalDataDTO getMsv(String chemicalName) throws Exception;


  public List<placeDataDTO> getplace() throws Exception;

  public List<chemicalDataDTO> getCarCsvContent(String detailId) throws Exception;
  public List<chemicalDataDTO> getPlaceCsvContent(String companyIndex) throws Exception;

  // 키값 사용
  // public List<chemicalDataDTO> getCarCsvContent(String detailId) throws Exception;
  // public List<chemicalDataDTO> getPlaceCsvContent(String companyIndex) throws Exception;



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

  public List<carDTO> getRealtimeCar(
    String startTime,
    String endTime,
    String selectCar,
    String lastQueryTime
  )
    throws Exception;

    public List<location> getRealtimeCarLocation(
    String startTime,
    String endTime,
    String selectCar,
    String lastQueryTime
  )
    throws Exception;

  public String[] getGPSDate(String carCode) throws Exception;

  public String[] searchPlace(String name) throws Exception;

  // 방지시설연동
  public List<placeDataDTO> searchCompany(String name) throws Exception;
}
