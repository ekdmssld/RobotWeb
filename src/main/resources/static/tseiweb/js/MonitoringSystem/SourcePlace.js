class SourcePlace {
  constructor(
    map,
    customMap,
    companyIndex,
    title,
    latitude,
    longitude,
    csvFileName,
    odor
  ) {
    this.map = map;
    this.customMap = customMap;
    this.companyIndex = companyIndex;
    this.title = title;
    this.latitude = latitude;
    this.longitude = longitude;
    this.csvFileName = csvFileName;
    this.chemicalData;
    this.marker = null;
    this.odor = odor;
  }

  // 마커 제거하기
  removePlace() {
    this.map = null;
    this.companyIndex = null;
    this.title = null;
    this.latitude = null;
    this.csvFileName = null;
    this.longitude = null;
    if (this.marker) {
      this.marker.setMap(null);
      this.marker = null;
    }
  }

  // 마커 스타일 정의
  buildContent() {
    const content = document.createElement("div");
    content.classList.add("office-tag");
    content.style.backgroundColor = "blue";
    content.style.zIndex = "0";
    content.innerHTML = `
				<div class="icon">
					<i aria-hidden="true" class="bi bi-star-fill"></i>
					<span>&nbsp;${this.title}</span>
				</div>
				`;
    return content;
  }

  // 사업장의 화학물질 데이터 가져오기 
  async getPlaceChemicalData() {
    if (!this.chemicalData) {
      try {
        const response = await fetch(
          `/arims/arimsPlaceCsvContent?company_id=${this.companyIndex}`
        );
        const data = await response.json();
        this.chemicalData = data.list;
        //console.log("화학물질들",this.chemicalData)
        //console.log("csv이름",this.csvFileName)
      } catch (error) {
        //console.error("Error fetching chemical data:", error);
        this.chemicalData = [];
      }
    }
    return this.chemicalData;
  }

  // 사업장 이름 반환
  getTitle() {
    return this.title;
  }

  // 사업장 위치정보 구글 위치 객체로 반환
  getLocation() {
    return new google.maps.LatLng(this.latitude, this.longitude);
  }

  // 사업장 id 반환
  getCompanyIndex() {
    return this.companyIndex;
  }

  // 마커 생성
  async createMarker() {
    const { AdvancedMarkerElement } = await google.maps.importLibrary("marker");
    const position = this.getLocation();
    this.marker = new AdvancedMarkerElement({
      content: this.buildContent(),
      position,
      map: this.map,
    });
    this.addEventListener();
  }

  // 마커 색 변경(빨강 혹은 파랑)
  markerSetColor(color) {
    if (color == "red") {
      this.marker.content.style.backgroundColor = "red";
      this.marker.content.style.zIndex = "1";
    } else if (color == "blue") {
      this.marker.content.style.backgroundColor = "blue";
      this.marker.content.style.zIndex = "0";
    }
  }

  // 위도(latitude) 변경
  setLatitude(latitude) {
    this.latitude = latitude;
    // 위도가 변경되면 마커의 위치도 변경해야 함
    if (this.marker) {
      this.marker.setPosition({ lat: this.latitude, lng: this.longitude });
    }
  }

  // 경도 변경
  setLongitude(longitude) {
    this.longitude = longitude;
    // 경도가 변경되면 마커의 위치도 변경해야 함
    if (this.marker) {
      this.marker.setPosition({ lat: this.latitude, lng: this.longitude });
    }
  }

  // 마커를 지도에서 제거하는 메서드
  removeMarker() {
    if (this.marker) {
      this.marker.setMap(null);
    }
  }

  // 이벤트 일괄 추가
  addEventListener() {
    // 장소마커 클릭이벤트
    this.marker.addListener("click", () => {
      this.checkmarker_event_start();
    });
  }

  // 장소 클릭 이벤트
  async checkmarker_event_start() {
    // 기존 클릭상태 초기화
    this.customMap.clickoffPlace();
    // 클릭된 마커 customMap에 전달
    this.customMap.onclickPlace(this);
    // 마커 색 바꾸기
    this.markerSetColor("red");
    // 장소별 화학 물질 세팅하기
    await this.setPlaceChemicalData();
    // 장소별 화학물질데이터 희석배수 및 희석배수 비율 추가
    const placeChemicalData = await this.getPlaceChemicalIntegratedData();
    // 분석 모달 열기
    this.customMap.analysisModal.open_modal();
    // 분석모달 타이틀 설정
    this.customMap.analysisModal.switchModalTitle(
      this.getTitle() + "의 화학 물질 및 악취 분류 정보"
    );
    // 분석 모달 방지시설예측 버튼 세팅
    this.customMap.analysisModal.setPreventionButton(this.getCompanyIndex());
    // 분석 모달 화학물질 데이터 및 악취 유형 설정
    this.customMap.analysisModal.modal_init(placeChemicalData, [
      { pred_smell_kind: this.odor },
    ]);
  }

  // 차량별 화학 물질 세팅
  async setPlaceChemicalData() {
    this.chemicalData = await this.getPlaceChemicalData();
  }


  // 장소별 화학물질데이터 희석배수 및 희석배수 비율 추가
  async getPlaceChemicalIntegratedData() {
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


}
