var mouseover = null;
window.mouseover = null;
class WebRobot {
    constructor() {
    }

    async init() {
        this.analysisModal = new AnalysisModal("analysisModal");
        this.compareModal = new CompareModal("robotCompareModal");
        this.customMap = new CustomMap(this.analysisModal, this.compareModal);
        this.sourcePlaceList = new SourcePlaceList(this.customMap.map, this.customMap);
        this.carList = new CarList(this.customMap.map, this.customMap);

        this.customMap.setPlaceList(this.sourcePlaceList);
        this.customMap.setCarList(this.carList);

        const mode = $("#selectQueue option:selected").val();
        await this.customMap.init(35.456966, 129.32799);

        if (mode === "전체") {
            await this.setData();
        } else if (mode === "순차적") {
            await this.setSequentialData();
        } else if (mode === "실시간") {
            await this.makeDate();
            await this.setPlaceData();
            this.fetchRealtimeCar();
            this.fetchRealtimeCarLocation();
            realtime_interval = setInterval(this.fetchRealtimeCar, 1000);
            realtime_interval2 = setInterval(this.fetchRealtimeCarLocation, 1000);
            realtime_interval_time = setInterval(this.setIntervalTime, 1000);
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



    // 전체 리스트 데이터 세팅하기
    async setData() {
        var selectCar =
            $("#carCodeSelect option:selected").val() ||
            $("#carCodeSelect option:first").val();
        //차량검색 select 세팅하기
        await this.makeDate();
        // 선택된 운행 내역 가져오기
        var selectDate = $("#availableDates option:selected").val();

        if (selectCar === "R1" || selectCar === "R2") {
            // 로봇 로직 분기
            const robotPathList = await this.getRobotPath(selectCar, selectDate);
            console.log("📦 로봇 경로 데이터:", robotPathList);
            if (robotPathList.length > 0) {
                robotPathList.forEach(data => {
                    this.carList.addCar(
                        data.carCode,
                        { lat: data.latitude, lng: data.longitude },
                        data.date,
                        data.detailId,
                        null, // CSV 파일명 없음
                        null  // windDirection 없음
                    );
                    this.carList.addPath({ lat: data.latitude, lng: data.longitude }, true);
                });
                this.carList.makeSelectionCar();
                this.carList.drawPath();
            } else {
                console.warn("로봇 경로 없음");
            }
            return;
        }

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
        await Promise.all(
            carDataList
                .filter(data => data.latitude !== 0 && data.longitude !== 0)
                .map(data => this.carList.addCar(
                    data.carId,
                    { lat: data.latitude, lng: data.longitude },
                    data.date,
                    data.detailId,
                    data.csvFilename,
                    data.windDirection
                ))
        );
        setTimeout(() => {
            this.carList.makeSelectionCar();
        }, 300);

        this.carList.drawPath();
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
            $("#carCodeSelect option:selected").val() ||
            $("#carCodeSelect option:first").val();
        //차량검색 select 세팅하기
        await this.makeDate();
        // 선택된 운영내역 가져오기
        var selectDate = $("#availableDates option:selected").val();

        // console.log(selectDate, selectCar);

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
    async getRobotPath(carCode, date) {
      const startTime = `${date} 00:00:00`;
      const endTime = `${date} 23:59:59`;
      const url = `/arims/robot/path?startTime=${startTime}&endTime=${endTime}&carCode=${carCode}`;

      try {
        const response = await fetch(url);
        if (!response.ok) throw new Error("Network error");
        const data = await response.json();
        return data;
      } catch (err) {
        console.error("로봇 경로 fetch 오류:", err);
        return [];
      }
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
            $("#carCodeSelect option:selected").val() ||
            $("#carCodeSelect option:first").val();
        // select에 선택된 운행 내역 가져오기
        var selectDate = $("#availableDates option:selected").val();
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

    //차량 조회기능
    searchCar() {

        //차량 검색 select 값 가져오기
        const selectedCarIndex = document.getElementById("selectCarMarker").value;
        //차량리스트에서 select 값과 같은 마커 가져오기
        const selectedCar = this.carList.cars.find(
            (car) => car.carIndex === selectedCarIndex
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

    // 📥 장소 전체 로딩
    async loadAllPlaces() {
        try {
            const res = await fetch("/arims/place");
            const data = await res.json();

            const places = data.list;
            for (const place of places) {
                await this.sourcePlaceList.addPlace(
                    place.companyIndex,
                    place.name,
                    { lat: place.latitude, lng: place.longitude },
                    place.csvFilename,
                    place.odor
                );
            }
            this.sourcePlaceList.makeCluster();
        } catch (err) {
            console.error("❌ 장소 불러오기 실패:", err);
        }
    }

    // 🧷 이벤트 연결
    // 일괄적으로 이벤트 추가하기
    addEventListeners() {

        // 연관검색어 표시 이벤트
        $("#selectPlaceMarker").on("input", this.searchInputEvent);

        // // 운행 내역, 모드 선택 인터페이스 검색
        // document.getElementById("searchGPS").addEventListener("click", () => {
        //     this.search();
        // });

        // 차량 유형 선택 시 날짜 목록과 데이터 재로드
        document.getElementById("carCodeSelect").addEventListener("change", async () => {
            await this.makeDate();       // 날짜 select 갱신
            // await this.setData();        // 차량 마커, 장소 등 새로 그림
        });

        // 차량 검색
        document
            .getElementById("searchCar")
            .addEventListener("click", () => {
                this.searchCar();
            });

        // 장소 검색
        document.getElementById("searchPlace").addEventListener(
            "click",
            this.searchPlace.bind(this)
        );

        // 분석결과 on/off 이벤트
        document
            .getElementById("marker_hidden_slide")
            .addEventListener("change", function () {
                if (this.checked) {
                    webRobot.analysisModal.modal.style.display = "block";
                    webRobot.compareModal.modal.style.display = "block";
                } else {
                    webRobot.analysisModal.modal.style.display = "none";
                    webRobot.compareModal.modal.style.display = "none";
                }
            });

        // 좌측메뉴 클릭이벤트
        this.addClickSearchEvent();


        // 연관검색어 입력창 포커스 꺼질때 이벤트
        $("#selectPlaceMarker").blur(() => {
            if (mouseover) {
                $("#selectPlaceMarker").val(mouseover.text());
            }
            $("#selectPlaceMarker").on("input", this.searchInputEvent.bind(this));
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
        const select = document.getElementById("availableDates");

        if ((select.getElementsByTagName("option").length == 0) || event) {
            // 내부 초기화
            select.innerHTML = "";

            // 차량 유형 가져오기
            const selectCar = $("#carCodeSelect option:selected").val();
            // 날짜 데이터 가져오기
            const date = await this.getDate(selectCar);

            // 각 날짜를 select에 추가
            date.forEach((date, index) => {
                const option = document.createElement("option");
                option.text = date;
                option.value = date;

                // 첫번째 옵션이 기본적으로 선택되도록 설정
                if (index === 0) {
                    option.selected = true;
                }
                select.appendChild(option);
            });
        }
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

    async searchInputEvent() {
        const search = $("#selectPlaceMarker").val();
        if (search.length > 0) {
            const placenames = await webRobot.searchPlaceName(search);
            if (placenames.length == 0) {
                $("#relatedKeywords").hide();
            } else {
                webRobot.displayRelatedKeywords(placenames);
            }
        }
    }

    displayRelatedKeywords(keywords) {
        $("#relatedKeywords").show();
        const relatedKeywordsDiv = $("#relatedKeywords");
        relatedKeywordsDiv.empty();

        if (keywords.length > 0) {
            const ul = $("<ul>");
            keywords.forEach(keyword => {
                const li = $("<li>").text(keyword);
                li.click(function () {
                    $("#selectPlaceMarker").off("input");
                    $("#selectPlaceMarker").val(keyword);
                    $("#selectPlaceMarker").on("input", webRobot.searchInputEvent.bind(webRobot));
                    $("#selectPlaceMarker").blur();
                    $("#relatedKeywords").hide();
                });
                li.on("mouseover", function () {
                    mouseover = li;
                });
                li.on("mouseout", function () {
                    mouseover = null;
                });
                ul.append(li);
            });
            relatedKeywordsDiv.html(ul);
        } else {
            relatedKeywordsDiv.text("검색 결과가 없습니다.");
        }
    }
    // 🗓️ 날짜 목록 렌더링
    async populateAvailableDates() {
        const carCode = document.getElementById("carCodeSelect").value;
        const dateSelect = document.getElementById("availableDates");
        dateSelect.innerHTML = `<option value="" disabled selected>날짜 선택</option>`;

        if (!carCode) return;

        const allDates = this.generateDateRange(new Date("2024-01-01"), new Date());
        allDates.reverse();

        allDates.forEach(date => {
            const opt = document.createElement("option");
            opt.value = date;
            opt.textContent = date;
            dateSelect.appendChild(opt);
        });
    }

    generateDateRange(startDate, endDate) {
        const dates = [];
        let current = new Date(startDate);
        while (current <= endDate) {
            const y = current.getFullYear();
            const m = String(current.getMonth() + 1).padStart(2, "0");
            const d = String(current.getDate()).padStart(2, "0");
            dates.push(`${y}-${m}-${d}`);
            current.setDate(current.getDate() + 1);
        }
        return dates;
    }
    async searchPlaceName(name) {
        const url = `/arims/searchPlaceName?name=${name}`;
        try {
            const response = await fetch(url);
            if (!response.ok) throw new Error("Network error");
            const data = await response.json();
            return data;
        } catch (error) {
            console.error("searchPlaceName 오류:", error);
            return [];
        }
    }
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

}

window.webRobot = new WebRobot();

document.addEventListener("DOMContentLoaded", async () => {
    await waitForGoogleMaps();
    await window.webRobot.init();
    webRobot.addEventListeners();
});

// 외부 라이브러리 로딩 대기
function waitForGoogleMaps() {
    return new Promise(resolve => {
        const check = () => {
            if (window.google && window.google.maps) resolve();
            else setTimeout(check, 100);
        };
        check();
    });
}