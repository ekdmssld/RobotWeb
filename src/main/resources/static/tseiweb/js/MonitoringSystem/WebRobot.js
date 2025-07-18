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

        this.addEventListeners();

        await this.customMap.init(35.1796, 129.0756);
        await this.loadAllPlaces();
        this.carList.makeSelectionCar();
    }
    // 📍 장소 검색
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
            console.log("✅ 검색된 장소:", selectedPlace.getTitle());
            const pos = selectedPlace.getLocation();
            const center = new google.maps.LatLng(pos.lat(), pos.lng());

            console.log("📌 좌표:", pos.lat(), pos.lng());
            console.log("🗺️ map 객체 확인:", this.customMap.map);

            // 클러스터 잠시 해제해도 좋음: this.sourcePlaceList.clearCluster();

            setTimeout(() => {
                this.customMap.clickoffPlace();
                this.customMap.map.setZoom(10); // 초기 줌 변경
                this.customMap.map.setCenter(center);
                this.customMap.map.panTo(center);
                this.customMap.map.setZoom(25); // 다시 확대
                selectedPlace.checkmarker_event_start();
            }, 300);
        } else {
            console.warn("❌ 해당하는 장소를 찾을 수 없습니다.");
        }
    }

    // 📌 차량 조회
    async searchCar() {
        const carCode = document.getElementById("carCodeSelect").value;
        const date = document.getElementById("availableDates").value;

        if (!carCode || !date) {
            alert("로봇과 날짜를 선택해주세요");
            return;
        }

        const startTime = `${date} 00:00:00`;
        const endTime = `${date} 23:59:59`;

        try {
            const res = await fetch(`/arims/robot/path?startTime=${startTime}&endTime=${endTime}&carCode=${carCode}`);
            const pathData = await res.json();

            if (!pathData || pathData.length === 0) {
                alert("해당 날짜의 운행 내역이 없습니다.");
                return;
            }

            window.drawRobotMarkers(pathData); // 기존 robot.js 내장 함수 사용
            pathData.forEach(item => {
                this.carList.addCar(
                    item.carCode,
                    { lat: item.latitude, lng: item.longitude },
                    item.date,
                    item.detailId,
                    null,
                    item.windDirection ?? null
                );
            });
            this.carList.makeSelectionCar();

            this.customMap.map.setCenter(new google.maps.LatLng(pathData[0].latitude, pathData[0].longitude));
            this.customMap.map.setZoom(17);
        } catch (err) {
            console.error("🚨 차량 데이터 조회 실패:", err);
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

        // 차량선택시 운행날짜목록 갱신
        document.getElementById('carCodeSelect').addEventListener(
            'change',
            this.makeDate.bind(this)
        );


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
    // 운행내역 select 날짜넣기
    async makeDate(event) {
        const select = document.getElementById("availableDates");

        if ((select.getElementsByTagName("option").length == 0) || event) {
            // 내부 초기화
            select.innerHTML = "";

            // 차량 유형 가져오기
            const carCodeSelect = $("#carCodeSelect option:selected").val();
            // 날짜 데이터 가져오기
            const date = await this.getDate(carCodeSelect);

            // 각 날짜를 select에 추가
            date.forEach((date, index) => {
                const option = document.createElement("option");
                option.text = date;
                option.value = date;

                // // 특정 차량의 특정 날짜 강조
                // if(selectCar === 'S2' && date === '2024-01-26') {
                //     option.style.backgroundColor = "#fdd835";
                // }

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

}

window.webRobot = new WebRobot();

document.addEventListener("DOMContentLoaded", async () => {
    await waitForGoogleMaps();
    await window.webRobot.init();
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
