class SourcePlaceList {
  constructor(map, customMap) {
    this.map = map;
    this.customMap = customMap;
    this.places = []; // place 인스턴스를 저장할 배열
    this.placeLocations = [];
    this.placeMarkers = [];
    this.clusterer;
  }

  init() {
    this.places.forEach((place) => place.removePlace());
    this.places = [];
    this.placeLocations = [];
    this.placeMarkers = [];
    if (this.clusterer) this.clusterer.setMap(null);
  }

  async addPlace(companyIndex, name, placeLocation, csvFileName, odor) {
    const place = new SourcePlace(
      this.map,
      this.customMap,
      companyIndex,
      name,
      placeLocation.lat,
      placeLocation.lng,
      csvFileName,
      odor,
    );
    console.log("[addPlace] 전달하는 customMap:", customMap);
    await place.createMarker();
    this.places.push(place);
    this.placeLocations.push(placeLocation);
    this.placeMarkers.push(place.marker);
  }

  makeCluster() {
    //console.log("마커",this.placeMarkers)
    const styles = [
      {
        width: 53,
        height: 53,
        fontFamily: "comic sans ms",
        textSize: 15,
        opacity: 0.7,
      },
    ];

    const clusterOptions = {
      styles: styles,
      gridSize: 50,
      maxZoom: 15,
      minimumClusterSize: 3,
    };

    this.clusterer = new markerClusterer.MarkerClusterer({
      map: this.map,
      markers: this.placeMarkers,
      clusterOptions,
    });
  }





  // 특정 좌표와 거리가 주어졌을때 거리내의 모든 장소 마커 리스트 반환
  async findPlaceInDistance(car, distance) {
    const { geometry } = google.maps.importLibrary("geometry");
    try {
      // 모든 장소에 대해 비동기 distanceFilter 호출
      const filterPromises = this.places.map(async (place) => {
        const result = await this.distanceFilter(
          place.getLocation(),
          new google.maps.LatLng(car.latitude, car.longitude),
          distance
        );
        return { place, result };
      });

      // 모든 distanceFilter 호출 완료 후 결과 필터링
      const filteredResults = await Promise.all(filterPromises);
      const filteredPlaces = filteredResults
        .filter((item) => item.result)
        .map((item) => item.place);

      //console.log("반경 500미터 거리내에 있는 기업들", filteredPlaces);

      // 가장 가까운 3가지 장소 선정
      return await this.distanceRank(filteredPlaces, car);
    } catch (error) {
      console.error("거리 필터링 중 오류 발생:", error);
      return []; // 오류 발생 시 빈 배열 반환
    }
  }

  // 주어진 마커 리스트 중에서 현재 활성화된 부채꼴 내부에 있는 마커 리스트 반환
  findPlaceinCircularSector(placesInDistance) {
    //console.log('반경내 마커 들어온 데이터',placesInDistance)
    const { geometry } = google.maps.importLibrary("geometry");
    return placesInDistance.filter((place) => {
      if (
        google.maps.geometry.poly.containsLocation(
          place.getLocation(),
          this.customMap.currentCircularSector
        )
      ) {
        return place;
      }
    });
  }

  async distanceRank(arr, point1) {
    const { spherical } = await google.maps.importLibrary("geometry");
    // point1을 LatLng 객체로 변환
    const point1LatLng = point1.getLocation();

    // 각 지점과 point1 간의 거리를 계산하여 새로운 배열 생성
    const distances = arr.map((point) => {
      const pointLatLng = point.getLocation();
      const distance = spherical.computeDistanceBetween(
        point1LatLng,
        pointLatLng
      );
      return { point, distance };
    });

    // 거리 기준으로 정렬하여 상위 3개 지점 선택
    distances.sort((a, b) => a.distance - b.distance);

    // 상위 3개 지점의 point 정보만 반환
    //const closestPoints = distances.slice(0, 3).map((item) => item.point);
    // 정렬만
    const closestPoints = distances.map((item) => item.point);
    return closestPoints;
  }

  // 모든 place 인스턴스의 latitude와 longitude 쌍을 리스트로 반환하는 메서드
  getLocationsList() {
    return this.placeLocations;
  }

  // 모든 place 인스턴스의 marker 필드들을 리스트로 반환하는 메서드
  getMarkersList() {
    return this.placeMarkers;
  }

  async distanceFilter(point1, point2, distance) {
    const { spherical } = await google.maps.importLibrary("geometry");

    // 거리가 반지름 이내인지 확인하여 결과 반환
    return (
      google.maps.geometry.spherical.computeDistanceBetween(point1, point2) <=
      distance
    );
  }
}
