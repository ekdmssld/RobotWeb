const fixedDates = {
    R1: "2024-08-13",
    R2: "2025-04-17"
};
// window.analysisModal = new AnalysisModal("robotAnalysisModal");
window.compareModal = new CompareModal("robotCompareModal");
window.customMap = new CustomMap(window.analysisModal, window.compareModal);

// 좌측 메뉴 클릭 이벤트 전체
function addClickSearchEvent() {
    const clickSearchPlaceEvent = (event) => {
        const selectedPlaceTitle = event.target.innerHTML;
        const selectedPlace = window.sourcePlaceList.places.find(
            (place) => place.getTitle() == selectedPlaceTitle
        );
        if (selectedPlace) {
            window.robotMap.setCenter(selectedPlace.getLocation());
            window.robotMap.setZoom(25);
            selectedPlace.checkmarker_event_start();
        }
    };

    document.querySelectorAll(".inRadius, .matching, .result_place").forEach(el =>
        el.addEventListener("click", clickSearchPlaceEvent)
    );
}
document.addEventListener("DOMContentLoaded", async () => {
    const analysisModal = new AnalysisModal("analysisModal");
    const compareModal = new CompareModal("robotCompareModal");
    window.customMap = new CustomMap(analysisModal, compareModal);
    await window.customMap.init(35.456966, 129.32799);  // 지도 생성

    window.robotMap = window.customMap.map;

    // 차량 선택 변경 시 날짜 목록 로드
    document.getElementById("carCodeSelect").addEventListener("change", handleCarCodeChange);

    // ✅ 🔽 검색 버튼 이벤트 추가
    document.getElementById("searchRobot").addEventListener("click", async () => {
        const carCode = document.getElementById("carCodeSelect").value;
        const date = document.getElementById("availableDates").value;

        if (!carCode || !date) {
            alert("차량과 날짜를 모두 선택해주세요.");
            return;
        }

        document.getElementById("loading-anim").style.display = "block";  // 로딩 애니메이션 시작
        await fetchRobotPath(date, carCode);  // 경로 조회 실행
    });

    // 지도 및 커스텀맵 연결
    window.sourcePlaceList = new SourcePlaceList(window.customMap.map, window.customMap);  // ✅ customMap 전달
    await fetchAndAddPlaces();
    window.customMap.placeList = window.sourcePlaceList;
});



//22가지 화학물질 데이터 불러오기
async function fetchChemicalData(detailId){
    try{
        const response = await fetch(`/arims/arimsCarCsvContent?detail_id=${detailId}`);
        if(!response.ok){
            throw new Error("네트워크 응답 실패");
        }
        const data = await response.json();
        return data.list || [];
    }catch(error){
        console.error("화학물질 데이터 불러오기 실패 : ", error);
        return [];
    }
}
/**
 * 화학물질 데이터에 희석배수와 비율을 추가하여 정렬된 배열로 반환
 * @param {Array} chemicalData
 * @returns {Array} 희석배수 및 비율 계산된 배열
 */
function integrateChemicalData(chemicalData) {
    let valueSum = 0;

    // dilutionRate 계산
    chemicalData.forEach((chemical) => {
        chemical.minimumValue = chemical.msv;
        chemical.dilutionRate = chemical.chemicalValue / chemical.minimumValue;
        valueSum += chemical.dilutionRate;
    });

    // relativeRatio 계산
    chemicalData.forEach((chemical) => {
        chemical.relativeRatio = (chemical.dilutionRate / valueSum) * 100;
    });

    // 농도 기준 정렬 (내림차순)
    return chemicalData.sort((a, b) => b.chemicalValue - a.chemicalValue);
}
/**
 * 화학물질 데이터를 기반으로 악취 종류 및 세기를 예측하는 함수
 * @param {Array} chemicalData - chemicalName, chemicalValue 포함된 객체 배열
 * @returns {Promise<Array>} [{pred_smell_kind}, {pred_smell_strength}]
 */
async function odorPrediction(chemicalData) {
    const preprocessing = chemicalData.map((element) => ({
        material: element.chemicalName,
        strength: element.chemicalValue,
        area: '경주'
    }));

    try {
        const response = await fetch("http://219.249.140.29:11234/arims/predict", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(preprocessing)
        });

        const result = await response.json();
        const parsed = JSON.parse(result.data);
        return parsed;
    } catch (err) {
        console.error("odorPrediction() 오류:", err);
        return [
            { pred_smell_kind: "무취" },
            { pred_smell_strength: 2.4 }
        ];
    }
}



