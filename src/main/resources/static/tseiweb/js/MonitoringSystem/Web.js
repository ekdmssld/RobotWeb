

class Web {
  constructor() {
    this.customMap = null;
    this.analysisModal = null;
    this.compareModal = null;
    this.loading = null;
    this.carList = null;
    this.sourcePlaceList = null;
    this.sequentialCarIndex = 0;
    this.rangeValue = 0;
    this.lastCarID = null;
  }

  //웹 초기화(데이터 초기화 및 데이터 세팅)
  async init() {
    return new Promise((resolve, reject) => {
      
      //로딩, 모달, 지도 객체 생성
      this.loading = new Loading("loading-anim", "process-bar");
      this.analysisModal = new AnalysisModal("analysisModal");
      this.compareModal = new CompareModal("compareModal");
      this.customMap = new CustomMap(this.analysisModal, this.compareModal);

      // 모드 가져오기("전체" , "순차적" , "실시간")
      var mode = $("#selectQueue option:selected").val();

      if (mode == "전체") {
        // 지도 중심위치 지정 및 초기화
        this.customMap
          .init(35.456966, 129.32799)
          .then(async () => {
            // 차량 및 장소 객체 선언
            this.carList = new CarList(this.customMap.map, this.customMap);
            this.sourcePlaceList = new SourcePlaceList(
              this.customMap.map,
              this.customMap
            );

            // 지도객체 차량 및 장소 객체 참조 추가
            this.customMap.setCarList(this.carList);
            this.customMap.setPlaceList(this.sourcePlaceList);

            // 차량 및 장소 데이터 세팅
            await this.setData();
            this.loading.loading_off();
            resolve(); 
          })
          .catch((error) => {
            reject(error); // 오류 발생 시 Promise reject 호출
          });
      } else if (mode == "순차적") {
        // 지도 중심위치 지정 및 초기화
        this.customMap
          .init(35.456966, 129.32799)
          .then(async () => {
            //차량 및 장소 객체 선언
            this.carList = new CarList(this.customMap.map, this.customMap);
            this.sourcePlaceList = new SourcePlaceList(
              this.customMap.map,
              this.customMap
            );
            // 지도 객체 차량 및 장소 객체 참조 추가
            this.customMap.setCarList(this.carList);
            this.customMap.setPlaceList(this.sourcePlaceList);

            // 순차적 모드 데이터 세팅
            await this.setSequentialData();
            this.loading.loading_off();
            resolve(); // 작업 완료 후 Promise resolve 호출
          })
          .catch((error) => {
            reject(error); // 오류 발생 시 Promise reject 호출
          });
      } else {
        // 지도 중심위치 지정 및 초기화
        this.customMap
          .init(35.456966, 129.32799)
          .then(async () => {
            //차량 및 장소 객체 선언
            this.carList = new CarList(this.customMap.map, this.customMap);
            this.sourcePlaceList = new SourcePlaceList(
              this.customMap.map,
              this.customMap
            );
             // 지도 객체 차량 및 장소 객체 참조 추가
            this.customMap.setCarList(this.carList);
            this.customMap.setPlaceList(this.sourcePlaceList);
            // 폴링을 통한 차량 실시간 데이터 감지 및 데이터 세팅
            this.fetchRealtimeCar();
            this.fetchRealtimeCarLocation();
            realtime_interval = setInterval(this.fetchRealtimeCar, 1000);
            realtime_interval2 = setInterval(this.fetchRealtimeCarLocation,1000);
            // 마지막 조회시간 초기화 로직 
            realtime_interval_time = setInterval(this.setIntervalTime, 1000);

            // 운행내역 Select 데이터 추가
            await this.makeDate();
            //장소데이터 추가
            await this.setPlaceData();
            this.loading.loading_off();
            resolve(); // 작업 완료 후 Promise resolve 호출
          })
          .catch((error) => {
            reject(error); // 오류 발생 시 Promise reject 호출
          });
      }
    });

  }

