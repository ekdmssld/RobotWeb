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
  async addPath(carLocation) {
    if (this.carLocations.length === 0) {
      this.carLocations.push(carLocation);
    } else {
      let newLocation = this.replaceLocationObject(carLocation);
      console.log(`carLocation: ${newLocation}`);
      if (
        (await this.distanceFilter(
          // 마지막으로 저장된 차량 gps데이터와 100m 이상 차이가 나면 true
          this.replaceLocationObject(
            this.carLocations[this.carLocations.length - 1]
          )
          ,
          newLocation,
          100
        ))
      )
      {
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
    console.log("path", this.carLocations);

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
    console.log(`${google.maps.geometry.spherical.computeDistanceBetween(point1, point2)}, point1: ${point1}, point2: ${point2}`);
    return (
      google.maps.geometry.spherical.computeDistanceBetween(point1, point2) >=
      distance
    );
  }

  // 차량 검색 select에 데이터 추가
  makeSelectionCar() {
    const select = document.getElementById("selectCarMarker");
    // select 비우기
    select.innerHTML = "";

    // 동적으로 option 만들기
    const defaultOption = document.createElement("option");
    defaultOption.text = "차량을 선택하세요";
    defaultOption.value = "";
    select.appendChild(defaultOption);

    // 차량마커들의 titleIndex로 option에 값을 넣고 추가
    this.cars.forEach((car) => {
      const option = document.createElement("option");
      option.text = car.titleIndex;
      option.value = car.titleIndex;
      select.appendChild(option);
    });
  }
}