//구글 맵 로딩 대기
function waitForGoogleMaps() {
    return new Promise(resolve => {
        const check = () => {
            if (window.google && window.google.maps) resolve();
            else setTimeout(check, 100);
        };
        check();
    });
}

//로봇 날짜 목록 불러오기
async function handleCarCodeChange() {
    const carCode = document.getElementById("carCodeSelect").value;
    const dateSelect = document.getElementById("availableDates");
    dateSelect.innerHTML = `<option value="" disabled selected>날짜 선택</option>`;

    if (!carCode) return;

    const allDates = generateDateRange(
        new Date("2024-01-01"),
        new Date("2025-12-31")
    );

    renderDateOptions(allDates, carCode);  // 기존 방식 그대로 사용
}


// 날짜 select 렌더링
function renderDateOptions(dates, carCode) {
    const dateSelect = document.getElementById("availableDates");
    if (!dateSelect) return;
    dates.reverse();

    // 기본 옵션 추가
    const defaultOption = document.createElement("option");
    defaultOption.value = "";
    defaultOption.textContent = "날짜 선택";
    defaultOption.disabled = true;
    defaultOption.selected = true;
    dateSelect.appendChild(defaultOption);

    dates.forEach(date => {
        const opt = document.createElement("option");
        opt.value = date;
        opt.textContent = date;

        // 강조만 하고 선택은 하지 않음
        if (date === fixedDates[carCode]) {
            opt.style.backgroundColor = "gold";
            opt.style.fontWeight = "bold";
        }

        dateSelect.appendChild(opt);
    });
}


function generateDateRange(startDate, endDate) {
    const dates = [];
    let current = new Date(startDate);
    const today = new Date();

    while (current <= endDate && current <= today) {
        const year = current.getFullYear();
        const month = String(current.getMonth() + 1).padStart(2, "0");
        const day = String(current.getDate()).padStart(2, "0");
        dates.push(`${year}-${month}-${day}`);
        current.setDate(current.getDate() + 1);
    }

    return dates;
}


// 경로 조회
async function fetchRobotPath(date, carCode) {
    const startTime = `${date} 00:00:00`;
    const endTime = `${date} 23:59:59`;

    try {
        const res = await fetch(`/arims/robot/path?startTime=${startTime}&endTime=${endTime}&carCode=${carCode}`);
        const data = await res.json();

        if (data && data.length > 0) {
            drawRobotMarkers(data);

            const center = new google.maps.LatLng(data[0].latitude, data[0].longitude);
            window.robotMap.setCenter(center);
            window.robotMap.setZoom(17);  // 필요시 확대 설정
        } else {
            console.warn("❗ 해당 날짜의 로봇 경로 없음");
        }
    } catch (err) {
        console.error("API 오류:", err);
    } finally {
        document.getElementById("loading-anim").style.display = "none";
    }
}

// 마커 초기화
function clearRobotMarkers() {
    window.robotMarkers.forEach(marker => {
        // marker가 Car 객체인 경우
        if (marker.marker) {
            marker.marker.setMap(null);
        } else {
            // marker가 google.maps.Marker인 경우
            marker.setMap(null);
        }
    });
    window.robotMarkers = [];
    if (window.robotPolyline) {
        window.robotPolyline.setMap(null);
        window.robotPolyline = null;
    }
}