  //차량 조회기능
  searchCar() {

    //차량 검색 select 값 가져오기
    const selectedCarIndex = document.getElementById("selectCarMarker").value;
    //차량리스트에서 select 값과 같은 마커 가져오기
    const selectedCar = this.carList.cars.find(
      (car) => car.titleIndex === parseInt(selectedCarIndex)
    );

    // 검색결과가 있는 경우
    if (selectedCar) {
      // 차량 click시 바뀌는 빨간색 끄기
      this.customMap.clickoffCar();
      // 지도 중심 설정
      this.customMap.map.setCenter(selectedCar.marker.getPosition());
      // 지도 줌 레벨 설정
      this.customMap.map.setZoom(25);
      // 차량 마커 클릭이벤트 실행(모달에 화학물질 보여주기, 원 및 부채꼴 그리기 등)
      selectedCar.checkmarker_event_start();
    } else {
      console.log("해당하는 차량을 찾을 수 없습니다.");
    }
  }

  // 장소 검색기능
  searchPlace() {
    // 장소 검색창에 입력한 값 가져오기
    const selectedPlaceTitle =
      document.getElementById("selectPlaceMarker").value;

    // 장소 리스트에서 검색창에 입력한 값고 이름이 같은 마커 가져오기
    var selectedPlace = this.sourcePlaceList.places.find(
      (place) => place.getTitle() == selectedPlaceTitle
    );

    // 검색결과가 있는 경우
    if (selectedPlace) {
      // 장소 클릭시 빨간색 제거
      this.customMap.clickoffPlace();
      // 지도 중심 설정
      this.customMap.map.setCenter(selectedPlace.getLocation());
      // 지도 줌 레벨 설정
      this.customMap.map.setZoom(25);
      // 장소 마커 클릭 이벤트 시작(모달에 장소 화학물질 보여주기)
      selectedPlace.checkmarker_event_start();
    } else {
      console.log("해당하는 장소를 찾을 수 없습니다.");
    }
  }

  // 좌측메뉴 장소이름 클릭시 일어나는 이벤트
  clickPlaceSearch(obj) {
    // 클릭한 장소이름 가져오기
    const selectedPlaceTitle = obj.target.innerHTML;
    // 장소리스트에서 장소이름이 같은 객체 가져오기
    var selectedPlace = this.sourcePlaceList.places.find(
      (place) => place.getTitle() == selectedPlaceTitle
    );

    // 검색결과가 있는 경우
    if (selectedPlace) {
      // 중심 지정
      this.customMap.map.setCenter(selectedPlace.getLocation());
      // 줌레벨 지정
      this.customMap.map.setZoom(25);
      // 장소 마커 클릭 이벤트
      selectedPlace.checkmarker_event_start();
    } else {
      console.log("해당하는 장소를 찾을 수 없습니다.");
    }
  }

  // 전체 리스트 데이터 세팅하기
  async setData() {
    // 선택된 차량 유형(S1, S2) 가져오기
    var selectCar =
      $("#selectCar option:selected").val() ||
      $("#selectCar option:first").val();
    //차량검색 select 세팅하기
    await this.makeDate();
    // 선택된 운행 내역 가져오기
    var selectDate = $("#selectDate option:selected").val();

    // 병렬적으로 차량 데이터 , GPS 데이터, 장소 데이터 가져오기
    const [carDataList, placeLoacationList, carLocationList] =
      await Promise.all([
        this.getCarData(selectCar, selectDate),
        this.getPlacesData(),
        this.getCarLocationData(selectCar, selectDate),
      ]);

    const promises = [];
    // 장소리스트에 장소 데이터 세팅하기
    placeLoacationList.forEach((data) => {
      promises.push(
        this.sourcePlaceList.addPlace(
          data.companyIndex,
          data.name,
          {
            lat: data.latitude,
            lng: data.longitude,
          },
          data.csvFilename,
          data.odor
        )
      );
    });
    await Promise.all(promises);

    const promises2 = [];
    // 차량 리스트에 차량 GPS 데이터 등록
    carLocationList.forEach((data) => {
      promises2.push(
        this.carList.addPath({ lat: data.latitude, lng: data.longitude })
      );
    });
    await Promise.all(promises2);

    // 차량 리스트에 차량 세부 데이터 등록
    await carDataList.forEach((data) => {
      if (data.latitude !== 0 && data.longitude !== 0) {
        this.carList.addCar(
          data.carId,
          { lat: data.latitude, lng: data.longitude },
          data.date,
          data.detailId,
          data.csvFilename,
          data.windDirection
        );
      }
    });
    
    // GPS 경로 그리기
    this.carList.drawPath();
    // 차량 클러스터링 하기
    this.sourcePlaceList.makeCluster();
    //console.log("클러스터러" , this.sourcePlaceList.clusterer)

    // 정상 동작 확인
    if (this.customMap != null) {
      createToast(
        "success",
        `페이지 로드 완료! ${
          Object.keys(placeLoacationList).length
        }개의 사업장을 불러왔습니다.`
      );
    } else
      createToast(
        "error",
        "지도 불러오기에 실패하였습니다. 새로고침 바랍니다."
      );
  }

