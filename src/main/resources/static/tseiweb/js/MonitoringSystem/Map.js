class CustomMap {
  constructor(analysisModal, compareModal) {
    this.analysisModal = analysisModal;
    this.compareModal = compareModal;
    this.placeList = null;
    this.carList = null;
    this.currentCircularSector = null;
    this.onCar = null;
    this.onPlace = null;
    this.map = null;
    this.now_lat = null;
    this.now_lon = null;
    this.address = null;
  }

  setPlaceList(placeList) {
    this.placeList = placeList;
  }

  setCarList(carList) {
    this.carList = carList;
  }

  onclickCar(car) {
    this.onCar = car;
  }

  onclickPlace(place) {
    this.onPlace = place;
  }

  clickoffCar() {
    if (this.onCar) this.onCar.markerSetColor("blue");
    this.onCar = null;
  }

  clickoffPlace() {
    if (this.onPlace) this.onPlace.markerSetColor("blue");
    this.onPlace = null;
  }

  async init(lat, lng) {
    if (this.placeList) this.placeList.init();
    if (this.carList) this.carList.init();

    const { Map } = await google.maps.importLibrary("maps");

    const position = new google.maps.LatLng({ lat: lat, lng: lng });
    const zoom = 15;
    const options = {
      center: position,
      zoom: zoom,
      mapId: "50a49411f97c72d2",
      disableDefaultUI: true,
      disableDoubleClickZoom: true,
      draggable: true,
      keyboardShortcuts: false,
      gestureHandling: "greedy",
      zoomControl: true,
      mapTypeControl: false,
      scaleControl: false,
      streetViewControl: false,
      rotateControl: true,
      mapTypeId: google.maps.MapTypeId.SATELLITE,
    };

    this.map = new Map(document.getElementById("map"), options);

    google.maps.event.addListener(this.map, "click", () => {
      this.analysisModal?.close_modal?.();
      this.compareModal?.close_modal?.();
      $("#relatedKeywords").hide();
      this.clickoffCar();
      this.clickoffPlace();

      if (this.currentCircularSector) {
        this.currentCircularSector.setMap(null);
        this.currentCircularSector = null;
        this.currentCircular?.setMap(null);
        this.currentCircular = null;
      }
    });

    this.map.addListener("idle", () => this.handleMapIdle());
  }

  async handleMapIdle() {
    const center = this.map.getCenter();
    this.now_lat = center.lat();
    this.now_lon = center.lng();
    const geocoder = new google.maps.Geocoder();

    geocoder.geocode({ location: center }, (results, status) => {
      if (status === "OK" && results[0]) {
        this.address = results[0].formatted_address.replace("대한민국 ", "");
        $("#nowPosition").replaceWith(`<h1 id="nowPosition">${this.address}</h1>`);
      }
    });
  }

  getMap() {
    return this.map;
  }
}

window.CustomMap = CustomMap;

// ===================== 로봇 지도 관련 =====================
let robotMarkers = [];

window.robotMapInit = async function (lat = 35.1796, lng = 129.0756) {
  // maps와 marker 라이브러리 모두 import
  const { Map } = await google.maps.importLibrary("maps");
  const { Marker } = await google.maps.importLibrary("marker");
  const { Polyline } = await google.maps.importLibrary("maps");

  const position = new google.maps.LatLng({ lat, lng });
  const zoom = 14;
  const options = {
    center: position,
    zoom: zoom,
    mapId: "robot_map_id_1234",
    draggable: true,
    zoomControl: true,
    disableDefaultUI: true,
    gestureHandling: "greedy",
    mapTypeId: google.maps.MapTypeId.SATELLITE,
  };

  window.robotMap = new Map(document.getElementById("map"), options);
  
  // Polyline과 Marker를 전역 객체에 추가
  window.google.maps.Marker = Marker;
  window.google.maps.Polyline = Polyline;
};

window.drawRobotMarkers = function (dataList) {
  window.clearRobotMarkers();
  const path = [];

  dataList.forEach((item, index) => {
    const markerLabel = `${index + 1}`;
    const position = { lat: item.latitude, lng: item.longitude };

    const marker = new google.maps.Marker({
      position,
      map: window.robotMap,
      label: {
        text: markerLabel,
        color: "#fff",
        fontSize: "12px",
        fontWeight: "bold"
      },
      icon: {
        path: google.maps.SymbolPath.CIRCLE,
        fillColor: "red",
        fillOpacity: 0.9,
        strokeWeight: 1,
        strokeColor: "white",
        scale: 10
      },
      title: `측정시각: ${item.date}`,
    });

    // 좌측 패널에 데이터 표시
    marker.addListener("click", () => {
      if (typeof fillCoordinateTable === "function") {
        fillCoordinateTable(item.latitude, item.longitude, item.date);
      }
      if (typeof fillOdorDirection === "function") {
        fillOdorDirection(item.windDirection ?? "-");
      }
      // 필요한 경우 chemical 모달도 호출
      if (typeof openChemicalModal === "function") {
        openChemicalModal(item.detailId);
      }
    });

    robotMarkers.push(marker);
    path.push(position);
  });

  if (window.robotPolyline) {
    window.robotPolyline.setMap(null);
  }

  window.robotPolyline = new google.maps.Polyline({
    path: path,
    geodesic: true,
    strokeColor: "red",
    strokeOpacity: 0.8,
    strokeWeight: 3
  });
  window.robotPolyline.setMap(window.robotMap);
};


window.clearRobotMarkers = function () {
  robotMarkers.forEach(marker => marker.setMap(null));
  robotMarkers = [];

  // 경로선도 지우기
  if (window.robotPolyline) {
    window.robotPolyline.setMap(null);
    window.robotPolyline = null;
  }
};