// 마커 + 선 그리기
function drawRobotMarkers(dataList) {
    if (!window.robotMarkers) window.robotMarkers = [];
    if (!window.robotPolyline) window.robotPolyline = null;

    clearRobotMarkers();  // 기존 마커/선 제거
    const path = [];
    let currentOpenDetailId = null;

    dataList.forEach((item, index) => {
        const position = { lat: item.latitude, lng: item.longitude };

        if (index === 0) {
            window.robotMap.setCenter(position);   // ← 핵심
        }

        if (!item.latitude || !item.longitude) {
            console.warn("❌ 좌표 없음 또는 잘못된 데이터:", item);
            return;
        }
        const robotCar = new Car(
            window.robotMap,             // 지도
            window.customMap,     // customMap
            index + 1,            // titleIndex
            item.carCode,         // carIndex
            item.latitude,
            item.longitude,
            item.date,
            item.detailId,
            null,                 // csv
            item.windDirection,   // 풍향
            item.radius = 500,
            item.angle = 30
        );

        // robotCar의 마커 스타일 커스터마이징
        robotCar.marker.setIcon({
            path: google.maps.SymbolPath.CIRCLE,
            scale: 10,
            fillColor: "red",
            fillOpacity: 1.0,
            strokeColor: "#FFFFFF",
            strokeOpacity: 1.0,
            strokeWeight: 2,
        });

        // 마커 라벨 설정
        robotCar.marker.setLabel({
            text: String(index + 1),
            color: "white",
            fontSize: "12px",
            fontWeight: "bold"
        });

        // 마커 제목 설정
        robotCar.marker.setTitle(`로봇 위치 (${item.date})`);

        // robotCar 마커에 추가 데이터 속성 설정
        robotCar.marker.itemData = item;

        // Car 객체의 기본 클릭 이벤트를 제거하고 새로운 이벤트 추가
        google.maps.event.clearListeners(robotCar.marker, 'click');

        robotCar.marker.addListener("click", async () => {
            const detailId = item.detailId;
            const carCode = item.carCode;
            const timestamp = item.date;
            runtimeCar = robotCar;

            await google.maps.importLibrary("maps");

            if(window.robotCircle){
                window.robotCircle.setMap(null);
            }

            window.robotCircle = new google.maps.Circle({
                strokeColor: "red",
                strokeOpacity: 0.8,
                strokeWeight: 2,
                fillColor: "green",
                fillOpacity: 0.35,
                map: window.robotMap,
                center: { lat: item.latitude, lng: item.longitude },
                radius: 2000 // 반경 2km
            });
            await drawCircularSector(item.latitude, item.longitude, item.windDirection);
            setRadioButtons(runtimeCar)

            // 같은 마커 클릭 시 모달 토글
            const modal = document.getElementById("analysisModal");
            if (currentOpenDetailId === detailId) {
                if (modal) modal.style.display = "none";
                currentOpenDetailId = null;
                return;
            }
            currentOpenDetailId = detailId;

            try {
                // 1. 좌표 정보, 풍향 채우기
                fillCoordinateTable(item.latitude, item.longitude, item.date);
                fillOdorDirection(item.windDirection ?? "-");

                // 2. 센서 데이터 불러오기
                const sensorResponse = await fetch(`/arims/robot/sensor-data?detailId=${detailId}&carCode=${carCode}`);
                const sensorData = await sensorResponse.json();
                // showSensorModal(sensorData);

                // 3. 날씨 정보 불러오기
                try {
                    const weatherResponse = await fetch(`/arims/robot/weather-data?carCode=${carCode}&timestamp=${timestamp}`);
                    if (weatherResponse.ok) {
                        const weatherText = await weatherResponse.text();
                        if (weatherText) {
                            const weatherData = JSON.parse(weatherText);
                            fillWeatherInfo(weatherData);
                        }
                    }
                } catch (weatherErr) {
                    console.error("🚨 날씨 데이터 호출 실패", weatherErr);
                }

                // 4. 화학물질 예측 및 사업장 비교 로직
                const raw = await fetchChemicalData(detailId);
                const integrated = integrateChemicalData(raw);
                const odorResult = await odorPrediction(integrated);

                // 악취 예측 결과 표시
                fillOdorPrediction(odorResult);
                openRobotModal(integrated, odorResult);

                // 2km 이내 사업장 비교
                const places = (window.customMap?.placeList?.places || [])
                    .filter(place => {
                        const distance = getDistance(item.latitude, item.longitude, place.lat, place.lon);
                        return distance <= 2;
                    });

                const commonData = await Promise.all(places.map(async place => {
                    const placeChemicals = await place.getPlaceChemicalData();
                    const matching = raw.filter(r =>
                        placeChemicals.some(p => p.chemicalName === r.chemicalName)
                    );
                    return {
                        title: place.getTitle(),
                        commonObject: matching
                    };
                }));

                const valueRank = sortValueRank(commonData);
                const ratioRank = sortRatioRank(commonData);

                // 비교 모달 표시
                window.robotCompareModal.open_modal();
                window.robotCompareModal.modal_init(trimTen(integrated), valueRank);
                window.robotCompareModal.modal_init2(trimTen(integrated), ratioRank);

            } catch (err) {
                console.error("🔥 마커 클릭 이벤트 처리 중 오류 발생:", err);
                alert("데이터를 불러오는 데 실패했습니다.");
            }
        });
        // robotCar 마커를 배열에 추가 (Car 객체 전체를 저장하거나 마커만 저장)
        window.robotMarkers.push(robotCar.marker);
        // 또는 Car 객체 전체를 저장하려면:
        // window.robotMarkers.push(robotCar);

        path.push(position);
    });

    // 경로 선 그리기
    if (path.length > 1) {
        window.robotPolyline = new google.maps.Polyline({
            path,
            geodesic: true,
            strokeColor: "red",
            strokeOpacity: 0.8,
            strokeWeight: 3,
        });
        window.robotPolyline.setMap(window.robotMap);
    } else {
        console.warn("경로 그릴 수 없음: 유효한 좌표 부족");
    }
}


