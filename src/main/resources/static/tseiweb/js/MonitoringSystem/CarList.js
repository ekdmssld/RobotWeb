class CarList {
  constructor(map, customMap) {
    this.map = map;
    this.customMap = customMap;
    this.cars = []; // Car 인스턴스를 저장할 배열
    this.carLocations = [];
    this.carTitleIndex = 1;
    this.carMarkers = [];
    this.path = [];
    this.realtimeMarker;
  }

  // 차량데이터 초기화
  init() {
    this.cars.forEach((car) => car.removeCar());
    this.cars = [];
    this.carLocations = [];
    this.carTitleIndex = 1;
    this.carMarkers = [];
    if (this.path.length == 0) {
      this.path.forEach((path) => path.setMap(null));
    }
    this.path = [];
  }

  //차량 GPS 데이터 추가
  async addPath(carLocation, force = false) {
    if (force || this.carLocations.length === 0) {
      this.carLocations.push(carLocation);
    } else {
      let newLocation = this.replaceLocationObject(carLocation);
      if (await this.distanceFilter(
          this.replaceLocationObject(this.carLocations[this.carLocations.length - 1]),
          newLocation,
          100
      )) {
        this.carLocations.push(carLocation);
      }
    }
  }


  // 실시간 경로데이터 추가 (필터링 없음)
  async addRealtimePath(carLocation) {
    if (this.carLocations.length === 0) {
      this.carLocations.push(carLocation);
    } else {
      this.carLocations.push(carLocation);
    }
  }

  //{lat : "" , lng : ""} 형태의 객체를 구글 위치 객체로 변경
  replaceLocationObject(location) {
    return new google.maps.LatLng(location.lat, location.lng);
  }

  // Car 인스턴스를 추가하는 메서드
  addCar(carIndex, carLocation, date, detailId, csvFileName, windDirection) {
    const car = new Car(
      this.map,
      this.customMap,
      this.carTitleIndex,
      carIndex,
      carLocation.lat,
      carLocation.lng,
      date,
      detailId,
      csvFileName,
      windDirection
    );
    this.cars.push(car);
    this.carMarkers.push(car.marker);
    this.carTitleIndex += 1;
  }

  // 실시간 차량 추가 메서드(기본 추가 메소드에서 가장 최근에 등록된 마커 색 빨강으로 변경하는 로직 추가)
  addRealtimeCar(carIndex, carLocation, date, detailId, csvFileName, windDirection) {
    const car = new Car(
      this.map,
      this.customMap,
      this.carTitleIndex,
      carIndex,
      carLocation.lat,
      carLocation.lng,
      date,
      detailId,
      csvFileName,
      windDirection
    );
    this.customMap.clickoffCar();
    this.customMap.clickoffPlace();
    car.markerSetColor("red");
    this.customMap.onclickCar(car);

    this.cars.push(car);
    this.carMarkers.push(car.marker);
    this.carTitleIndex += 1;
  }

  // GPS 경로 그리기
  drawPath() {

    // 초기에는 모든 위치 값을 path에 추가합니다.
    var path = new google.maps.Polyline({
      path: this.carLocations,
      geodesic: true,
      strokeColor: "#FF0000",
      strokeOpacity: 1.0,
      strokeWeight: 2,
    });
    path.setMap(this.map);
    this.path.push(path);
    this.carLocations = [];
  }
  findCarById(id) {
    return this.cars.find(car => car.carIndex === id);
  }


  // 모든 marker 리스트 반환하
  getMarkersList() {
    return this.carMarkers;
  }

  //거리기반 필터 : point1, point2 거리가 distance 보다 멀 경우 true
  async distanceFilter(point1, point2, distance) {
    const { spherical } = await google.maps.importLibrary("geometry");
    return (
      google.maps.geometry.spherical.computeDistanceBetween(point1, point2) >=
      distance
    );
  }

  // 차량 검색 select에 데이터 추가
  makeSelectionCar() {
    const select = document.getElementById("selectCarMarker");
    if (!select) {
      console.error("❌ selectCarMarker 요소가 없음!");
      return;
    }
    // 기본 옵션 추가
    select.innerHTML = `<option value="">차량을 선택하세요</option>`;

    this.cars.forEach((car, index) => {
      const option = document.createElement("option");
      option.value = car.carIndex; // 또는 car.carCode
      option.textContent = `${car.titleIndex}`;
      select.appendChild(option);
    });
  }
}