  // 순차적 데이터 세팅하기
  async setSequentialData() {
     // 선택된 차량 유형(S1, S2) 가져오기
    var selectCar =
      $("#selectCar option:selected").val() ||
      $("#selectCar option:first").val();
    //차량검색 select 세팅하기
    await this.makeDate();
    // 선택된 운영내역 가져오기
    var selectDate = $("#selectDate option:selected").val();

    console.log(selectDate, selectCar);

    // 차량데이터 및 장소 데이터 병렬적으로 가져오기
    const [carDataList, placeLoacationList] = await Promise.all([
      this.getCarData(selectCar, selectDate),
      this.getPlacesData(),
    ]);
    const promises = [];
    // 장소 리스트에 장소 데이터 등록
    placeLoacationList.forEach((data) => {
      promises.push(
        this.sourcePlaceList.addPlace(
          data.companyIndex,
          data.name,
          {
            lat: data.latitude,
            lng: data.longitude,
          },
          data.csvFilename,
          data.odor
        )
      );
    });

    await Promise.all(promises);
    // 장소 클러스터링
    this.sourcePlaceList.makeCluster();
    // 정상 동작 확인
    if (this.customMap != null) {
      createToast(
        "success",
        `페이지 로드 완료! ${
          Object.keys(placeLoacationList).length
        }개의 사업장을 불러왔습니다.`
      );
    } else
      createToast(
        "error",
        "지도 불러오기에 실패하였습니다. 새로고침 바랍니다."
      );

    // 1.5초 간격으로 차량 세부 마커 생성 및 일부 GPS 경로 그리기 
    sequential_interval = setInterval(() => {
      this.sequentialCar(carDataList);
    }, 1500);

    //console.log("클러스터러" , this.sourcePlaceList.clusterer)
  }

  // 차량 세부 마커 생성 및 일부 GPS 경로 그리기 
  async sequentialCar(carDataList) {
    // Interval의 실행 횟수가 차량 데이터 크기와 같으면 끝
    if (carDataList.length == web.sequentialCarIndex) {
      clearInterval(sequential_interval);
      return;
    }
    // select에 선택된 차량 유형 가져오기
    var selectCar =
      $("#selectCar option:selected").val() ||
      $("#selectCar option:first").val();
    // select에 선택된 운행 내역 가져오기
    var selectDate = $("#selectDate option:selected").val();
    // 인터벌 횟수에 대한 차량 데이터 가져오기
    const data = carDataList[web.sequentialCarIndex];
    // 지도 중심 좌표 설정
    web.customMap.map.setCenter(
      new google.maps.LatLng(data.latitude, data.longitude)
    );
    // 지도 줌 설정
    web.customMap.map.setZoom(25);
    
    //임계값
    var threshold = 0.00002;
    // gps 정보 가져오기(선택된 날짜 차량 세부 데이터 생성 시간 > target > 선택된 날짜 00:00)
    var carLocationList = await web.getCarLocationDataTime(
      selectCar,
      selectDate,
      data.date
    );
    // gps 정보 필터링 하기
    var filterCarLocationList = [];
    for (const gpsData of carLocationList) {
      filterCarLocationList.push(gpsData);
      if (
        Math.abs(gpsData.latitude - data.latitude) < threshold &&
        Math.abs(gpsData.longitude - data.longitude) < threshold
      )
        break;
    }
    
    // 차량 리스트에 필터링한 gps 데이터 추가 및 차량리스트에 상세정보 데이터 추가
    carLocationList = filterCarLocationList;
    const promises2 = [];
    carLocationList.forEach((locationData) => {
      promises2.push(
        web.carList.addRealtimePath({
          lat: locationData.latitude,
          lng: locationData.longitude,
        })
      );
    });
    await Promise.all(promises2);
    web.carList.addRealtimeCar(
      data.carId,
      { lat: data.latitude, lng: data.longitude },
      data.date,
      data.detailId,
      data.csvFilename,
      data.windDirection
    );

    // gps 경로그리기
    web.carList.drawPath();
    // 차량 검색 select 만들기
    this.carList.makeSelectionCar();
    // 인덱스 올리기
    web.sequentialCarIndex += 1;
  }

