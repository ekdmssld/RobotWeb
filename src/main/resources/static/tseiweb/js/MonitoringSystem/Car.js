class Car {
  constructor(
    map,
    customMap,
    titleIndex,
    carIndex,
    latitude,
    longitude,
    date,
    detailId,
    csvFileName,
    windDirection
  ) {
    this.map = map;
    this.customMap = customMap;
    this.titleIndex = titleIndex;
    this.carIndex = carIndex;
    this.latitude = latitude;
    this.longitude = longitude;
    this.detailId = detailId;
    this.csvFileName = csvFileName;
    this.direction = windDirection;
    this.chemicalData;
    this.marker = null;
    this.radius = 500;
    this.date = date;
    this.clickListener = null;
    this.angle = 30;
    this.createMarker();
  }

  // 차량 관측지점의 위치를 구글 위치 객체로 반환
  getLocation() {
    console.log(this.latitude);
    console.log(this.longitude);

    return new google.maps.LatLng(this.latitude, this.longitude);
  }

  // 관측지점 마커 생성
  createMarker() {

    this.marker = new google.maps.Marker({
      position: this.getLocation(),
      map: this.map,
      icon: {
        path: google.maps.SymbolPath.CIRCLE,
        scale: 10,
        fillColor: "green",
        fillOpacity: 1.0,
        strokeColor: "#FFFFFF",
        strokeOpacity: 1.0,
        strokeWeight: 2,
      },
    });
    this.marker.setLabel({
      text: String(this.titleIndex),
      color: "white",
      fontSize: "12px",
      fontWeight: "bold",
    });

    // 차량 이벤트 추가
    this.addEventListener();
  }

  // 마커 색 변경
  markerSetColor(color) {
    this.marker.setIcon({
      path: google.maps.SymbolPath.CIRCLE,
      scale: 10,
      fillColor: color, // 레드로 변경
      fillOpacity: 1.0,
      strokeColor: "#FFFFFF",
      strokeOpacity: 1.0,
      strokeWeight: 2,
    });
  }

  findCommonChemicalSet(object1, object2) {
    return object1.filter((item1) =>
      object2.some((item2) => item1.chemicalName === item2.chemicalName)
    );
  }

  async drawCircularSector() {
    if (this.customMap.currentCircularSector) {
      this.customMap.currentCircularSector.setMap(null);
      this.customMap.currentCircularSector = null;
      this.customMap.currentCircular.setMap(null);
      this.customMap.currentCircular = null;
    }

    const { spherical } = await google.maps.importLibrary("geometry");
    const data = await this.calculateCircularSectorParameters();
    setRadioButtons(this);

    const segments = 1000;
    const segmentList = []; // 부채꼴 좌표 배열 초기화

    // 중심점 좌표
    const center = this.getLocation();
    // console.log("getLocation()");
    // console.log(typeof(this.latitude));
    // console.log(this.longitude);
    // console.log(this.getLocation());
    // console.log(new google.maps.LatLng(this.latitude, this.longitude));

    // 전체 원의 좌표 계산
    for (let i = 0; i <= segments; i++) {
      const angleStep = 360 / segments;
      const vertexAngle = i * angleStep;
      const vertex = spherical.computeOffset(center, data.radius, vertexAngle);
      segmentList.push(vertex);
    }

    // 부채꼴의 좌표 계산
    const sectorList = [center];
    for (let j = 0; j <= segments; j++) {
      const angleStep = (data.endAngle - data.startAngle) / segments;
      const vertexAngle = data.startAngle + j * angleStep;
      const vertex = spherical.computeOffset(center, data.radius, vertexAngle);
      sectorList.push(vertex);
    }
    sectorList.push(center); // 부채꼴 닫기
    
    console.log("sectorList");
    console.log(sectorList);

    // 원 속성
    this.customMap.currentCircular = new google.maps.Polygon({
      paths: segmentList,
      strokeColor: "#FF0000", // 투명한 원의 외곽선 색상
      strokeOpacity: 0.5,
      strokeWeight: 1,
      fillColor: "green", // 투명한 원의 배경색상
      fillOpacity: 0.1,
      clickable: false,
      map: this.map,
    });

    // 부채꼴을 그리기 위한 폴리곤
    this.customMap.currentCircularSector = new google.maps.Polygon({
      paths: sectorList,
      strokeColor: "#FF0000", // 부채꼴의 외곽선 색상
      strokeOpacity: 0.8,
      strokeWeight: 1,
      fillColor: "green", // 부채꼴의 채우기 색상
      fillOpacity: 0.35,
      clickable: false,
      map: this.map,
    });
  }

  // 위도(latitude)를 설정하는 메서드
  setLatitude(latitude) {
    this.latitude = latitude;
    // 위도가 변경되면 마커의 위치도 변경해야 함
    if (this.marker) {
      this.marker.setPosition({ lat: this.latitude, lng: this.longitude });
    }
  }

  // 경도(longitude)를 설정하는 메서드
  setLongitude(longitude) {
    this.longitude = longitude;
    // 경도가 변경되면 마커의 위치도 변경해야 함
    if (this.marker) {
      this.marker.setPosition({ lat: this.latitude, lng: this.longitude });
    }
  }

  // 마커를 지도에서 제거하는 메서드
  removeCar() {
    this.map = null;
    this.titleIndex = null;
    this.carIndex = null;
    this.latitude = null;
    this.longitude = null;
    this.detailId = null;
    this.chemicalData = null;
    this.radius = null;
    this.date = null;
    this.direction = null;
    if (this.marker) {
      this.marker.setMap(null);
      this.marker = null;
    }
  }

  // 차량 이벤트 정의
  addEventListener() {
    this.clickListener = this.marker.addListener("click", () => {
      this.checkmarker_event_start();
    });
  }

  // 차량 클릭이벤트
  async checkmarker_event_start() {
    // 좌측 메뉴 초기화
    clearTableText();
    // 이전 클릭 정보 지우기
    this.customMap.clickoffCar();
    this.customMap.clickoffPlace();
    // 마커 색 변환 및 클릭한 차량 객체 등록
    this.markerSetColor("red");
    this.customMap.onclickCar(this);

    //좌측 메뉴 위도, 경도 , 측정 일시 채우기
    fillCoordinateTable(this.latitude, this.longitude, this.date);
    
    // 관측지점의 화학물질 데이터 가져오기
    await this.setCarChemicalData();
    // 관측지점 화학물질 희석배수 및 희석배수 비율 필드 추가 계산
    const carChemicalData = await this.getCarChemicalIntegratedData();
    // 반경을 이용해 원 그리기
    await this.drawCircularSector();
    // 좌측메뉴에 풍향 데이터 넣기
    fillOdorDirection(this.direction);

    // 원 내부에 있는 장소 객체 데이터 리스트 구하기
    const placesInDistance = await this.customMap.placeList.findPlaceInDistance(
      this,
      this.radius
    );

    //좌측 메뉴 반경내 사업장 데이터 채우기
    fillInRadiusTable(placesInDistance);
    
    // 원 내부에 있는 장소 객체중 부채꼴 내부에 있는 장소 객체 선별
    const placesInCircularSector =
      this.customMap.placeList.findPlaceinCircularSector(placesInDistance);


    // 부채꼴 내부에 있는 장소 객체들 중 장소의 악취유형과 관측지점의 악취유형이 일치하는 데이터를 담을 리스트
    let matchingResult = [];

    // 분류모델을 통해 관측지점의 악취 유형을 구하고 이를 부채꼴 내부에 있는 장소 객체의 악취 유형과 비교하여 필터링
    this.odorPrediction().then(async (resolve) => {
      if (placesInCircularSector) {
        for (const place of placesInCircularSector) {
          if (place.odor == resolve[0]?.pred_smell_kind) {
            matchingResult.push(place);
          }
        }
      }

      // 좌측 메뉴 악취 유형 및 세기 채우기
      fillOdorTable(
        resolve[0]?.pred_smell_kind,
        resolve[1]?.pred_smell_strength.toFixed(1)
      );
      console.log("🧪 this.customMap:", this.customMap);
      console.log("🧪 analysisModal:", this.customMap.analysisModal);
      console.log("🧪 typeof open_modal:", typeof this.customMap.analysisModal?.open_modal);

      // 분석 모달 열기
      this.customMap.analysisModal.open_modal();
      // 분석 모달 이름 바꾸기
      this.customMap.analysisModal.switchModalTitle(
        this.titleIndex + "번 지점의 화학 물질 및 악취 분류 정보"
      );
      // 분석 모달 방지시설예측 버튼 세팅
      this.customMap.analysisModal.setPreventionButton();
      // 분석모달에 관측지점 및 화학물질 데이터 + 악취유형 데이터 넣기
      this.customMap.analysisModal.modal_init(carChemicalData, resolve);

      // 매칭된 장소 객체가 있다면 좌측메뉴에 부채꼴내 사업장 부분에 데이터 넣기
      if (matchingResult.length) {
        fillMatchingPlaceTable(matchingResult); // leftmenu html에 있음
      }

      // 악취유형 일치 + 부채꼴 내 사업장의 개별데이터에서 관측지점의 화학물질과 일치하는 화학물질만 선별
      let commonData = [];
      if (matchingResult) {
        for (const place of matchingResult) {
          //console.log(place)

          if (carChemicalData) {
            const commonObject = {
              title: place.getTitle(),
              commonObject: this.findCommonChemicalSet(
                carChemicalData,
                await place.getPlaceChemicalData()
              ),
            };
            commonData.push(commonObject);
          } else {
            const commonObject = {
              title: place.getTitle(),
              commonObject: [],
            };
            commonData.push(commonObject);
          }
        }
      }

      // 내부를 필터링한 장소객체를 용도에 맞게 정렬
      var commonRatioRank = this.sortRatioRank(commonData);
      var commonValueRank = this.sortValueRank(commonData);

      // 악취유형 일치 + 부채꼴 내 사업장이 없다면 모달창 초기화만 진행
      if (matchingResult.length === 0) {
        createToast(
          "warning",
          "부채꼴 내 냄새 분류가 일치하는 사업장이 없습니다."
        );
        this.customMap.compareModal.open_modal();
        this.customMap.compareModal.modal_init(
          this.trimTen(carChemicalData),
          commonValueRank
        );
        const ratioCarData = this.sortRatio(carChemicalData);
        console.log("sortratio", ratioCarData);
        this.customMap.compareModal.modal_init2(
          this.trimTen(ratioCarData),
          commonRatioRank
        );
      } else {
        // 악취유형 일치 + 부채꼴 내 사업장이 있다면 좌측 메뉴 데이터 넣기 + 모달 초기화하기 
        fillPredictResultTable(commonValueRank);
        this.customMap.compareModal.open_modal();
        this.customMap.compareModal.modal_init(
          this.trimTen(carChemicalData),
          commonValueRank
        );
        const ratioCarData = this.sortRatio(carChemicalData);
        console.log("sortratio", ratioCarData);
        this.customMap.compareModal.modal_init2(
          this.trimTen(ratioCarData),
          commonRatioRank
        );
      }
    });
  }

  // 배열 길이 10으로 맞추기
  trimTen(array) {
    if (array.length > 10) {
      return array.slice(0, 10);
    }
    return array;
  }

  // 비율 기반 장소객체 순위구하기
  sortRatioRank(commondata) {
    // 개별 데이터 내부 relativeRatio별로 정렬
    commondata.forEach((item) => {
      item.commonObject.sort(
        (a, b) => parseFloat(b.relativeRatio) - parseFloat(a.relativeRatio)
      );
    });

    // 개별 데이터 합계 비율 구하기 + 객체 추가 필드 만들기
    commondata.forEach((item) => {
      const relativeRatioSum = item.commonObject.reduce(
        (sum, obj) => sum + parseFloat(obj.relativeRatio),
        0
      );
      item.relativeRatioSum = relativeRatioSum;
      item.rank = 0; // Initial rank, will be updated in step 3
    });

    // 각 데이터의 합계 비율 합을 통해 정렬
    commondata.sort((a, b) => b.relativeRatioSum - a.relativeRatioSum);

    // 합계 비율 순위 구하기
    commondata.forEach((item, index) => {
      item.rank = index + 1;
    });

    return commondata;
  }
  // 농도기반 장소객체 순위구하기
  sortValueRank(commondata) {
    // 개별 데이터 내부 농도별로 정렬
    commondata.forEach((item) => {
      item.commonObject.sort(
        (a, b) => parseFloat(b.chemicalValue) - parseFloat(a.chemicalValue)
      );
    });

    // 개별 데이터 농도 합계 구하기 + 객체 추가 필드 만들기
    commondata.forEach((item) => {
      const valueSum = item.commonObject.reduce(
        (sum, obj) => sum + parseFloat(obj.chemicalValue),
        0
      );
      item.valueSum = valueSum;
      item.rank = 0; // Initial rank, will be updated in step 3
    });

    // 각 데이터의 농도 합계를 통해 정렬
    commondata.sort((a, b) => b.valueSum - a.valueSum);

    // 데이터 순위구하기
    commondata.forEach((item, index) => {
      item.rank = index + 1;
    });

    return commondata;
  }

  // 관측지점 화학물질 가져오기 
  async getCarChemicalData() {
    if (!this.chemicalData) {
      try {
        const response = await fetch(
          `/arims/arimsCarCsvContent?detail_id=${this.detailId}`
        );
        const data = await response.json();
        this.chemicalData = data.list;
      } catch (error) {
        //console.error("Error fetching chemical data:", error);
        this.chemicalData = [];
      }
    }
    return this.chemicalData;
  }

  // 관측지점 화학물질 설정하기
  async setCarChemicalData() {
    this.chemicalData = await this.getCarChemicalData();
  }


  // 관측지점 화학물질 데이터 희석배수 및 희석배수 비율 필드 만들기
  async getCarChemicalIntegratedData() {
    let chemicalData = this.chemicalData;
    let valueSum = 0;

    for (let chemical of chemicalData) {
      chemical.minimumValue = chemical.msv;
      chemical.dilutionRate = chemical.chemicalValue / chemical.minimumValue;
      valueSum += chemical.dilutionRate;
    }

    for (let chemical of chemicalData) {
      chemical.relativeRatio = (chemical.dilutionRate / valueSum) * 100;
    }
    return chemicalData.sort((a, b) => b.chemicalValue - a.chemicalValue);
  }

  // 비율기반 정렬
  sortRatio() {
    let chemicalData = this.chemicalData;
    return chemicalData.sort((a, b) => b.relativeRatio - a.relativeRatio);
  }

  // 화학물질을 파라미터로하는 분류모델 사용하기
  odorPrediction() {
    const data = this.chemicalData;

    const preprocessing = data.map(function (element) {
      return {
        material: element.chemicalName,
        strength: element.chemicalValue,
        area: '경주'
      };
    });

    return new Promise((resolve) => {
      $.ajax({
        url: "http://219.249.140.29:11234/arims/predict",
        type: "POST",
        data: JSON.stringify(preprocessing),
        contentType: "application/json",
        async: true,
        success: function (result) {
          // result.data : "{"pred_smell_kind": "악취 종류 이름" , "pred_smell_strength": "수치" }"
          resolve(JSON.parse(result.data));
        },
      });
    });
  }

  // 반경, 각도, 방향을 이용하여 부채꼴 그리는데 필요한 파라미터 추가
  async calculateCircularSectorParameters() {
    const baseRadius = this.radius; // 기본 부채꼴 길이
    const baseAngle = this.angle; // 기본 부채꼴 각도(너비)
    let direction = this.direction;

    let startAngle = direction - baseAngle / 2;
    let endAngle = direction + baseAngle / 2;

    return {
      radius: baseRadius,
      startAngle: startAngle,
      endAngle: endAngle,
      direction: direction,
    };
  }
}
