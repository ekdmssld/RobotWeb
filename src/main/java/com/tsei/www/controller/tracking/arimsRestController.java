package com.tsei.www.controller.tracking;

import com.tsei.www.service.tracking.arimsService;
import java.util.HashMap;
import java.util.Map;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;


@CrossOrigin
@RestController
@RequestMapping("/arims")
public class arimsRestController {

  @Autowired
  private arimsService service;


  // 발생원 리스트 가져오기
  @GetMapping("/place")
  public Map<String, Object> getplace() throws Exception {
    Map<String, Object> map = new HashMap<String, Object>();
    map.put("list", service.getplace());
    return map;
  }



  // selectcar(선택한 차유형)에 따라 gps_date를 reg_data로 변환하여 오름차순 정렬한 데이터 반환
  // 요청 형식
  // /date?carCode="S1"
  // 응답 형식
  // [
  //  "2024-01-31 10:13:00"
  //  "2024-02-01 10:14:00",
  //  "2024-02-04 10:15:00",
  //   "2024-02-08 10:16:00"
  // ]
  @GetMapping("/date")
  public String[] getGPSDate(@RequestParam(value = "carCode") String carCode)
          throws Exception {
    String[] mDate = service.getGPSDate(carCode);
    return mDate;
  }

  @GetMapping("/searchPlaceName")
  public String[] searchPlace(@RequestParam(value = "name") String name)
          throws Exception {
    String[] place = service.searchPlace(name);
    return place;
  }

  @GetMapping("/msv")
  public Object getMsv(@RequestParam(value = "chemicalName") String chemicalName) throws Exception {
    return service.getMsv(chemicalName);
  }

 @GetMapping("/arimsRealtimeCar")
  public Map<String, Object> getRealtimeCar(
          @RequestParam(value = "selectDate") String selectDate,
          @RequestParam(value = "selectCar") String selectCar,
          @RequestParam(value = "lastQueryTime") String lastQueryTime
  ) throws Exception {
    Map<String, Object> map = new HashMap<String, Object>();

    String firstAddTime = ":00:00";
    String secondAddTime = ":59:59";
    String startTime = selectDate + " " + "00" + firstAddTime;
    String endTime = selectDate + " " + "23" + secondAddTime;

    map.put("list", service.getRealtimeCar(startTime, endTime, selectCar, lastQueryTime));
    return map;
  }


  @GetMapping("/arimsRealtimeCarLocation")
  public Map<String, Object> getRealtimeCarLocation(
          @RequestParam(value = "selectDate") String selectDate,
          @RequestParam(value = "selectCar") String selectCar,
          @RequestParam(value = "lastQueryTime") String lastQueryTime
  ) throws Exception {
    Map<String, Object> map = new HashMap<String, Object>();

    String firstAddTime = ":00:00";
    String secondAddTime = ":59:59";
    String startTime = selectDate + " " + "00" + firstAddTime;
    String endTime = selectDate + " " + "23" + secondAddTime;

    map.put("list", service.getRealtimeCarLocation(startTime, endTime, selectCar, lastQueryTime));
    return map;
  }

  // selectcar(선택한 차유형)과 selectDate(선택한 날짜)에 따른 모든 gps 데이터 반환
  // 로직에 selectTime을 사용하지않음
  // 요청 형식
  // /arimsGpsData?selectDate="2024-01-12"&selectTime="00:13:12"&selectCar="S1"
  // 응답 형식
  // {
  //  "list": [
  //   {
  //    "carLocationId": 2,
  //    "latitude" : 35.544353,
  //    "longitude": 129.327673,
  //    "airPressure" : null,
  //    "csvFilename" : "fadfas",
  //    "date" : 2024-01-31 10:13:00
  //    },
  //   {
  //    "carLocationId": 3,
  //    "latitude" : 35.544353,
  //    "longitude": 129.327673,
  //    "airPressure" : null,
  //    "csvFilename" : "fadfas",
  //    "date" : 2024-01-31 10:13:00
  //    }]}
  @GetMapping("/arimsCar")
  public Map<String, Object> getCar(
          @RequestParam(value = "selectDate") String selectDate,
          @RequestParam(value = "selectCar") String selectCar
  ) throws Exception {
    Map<String, Object> map = new HashMap<String, Object>();

    String firstAddTime = ":00:00";
    String secondAddTime = ":59:59";
    String startTime = selectDate + " " + "00" + firstAddTime;
    String endTime = selectDate + " " + "23" + secondAddTime;

    map.put("list", service.getCar(startTime, endTime, selectCar));
    return map;
  }