  // 장소 데이터 세팅
  async setPlaceData() {
    // 장소 데이터 가져오기
    const [placeLoacationList] = await Promise.all([this.getPlacesData()]);

    const promises = [];
    // 장소 리스트에 데이터 추가하기
    placeLoacationList.forEach((data) => {
      promises.push(
        this.sourcePlaceList.addPlace(
          data.companyIndex,
          data.name,
          {
            lat: data.latitude,
            lng: data.longitude,
          },
          data.csvFilename,
          data.odor
        )
      );
    });
    await Promise.all(promises);

    //장소마커 클러스터링
    this.sourcePlaceList.makeCluster();

    // 정상 실행 확인
    if (this.customMap != null) {
      this.setIntervalTime();
      createToast(
        "success",
        `페이지 로드 완료! ${
          Object.keys(placeLoacationList).length
        }개의 사업장을 불러왔습니다.`
      );
    } else
      createToast(
        "error",
        "지도 불러오기에 실패하였습니다. 새로고침 바랍니다."
      );
  }


  // 일괄적으로 이벤트 추가하기
  addEventListeners() {

    // 연관검색어 표시 이벤트
    $("#selectPlaceMarker").on("input", this.searchInputEvent);

    // 운행 내역, 모드 선택 인터페이스 검색
    document.getElementById("searchGPS").addEventListener("click", () => {
      this.search(); 
    });

    // 차량선택시 운행날짜목록 갱신
    document.getElementById('selectCar').addEventListener('change', e => {
      // console.log("ddd");
      // this.wait().then(this.makeDate());
      this.makeDate(e);
    });

    // 차량 검색
    document
      .getElementById("searchCar")
      .addEventListener("click", () => {
        this.searchCar(); 
      });

    // 장소 검색
    document
      .getElementById("searchPlace")
      .addEventListener("click", () => {
        this.searchPlace(); 
      });


    // 분석결과 on/off 이벤트
    document
      .getElementById("marker_hidden_slide")
      .addEventListener("change", function () {
        if (this.checked) {
          web.analysisModal.modal.style.display = "block";
          web.compareModal.modal.style.display = "block";
        } else {
          web.analysisModal.modal.style.display = "none";
          web.compareModal.modal.style.display = "none";
        }
      });

      // 좌측메뉴 클릭이벤트
      this.addClickSearchEvent();


    // 연관검색어 입력창 포커스 꺼질때 이벤트
    $("#selectPlaceMarker").blur(function () {
      if (mouseover) {
        document.getElementById("selectPlaceMarker").value = mouseover.text();
      }
      $("#selectPlaceMarker").on("input", this.searchInputEvent);
      $("#relatedKeywords").hide();
    });

    // 모드 변경시 이벤트
    $("#selectQueue").change(function () {
      if ($("#selectQueue").val() == "실시간") {
        $("#selectDate").prop("disabled", true); // 선택되면 disabled 설정
      } else if ($("#selectQueue").val() == "전체") {
        $("#selectDate").prop("disabled", false); // 다른 곳이 선택되면 disabled 해제
      } else {
        $("#selectDate").prop("disabled", false);
      }
    });

  }

