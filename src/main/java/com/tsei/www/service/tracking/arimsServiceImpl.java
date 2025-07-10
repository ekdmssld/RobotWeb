package com.tsei.www.service.tracking;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.tsei.www.dto.robot.*;
import com.tsei.www.dto.tracking.*;
import com.tsei.www.mapper.no1.arimsMapper;
import com.tsei.www.vo.location;

@Service
public class arimsServiceImpl implements arimsService {

  @Autowired
  private arimsMapper mapper;

  @Override
  public chemicalDataDTO getMsv(String chemicalName) throws Exception {
    return mapper.getMsv(chemicalName);
  }
  @Override
  public List<placeDataDTO> getplace() throws Exception {
    return mapper.getplace();
  }
  @Override
  public List<chemicalDataDTO> getCarCsvContent(String detailId) throws Exception {
    return mapper.getCarCsvContent(detailId);
  }
  @Override
  public List<chemicalDataDTO> getPlaceCsvContent(String companyIndex) throws Exception {
    return mapper.getPlaceCsvContent(companyIndex);
  }

  // 키값 사용
  // @Override
  // public List<chemicalDataDTO> getCarCsvContent(String detailId) throws Exception {
  //   return mapper.getCarCsvContent(detailId);
  // }
  // @Override
  // public List<chemicalDataDTO> getPlaceCsvContent(String companyIndex) throws Exception {
  //   return mapper.getPlaceCsvContent(companyIndex);
  // }

  @Override
  public List<carDTO> getCar(
    String startTime,
    String endTime,
    String selectCar
  ) throws Exception {
    return mapper.getCar(startTime, endTime, selectCar);
  }


  @Override
  public List<location> getCarLocation(
    String startTime,
    String endTime,
    String selectCar
  ) throws Exception {
    return mapper.getCarLocation(startTime, endTime, selectCar);
  }


  @Override
  public List<carDTO> getRealtimeCar(
    String startTime,
    String endTime,
    String selectCar,
    String lastQueryTime
  )
    throws Exception {
    return mapper.getRealtimeCar(startTime, endTime,selectCar,lastQueryTime);
  }

  @Override
  public List<location> getRealtimeCarLocation(
    String startTime,
    String endTime,
    String selectCar,
    String lastQueryTime
  )
    throws Exception {
    return mapper.getRealtimeCarLocation(startTime, endTime,selectCar,lastQueryTime);
  }

  @Override
  public String[] getGPSDate(String carCode) throws Exception {
    return mapper.getGPSDate(carCode);
  }

  @Override
  public String[] searchPlace(String name) throws Exception{
    return mapper.searchPlace(name);
  }

  // 방지시설 연동
  @Override
  public List<placeDataDTO> searchCompany(String name) throws Exception{
    return mapper.searchCompany(name);
  }
}