  @GetMapping("/arimsCarLocation")
  public Map<String, Object> getCarLocation(
          @RequestParam(value = "selectDate") String selectDate,
          @RequestParam(value = "selectCar") String selectCar
  ) throws Exception {
    Map<String, Object> map = new HashMap<String, Object>();

    String firstAddTime = ":00:00";
    String secondAddTime = ":59:59";
    String startTime = selectDate + " " + "00" + firstAddTime;
    String endTime = selectDate + " " + "23" + secondAddTime;

    map.put("list", service.getCarLocation(startTime, endTime, selectCar));
    return map;
  }


  @GetMapping("/arimsCarLocation/endtime")
  public Map<String, Object> getCarLocationEndtime(
          @RequestParam(value = "selectDate") String selectDate,
          @RequestParam(value = "selectCar") String selectCar,
          @RequestParam(value = "endtime") String endtime
  ) throws Exception {
    Map<String, Object> map = new HashMap<String, Object>();

    String firstAddTime = ":00:00";
    String startTime = selectDate + " " + "00" + firstAddTime;
    String endTime = endtime;

    map.put("list", service.getCarLocation(startTime, endTime, selectCar));
    return map;
  }


  //sampleFile과 일치하는 chemical_name, chemical_value를 반환한다.
  // 요청 형식
  // /arimsCsvContent?fileName="afasd231ffdsd13"
  // 응답 형식
  // {
  //  "list": [
  //   {
  //      "chemical_name": "acetic acid",
  //      "chemical_value": 24.424
  //    },
  //   {
  //      "chemical_name": "acetic acid",
  //      "chemical_value": 24.424
  //    }]
  // }
  @GetMapping("/arimsCarCsvContent")
  public Map<String, Object> getCarCsvContent(
          @RequestParam(value = "detail_id") String detailId
  ) throws Exception {
    Map<String, Object> map = new HashMap<String, Object>();
    map.put("list", service.getCarCsvContent(detailId));
    return map;
  }

  @GetMapping("/arimsPlaceCsvContent")
  public Map<String, Object> getPlaceCsvContent(
          @RequestParam(value = "company_id") String companyIdex
  ) throws Exception {
    Map<String, Object> map = new HashMap<String, Object>();
    map.put("list", service.getPlaceCsvContent(companyIdex));
    return map;
  }

  // 키값 사용
  // @GetMapping("/arimsCarCsvContent")
  // public Map<String, Object> getCarCsvContent(
  //         @RequestParam(value = "detail_id") String detailId
  // ) throws Exception {
  //   Map<String, Object> map = new HashMap<String, Object>();
  //   map.put("list", service.getCarCsvContent(detailId));
  //   return map;
  // }

  // @GetMapping("/arimsPlaceCsvContent")
  // public Map<String, Object> getPlaceCsvContent(
  //         @RequestParam(value = "company_id") String companyIdex
  // ) throws Exception {
  //   Map<String, Object> map = new HashMap<String, Object>();
  //   map.put("list", service.getPlaceCsvContent(companyIdex));
  //   return map;
  // }

  // 방지시설프로그램 연동용
  @GetMapping("/searchCompany")
  public Map<String, Object> searchCompany(@RequestParam(value="name") String name) throws Exception{
    Map<String,Object> map = new HashMap<String, Object>();
    map.put("list",service.searchCompany(name));
    return map;    
  }


}