// 모달 호출
async function openChemicalModal(sensorId) {
    try {
        const response = await fetch(`/arims/robot/ppm?sensorId=${sensorId}`);
        const ppm = await response.json();

        if (ppm == null) {
            alert("해당 센서의 ppm 값이 없습니다.");
            return;
        }

        const table = document.getElementById("integratedTable");
        table.innerHTML = `
            <thead><tr><th>농도(ppm_ref_go)</th></tr></thead>
            <tbody><tr><td>${ppm}</td></tr></tbody>
        `;
        window.analysisModal.open_modal();       // ✅ 대체
        window.analysisModal.switchModalTitle("OOO");
        window.analysisModal.modal_init(chemicalData, odorResult);
    } catch (err) {
        console.error("센서 정보 오류:", err);
        alert("센서 정보를 불러올 수 없습니다.");
    }
}
function showSensorModal(sensorDataList) {
    if (!Array.isArray(sensorDataList)) {
        alert("⚠️ 센서 데이터를 불러오지 못했습니다.");
        return;
    }
    const tableBody = document.querySelector("#integratedTable tbody");
    const tableHead = document.querySelector("#integratedTable thead");
    tableBody.innerHTML = "";
    tableHead.innerHTML = "";

    // 헤더 설정 (센서명, PPM, REF, RS, RO 등)
    const headers = ["센서명", "PPM"];
    // const headers = ["센서명", "PPM", "REF", "RS", "RO"];
    const headRow = document.createElement("tr");
    headers.forEach(title => {
        const th = document.createElement("th");
        th.textContent = title;
        headRow.appendChild(th);
    });
    tableHead.appendChild(headRow);

    // 센서 데이터 행 구성
    sensorDataList.forEach(sensor => {
        const row = document.createElement("tr");
        const values = [
            sensor.gasName,  // 센서 이름
            sensor.ppm,      // ppm
            // sensor.ref,      // ppm_ref_go 혹은 비슷한 값
            // sensor.rs,
            // sensor.ro
        ];
        values.forEach(val => {
            const td = document.createElement("td");
            td.textContent = val;
            row.appendChild(td);
        });
        tableBody.appendChild(row);
    });

    // 모달 표시
    const modal = document.getElementById("analysisModal");
    modal.style.display = "block";
}
function showWeatherModal(data) {
    if (!data) {
        alert("해당 시간의 날씨 데이터가 없습니다.");
        return;
    }

    const html = `
        <table>
            <tr><th>시간</th><td>${data.reg_date}</td></tr>
            <tr><th>온도</th><td>${data.wd_temp} ℃</td></tr>
            <tr><th>습도</th><td>${data.wd_humi} %</td></tr>
            <tr><th>풍향</th><td>${data.wd_wdd} °</td></tr>
            <tr><th>풍속</th><td>${data.wd_wds} m/s</td></tr>
        </table>
    `;

    const modal = document.getElementById("weatherModal");
    modal.querySelector(".content").innerHTML = html;
    modal.style.display = "block";
}


window.addEventListener("click", function (e) {
    const modal = document.getElementById("analysisModal");
    if (e.target === modal) {
        modal.style.display = "none";
    }
});

function sortValueRank(commondata) {
    commondata.forEach(item => {
        item.commonObject.sort((a, b) => b.chemicalValue - a.chemicalValue);
        item.valueSum = item.commonObject.reduce((sum, obj) => sum + obj.chemicalValue, 0);
    });
    commondata.sort((a, b) => b.valueSum - a.valueSum);
    commondata.forEach((item, index) => item.rank = index + 1);
    return commondata;
}