  // 연관 검색어 데이터 불러오는 이벤트
  async searchInputEvent() {
    
    // 입력한 값 가져오기
    var search = $("#selectPlaceMarker").val();

    if (search.length > 0) {
      // 입력한 값으로 시작하는 장소 리스트 가져오기
      var placenames = await web.searchPlaceName(search);
      if (placenames.length == 0) {
        $("#relatedKeywords").hide();
      } else {
        // 연관 검색어 창 만들기
        web.displayRelatedKeywords(placenames);
      }
    }
  }

  // 연관 검색어 창 만들기
  displayRelatedKeywords(keywords) {
    // 연관 검색어 창 보이기
    $("#relatedKeywords").show();

    // 연관 검색어 창 객체 가져오기
    var relatedKeywordsDiv = $("#relatedKeywords");
    // 기존 연관 검색어 창 데이터 지우기
    relatedKeywordsDiv.empty(); 

    // 연관 검색어 창 만들기
    if (keywords.length > 0) {
      var ul = $("<ul>");

      keywords.forEach(function (keyword) {
        var li = $("<li>").text(keyword);
        // 연관 검색어 요소 객체 클릭 이벤트 추가하기
        li.click(function () {
          // 검색어 입력창 이벤트 끄기
          $("#selectPlaceMarker").off("input");
          // 검색어 입력창에 클릭한 데이터 가져오기
          $("#selectPlaceMarker").val(keyword); 
          // 검색어 입력창 이벤트 키기
          $("#selectPlaceMarker").on("input", web.searchInputEvent);
          // 검색어 입력창 포커스 없애기
          $("#selectPlaceMarker").blur();
          // 연관검색어 창 없애기
          $("#relatedKeywords").hide();
        });

        // 연관 검색어 요소 마우스 올릴때 이벤트
        li.on("mouseover", function () {
          // 마우스 오버한 객체 전역으로 선언된 mouseover에 넣기
          mouseover = li;
        });

        // 연관 검색어 요소 마우스 땔때 이벤트
        li.on("mouseout", function () {
          // 마우스 오버한 객체 전역으로 선언된 mouseover 초기화 하기
          mouseover = null;
        });

        ul.append(li);
      });

      relatedKeywordsDiv.html(ul);
    } else {
      relatedKeywordsDiv.text("검색 결과가 없습니다.");
    }
  }

  // 좌측 메뉴 클릭 이벤트 일괄 추가하기
  addClickSearchEvent() {
    const clickSearchPlaceEvent = (event) => {
      this.clickPlaceSearch(event); 
    };

    // 반경내 사업장 클릭 이벤트
    const inRadiusElements = document.querySelectorAll(".inRadius");
    inRadiusElements.forEach((element) => {
      element.addEventListener("click", clickSearchPlaceEvent);
    });

    // 부채꼴 내 일치사업장 클릭이벤트
    const matchingElements = document.querySelectorAll(".matching");
    matchingElements.forEach((element) => {
      element.addEventListener("click", clickSearchPlaceEvent);
    });

    // 악취원인예측 사업장 클릭이벤트
    const resultElements = document.querySelectorAll(".result_place");
    resultElements.forEach((element) => {
      element.addEventListener("click", clickSearchPlaceEvent);
    });
  }

  // 좌측 메뉴중 반경 사업장에만 클릭 이벤트 추가하기
  addClickInRadiusEvent() {
    const clickSearchPlaceEvent = (event) => {
      this.clickPlaceSearch(event);
    };

    const inRadiusElements = document.querySelectorAll(".inRadius");
    inRadiusElements.forEach((element) => {
      element.addEventListener("click", clickSearchPlaceEvent);
    });
  }

   // 좌측 메뉴중 부채꼴 내 사업장에만 이벤트 추가하기
  addClickMatchingEvent() {
    const clickSearchPlaceEvent = (event) => {
      this.clickPlaceSearch(event);
    };

    const matchingElements = document.querySelectorAll(".matching");
    matchingElements.forEach((element) => {
      element.addEventListener("click", clickSearchPlaceEvent);
    });
  }

