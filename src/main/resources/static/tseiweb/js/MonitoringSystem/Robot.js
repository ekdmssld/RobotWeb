const fixedDates = {
    R1: "2024-08-13",
    R2: "2025-04-17"
};

document.addEventListener("DOMContentLoaded", async () => {
    await waitForGoogleMaps();

    window.robotModal = new RobotModal("analysisModal");
    window.robotMarkers = [];
    window.robotPolyline = null;

    await window.robotMapInit();

    //사업장 리스트 생성 및 지도에 표시
    window.sourcePlaceList = new SourcePlaceList(window.robotMap, null);
    await fetchAndAddPlaces();  // 아래에 정의된 함수 호출
    window.customMap = {};  // 임시 customMap 객체 생성
    window.customMap.placeList = window.sourcePlaceList;

    // 로봇 선택 이벤트
    document.getElementById("carCodeSelect").addEventListener("change", handleCarCodeChange);

    // 조회 버튼
    document.getElementById("searchRobot").addEventListener("click", () => {
        document.getElementById("loading-anim").style.display = "block";

        const carCode = document.getElementById("carCodeSelect").value;
        const date = document.getElementById("availableDates").value;

        if (!carCode || !date) {
            alert("로봇과 날짜를 선택해주세요");
            document.getElementById("loading-anim").style.display = "none";
            return;
        }

        fetchRobotPath(date, carCode);
    });

    await handleCarCodeChange(); // 초기 날짜 목록 로딩
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
    window.robotMarkers.forEach(marker => marker.setMap(null));
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

    dataList.forEach((item, index) => {
        const position = { lat: item.latitude, lng: item.longitude };

        if (index === 0) {
            window.robotMap.setCenter(position);   // ← 핵심
        }

        if (!item.latitude || !item.longitude) {
            console.warn("❌ 좌표 없음 또는 잘못된 데이터:", item);
            return;
        }


        const marker = new google.maps.Marker({
            position: { lat: item.latitude, lng: item.longitude },
            map: window.robotMap,
            icon: {
                path: google.maps.SymbolPath.CIRCLE,
                scale: 10,
                fillColor: "red",
                fillOpacity: 1.0,
                strokeColor: "#FFFFFF",
                strokeOpacity: 1.0,
                strokeWeight: 2,
            },
            label: {
                text: String(index + 1),
                color: "white",
                fontSize: "12px",
                fontWeight: "bold"
            },
            title: `로봇 위치 (${item.date})`});

        marker.detailId = item.detailId;
        marker.carCode = item.carCode;

        let currentOpenDetailId = null; // 전역 변수로 현재 열린 마커 추적

        marker.addListener("click", () => {
            const detailId = marker.detailId;
            const carCode = marker.carCode;
            const timestamp = item.date;

            // ✅ 현재 클릭된 detailId 기억
            const modal = document.getElementById("analysisModal");
            if (currentOpenDetailId === detailId) {
                if (modal) modal.style.display = "none";
                currentOpenDetailId = null;
                return;
            }
            currentOpenDetailId = detailId;

            // ✅ 좌표 정보, 풍향 채우기
            fillCoordinateTable(item.latitude, item.longitude, item.date);
            fillOdorDirection(item.windDirection ?? "-");

            // ✅ 센서 데이터 불러오기
            fetch(`/arims/robot/sensor-data?detailId=${detailId}&carCode=${carCode}`)
                .then(res => res.json())
                .then(data => {
                    showSensorModal(data);
                })
                .catch(err => {
                    console.error("❌ 센서 데이터 호출 실패:", err);
                    alert("센서 데이터를 불러오는 데 실패했습니다.");
                });

            // ✅ 날씨 정보 불러오기
            fetch(`/arims/robot/weather-data?carCode=${carCode}&timestamp=${timestamp}`)
                .then(response => {
                    if (!response.ok) throw new Error("데이터 없음");
                    return response.text();
                })
                .then(text => {
                    if (!text) throw new Error("응답 body 비어 있음");
                    return JSON.parse(text);
                })
                .then(data => {
                    fillWeatherInfo(data);
                })
                .catch(err => {
                    console.error("🚨 날씨 데이터 호출 실패", err);
                });

            // ✅ 화학물질 예측 및 사업장 비교 로직 실행
            (async () => {
                try {
                    const raw = await fetchChemicalData(detailId);
                    const integrated = integrateChemicalData(raw);
                    const odorResult = await odorPrediction(integrated);

                    // console.log("🧪 raw chemicalData:", raw);
                    // console.log("📊 integrated (with dilutionRate, ratio):", integrated);
                    // console.log("🌫️ odorPrediction:", odorResult);

                    fillOdorPrediction(odorResult);
                    openRobotModal(integrated, odorResult);

                    const places = (window.customMap?.placeList?.places || [])
                        .filter(place => {
                            const distance = getDistance(item.latitude, item.longitude, place.lat, place.lon);
                            return distance <= 2; // 2km 이내 사업장만 비교
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


                    console.log("🏭 사업장별 매칭 결과:", commonData);

                    const valueRank = sortValueRank(commonData);
                    const ratioRank = sortRatioRank(commonData);

                    console.log("📈 valueRank (농도 기준):", valueRank);
                    console.log("📉 ratioRank (비율 기준):", ratioRank);

                    // 모달 띄우기
                    // 항상 모달 띄우기 (비어 있어도)
                    window.robotCompareModal.open_modal();
                    window.robotCompareModal.modal_init(trimTen(integrated), valueRank);
                    window.robotCompareModal.modal_init2(trimTen(integrated), ratioRank);
                } catch (err) {
                    console.error("🔥 화학물질 비교/모달 처리 중 오류 발생:", err);
                }
            })();
        });
        window.robotMarkers.push(marker);
        path.push(position);
    });

    // 선 그리기
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
        window.robotModal.open("센서 농도 정보", []);
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
    const headers = ["센서명", "PPM", "REF", "RS", "RO"];
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
            sensor.ref,      // ppm_ref_go 혹은 비슷한 값
            sensor.rs,
            sensor.ro
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