function sortRatioRank(commondata) {
    commondata.forEach(item => {
        item.commonObject.sort((a, b) => b.relativeRatio - a.relativeRatio);
        item.relativeRatioSum = item.commonObject.reduce((sum, obj) => sum + obj.relativeRatio, 0);
    });
    commondata.sort((a, b) => b.relativeRatioSum - a.relativeRatioSum);
    commondata.forEach((item, index) => item.rank = index + 1);
    return commondata;
}

function trimTen(array) {
    return array.length > 10 ? array.slice(0, 10) : array;
}
async function fetchAndAddPlaces() {
    try {
        const res = await fetch("/arims/place");
        const data = await res.json();
        const places = data.list;

        for (const place of places) {
            await window.sourcePlaceList.addPlace(
                place.companyIndex,
                place.name,
                {
                    lat: place.latitude,
                    lng: place.longitude
                },
                place.csvFilename,
                place.odor
            );
        }

        window.sourcePlaceList.makeCluster();
        // console.log("✅ 사업장 데이터 로딩 완료:", window.sourcePlaceList.places);
    } catch (err) {
        console.error("❌ 사업장 데이터 불러오기 실패:", err);
    }
}
/**
 * 두 지점 간의 거리 계산 (단위: km)
 * Haversine Formula
 */
function getDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // 지구 반지름 (km 단위)
    const dLat = deg2rad(lat2 - lat1);
    const dLon = deg2rad(lon2 - lon1);

    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(deg2rad(lat1)) *
        Math.cos(deg2rad(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
}

function deg2rad(deg) {
    return deg * (Math.PI / 180);
}
// 반경을 변경시 생기는 이벤트
function changeRadius(radius) {
    clearTableText()
    runtimeCar.radius = radius;
    runtimeCar.checkmarker_event_start();
}

// 너비를 변경할시 생기는 이벤트
function changeAngle(angle) {
    runtimeCar.angle = angle;
    clearTableText()
    runtimeCar.checkmarker_event_start();
}
// 반경 내 사업장 데이터 채우기
function fillInRadiusTable(objects) {
// 테이블을 가져옵니다.
    var table = document.querySelector("#odor_correct_table");

// 기존 thead를 제거합니다.
    var existingThead = table.querySelector('thead');
    if (existingThead) {
        table.removeChild(existingThead);
    }

// 새로운 thead 요소를 만듭니다.
    var thead = document.createElement('thead');

// 첫 번째 tr 요소와 td 요소를 만듭니다.
    var tr1 = document.createElement('tr');
    var td1 = document.createElement('td');
    td1.setAttribute('style', 'width: 10%; padding-top: 4px; padding-bottom: 4px; border: 1px solid #30497d; background-color: #1f2f63;');
    td1.setAttribute('rowspan', Math.max(objects.length, 3)+1);
    td1.innerText = '사업장 명';
    tr1.appendChild(td1);
    thead.appendChild(tr1);

// 나머지 tr과 td 요소를 만듭니다.
    for (var i = 0; i < Math.max(objects.length, 3); i++) {
        var tr = document.createElement('tr');
        var td = document.createElement('td');
        td.className = 'inRadius';
        td.setAttribute('style', 'width: 25%; border: 1px solid #30497d');
        td.innerText = objects[i] ? objects[i].title : '.'; // 객체가 존재하면 title, 아니면 '.'을 설정합니다.
        tr.appendChild(td);
        thead.appendChild(tr);
    }

// 테이블에 thead를 추가합니다.
    table.appendChild(thead);
    (window.web || window.webRobot).addClickInRadiusEvent();
}


function fillMatchingPlaceTable(objects) {
    // 테이블을 가져옵니다.
    var table = document.querySelector("#wind_odor_correct_table");

// 기존 thead를 제거합니다.
    var existingThead = table.querySelector('thead');
    if (existingThead) {
        table.removeChild(existingThead);
    }

// 새로운 thead 요소를 만듭니다.
    var thead = document.createElement('thead');

// 첫 번째 tr 요소와 td 요소를 만듭니다.
    var tr1 = document.createElement('tr');
    var td1 = document.createElement('td');
    td1.setAttribute('style', 'width: 10%; padding-top: 4px; padding-bottom: 4px; border: 1px solid #30497d; background-color: #1f2f63;');
    td1.setAttribute('rowspan', Math.max(objects.length, 3)+1);
    td1.innerText = '사업장 명';
    tr1.appendChild(td1);
    thead.appendChild(tr1);

// 나머지 tr과 td 요소를 만듭니다.
    for (var i = 0; i < Math.max(objects.length, 3); i++) {
        var tr = document.createElement('tr');
        var td = document.createElement('td');
        td.className = 'matching';
        td.setAttribute('style', 'width: 25%; border: 1px solid #30497d');
        td.innerText = objects[i] ? objects[i].title : '.'; // 객체가 존재하면 title, 아니면 '.'을 설정합니다.
        tr.appendChild(td);
        thead.appendChild(tr);
    }

// 테이블에 thead를 추가합니다.
    table.appendChild(thead);
    (window.web || window.webRobot).addClickMatchingEvent()
}


// 악취 원인 사업장 예측 테이블 채우기
function fillPredictResultTable(objects){
    var nameCells = document.querySelectorAll(
        "#predict_result_table .result_place"
    );
    var sumCells = document.querySelectorAll(
        "#predict_result_table .result_sum"
    );
    var rankCells = document.querySelectorAll(
        "#predict_result_table .result_rank"
    );


    // 최대 3개의 객체에서 title을 가져와 셀에 삽입합니다.
    for (var i = 0; i < Math.min(objects.length, 3); i++) {
        nameCells[i].innerText = objects[i].title;
    }

    // 최대 3개의 객체에서 title을 가져와 셀에 삽입합니다.
    for (var i = 0; i < Math.min(objects.length, 3); i++) {
        rankCells[i].innerText = objects[i].rank;
    }

    // 최대 3개의 객체에서 title을 가져와 셀에 삽입합니다.
    for (var i = 0; i < Math.min(objects.length, 3); i++) {
        sumCells[i].innerText = objects[i].relativeRatioSum.toFixed(1);
    }

}

// 반경 및 부채꼴 너비 값을 범주형 데이터로 변환
function convertToButtonValue(type, value) {
    if (type === "angle") {
        // 반경을를 버튼의 값으로 변환합니다.
        if (value >= 0 && value <= 30) {
            return 30;
        } else if (value > 30 && value <= 60) {
            return 60;
        } else if (value > 60 && value <= 90) {
            return 90;
        } else if (value > 90 && value <= 120) {
            return 120;
        } else {
            return 120; // 해당하는 범위가 없을 경우 null 반환
        }
    } else if (type === "radius") {
        // 반경을 버튼의 값으로 변환합니다.
        // 예를 들어, 반경이 0 ~ 5000 사이에 있을 때, 1000, 2000, 3000, 4000, 5000 값으로 변환합니다.
        if (value >= 0 && value <= 500) {
            return 500;
        } else if (value > 500 && value <= 1000) {
            return 1000;
        } else if (value > 1000 && value <= 2000) {
            return 2000;
        } else if (value > 2000 && value <= 3000) {
            return 3000;
        } else if (value > 3000 && value <= 4000) {
            return 4000;
        } else if (value > 4000 && value <= 5000) {
            return 5000;
        } else {
            return null; // 해당하는 범위가 없을 경우 null 반환
        }
    } else {
        return null; // 유효하지 않은 type일 경우 null 반환
    }
}
async function drawCircularSector(lat, lng, windDirDeg) {
    await google.maps.importLibrary("geometry");

    const center = new google.maps.LatLng(lat, lng);
    const radius = 2000; // 2km
    const sectorAngle = 60; // 부채꼴 각도 (예: ±30도)

    const startAngle = windDirDeg - sectorAngle / 2;
    const endAngle = windDirDeg + sectorAngle / 2;

    const { spherical } = google.maps.geometry;

    const points = [center];

    const segments = 60;
    for (let i = 0; i <= segments; i++) {
        const angle = startAngle + ((endAngle - startAngle) * i) / segments;
        const vertex = spherical.computeOffset(center, radius, angle);
        points.push(vertex);
    }
    points.push(center); // 닫기

    // 이전 부채꼴 제거
    if (window.robotSector) {
        window.robotSector.setMap(null);
    }

    // 부채꼴 추가
    window.robotSector = new google.maps.Polygon({
        paths: points,
        strokeColor: "#0099ff",
        strokeOpacity: 0.6,
        strokeWeight: 1,
        fillColor: "#3399ff",
        fillOpacity: 0.3,
        map: window.robotMap
    });
}