  // 운행 내역 및 모드 선택 인터페이스 검색 이벤트
  search() {

    // 모드 관련 내용 초기화
    this.sequentialCarIndex = 0;
    clearInterval(realtime_interval);
    clearInterval(realtime_interval2);
    clearInterval(realtime_interval_time);
    clearInterval(sequential_interval);

    // web 초기화
    this.init().then(() => {
      this.carList.makeSelectionCar();
    });
  }

  // 차량세부데이터 가져오기
  async getCarData(category, date) {
    const url = `/arims/arimsCar?selectCar=${category}&selectDate=${date}`;

    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      const data = await response.json();
      return data.list;
    } catch (error) {
      console.error(
        "There has been a problem with your fetch operation:",
        error
      );
      return [];
    }
  }

   // 실시간 차량세부정보 가져오기
  async fetchRealtimeCar() {
    const selectDate = web.setToday();
    const selectCar = $("#selectCar option:selected").val();
    console.log("lastQueryTime", lastQueryTime);
    const url = `/arims/arimsRealtimeCar?selectDate=${selectDate}&selectCar=${selectCar}&lastQueryTime=${lastQueryTime}`;

    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      const datas = await response.json();
      console.log("newCarDetailData", datas);
      if (!(datas.list.length == 0)) {
        datas.list.forEach((data) => {
          // if(this.lastCarID !== data.carId)
            web.carList.addRealtimeCar(
              data.carId,
              { lat: data.latitude, lng: data.longitude },
              data.date,
              data.detailId,
              data.csvFilename,
              data.windDirection
            );
            // this.lastCarID = data.carId;
        });

        web.carList.makeSelectionCar();
      }
    } catch (error) {
      console.error(
        "There has been a problem with your fetch operation:",
        error
      );
    }
  }

  // 오늘 날짜 데이터 포멧팅(0000-00-00 00:00:00)
  setIntervalTime() {
    const date = new Date(new Date().toISOString());
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0"); // 월은 0부터 시작하므로 +1 필요
    const day = String(date.getDate()).padStart(2, "0");
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
    const seconds = String(date.getSeconds()).padStart(2, "0");

    lastQueryTime = `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
  }

  // 오늘 날짜 데이터 포멧팅(0000-00-00)
  setToday() {
    const date = new Date(new Date().toISOString());
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0"); // 월은 0부터 시작하므로 +1 필요
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }

  // 실시간 차량 위치데이터 세팅 및 경로그리기
  async fetchRealtimeCarLocation() {
    const selectDate = web.setToday();
    const selectCar = $("#selectCar option:selected").val();
    const url = `/arims/arimsRealtimeCarLocation?selectDate=${selectDate}&selectCar=${selectCar}&lastQueryTime=${lastQueryTime}`;

    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      const datas = await response.json();
      console.log("newCarLocationdata", datas);
      if (!(datas.list.length == 0)) {
        datas.list.forEach((data) => {
          web.carList.addRealtimePath({
            lat: data.latitude,
            lng: data.longitude,
          });
        });
        web.carList.drawPath();
      }
    } catch (error) {
      console.error(
        "There has been a problem with your fetch operation:",
        error
      );
    }
  }

  // 차량 위치데이터 가져오기
  async getCarLocationData(category, date) {
    const url = `/arims/arimsCarLocation?selectCar=${category}&selectDate=${date}`;

    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      const data = await response.json();
      //console.log('Fetched car data:', data.list);
      return data.list;
    } catch (error) {
      console.error(
        "There has been a problem with your fetch operation:",
        error
      );
      return [];
    }
  }

  // 날짜의 00시 00분 부터 endtime 까지의 차량위치데이터 가져오기
  async getCarLocationDataTime(category, date, endtime) {
    const url = `/arims/arimsCarLocation/endtime?selectCar=${category}&selectDate=${date}&endtime=${endtime}`;

    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      const data = await response.json();
      //console.log('Fetched car data:', data.list);
      return data.list;
    } catch (error) {
      console.error(
        "There has been a problem with your fetch operation:",
        error
      );
      return [];
    }
  }

  //장소데이터 가져오기
  async getPlacesData() {
    try {
      const response = await fetch("/arims/place");
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      const data = await response.json();
      // 장소 이름 중복 제거
      return this.makeNamesUnique(data.list);
    } catch (error) {
      console.error("Error fetching places data:", error);
      return [];
    }
  }

  // 중복 이름 번호 붙이기
  makeNamesUnique(dataList) {
    // 각 요소의 name이 중복되지 않도록 고유하게 변경
    const nameCounts = {}; // 각 name의 등장 횟수를 저장하는 객체

    return dataList.map((item) => {
      let originalName;
      let newName;

      if (!item.hasOwnProperty("name")) {
        // item.name이 없는 경우, item 자체를 이름으로 사용
        originalName = item; // 객체를 문자열로 변환
        newName = originalName;
      } else {
        // item.name이 있는 경우, 기존 로직을 사용
        originalName = item.name;
        newName = originalName;
      }

      // nameCounts에 해당 name이 없으면 초기화
      if (nameCounts[originalName] === undefined) {
        nameCounts[originalName] = 0;
      } else {
        // nameCounts에 해당 name이 있으면 카운트를 증가시키고 newName을 변경
        nameCounts[originalName]++;
        newName = `${originalName}-${nameCounts[originalName]}`;
      }

      // item.name이 없는 경우, item 자체를 새로운 이름으로 설정
      if (!item.hasOwnProperty("name")) {
        return newName;
      } else {
        // item.name이 있는 경우, item.name을 새로운 이름으로 설정
        item.name = newName;
        return item;
      }
    });
  }

  // 운행내역 select 날짜넣기
  async makeDate(event) {
    const select = document.getElementById("selectDate");

    if ((select.getElementsByTagName("option").length == 0) || event) {
      // 내부 초기화
      select.innerHTML = "";

      // 차량 유형 가져오기
      const selectCar = $("#selectCar option:selected").val();
      // 날짜 데이터 가져오기
      const date = await this.getDate(selectCar);

      // 각 날짜를 select에 추가
      date.forEach((date, index) => {
        const option = document.createElement("option");
        option.text = date;
        option.value = date;
        
        // 특정 차량의 특정 날짜 강조
        if(selectCar === 'S2' && date === '2024-01-26') {
			option.style.backgroundColor = "#fdd835";
		}
		
        // 첫번째 옵션이 기본적으로 선택되도록 설정
        if (index === 0) {
          option.selected = true;
        }
        select.appendChild(option);
      });
    }
  }
  // 날짜데이터 가져오기
  async getDate(category) {
    const url = `/arims/date?carCode=${category}`;

    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      const data = await response.json();
      return data;
    } catch (error) {
      console.error(
        "There has been a problem with your fetch operation:",
        error
      );
      return [];
    }
  }

  // 장소 이름데이터 가져오기
  async searchPlaceName(name) {
    const url = `/arims/searchPlaceName?name=${name}`;

    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      const data = await response.json();
      return this.makeNamesUnique(data);
    } catch (error) {
      console.error(
        "There has been a problem with your fetch operation:",
        error
      );
      return [];
    }
  }
  // async getRobotPath(carCode, date) {
  //   const startTime = `${date} 00:00:00`;
  //   const endTime = `${date} 23:59:59`;
  //   const url = `/arims/robot/path?startTime=${startTime}&endTime=${endTime}&carCode=${carCode}`;
  //
  //   try {
  //     const response = await fetch(url);
  //     if (!response.ok) throw new Error("Network error");
  //     const data = await response.json();
  //     return data;
  //   } catch (err) {
  //     console.error("로봇 경로 fetch 오류:", err);
  //     return [];
  //   }
  // }
}


// 전역 변수 선언
const web = new Web();
let lastQueryTime;
window.web = web;
var realtime_interval;
var realtime_interval2;
var realtime_interval_time;
var sequential_interval;
var mouseover = null;


// DOM 실행시 동작
const initListener = async () => {
  try {
    await web.init();
    web.addEventListeners();
    web.carList.makeSelectionCar();
  } catch (error) {
    console.error("Initialization failed:", error);
  }
};

document.addEventListener("DOMContentLoaded", initListener);


