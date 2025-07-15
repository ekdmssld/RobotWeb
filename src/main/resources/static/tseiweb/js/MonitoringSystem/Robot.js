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

    // 로봇 선택 이벤트
    document.getElementById("carCodeSelect").addEventListener("change", handleCarCodeChange);

    // 조회 버튼
    document.getElementById("searchRobot").addEventListener("click", () => {
        document.getElementById("loading-anim").style.display = "block";

        const carCode = document.getElementById("carCodeSelect").value;
        const date = document.getElementById("availableDates").value;
        if(!carCode){
            alert("로봇을 선택해주세요");
            return;
        }
        if(!date){
            alert("날짜를 선택해주세요");
            return;
        }

        if (!carCode || !date) {
            alert("로봇과 날짜를 선택해주세요");
            document.getElementById("loading-anim").style.display = "none"; // 혹시 몰라 안전하게 추가
            return;
        }

        fetchRobotPath(date, carCode);
    });

    await handleCarCodeChange(); // 초기 날짜 목록 로딩
});

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

// ✅ 마커 초기화
function clearRobotMarkers() {
    window.robotMarkers.forEach(marker => marker.setMap(null));
    window.robotMarkers = [];
    if (window.robotPolyline) {
        window.robotPolyline.setMap(null);
        window.robotPolyline = null;
    }
}

// ✅ 마커 + 선 그리기
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

            const modal = document.getElementById("analysisModal");

            // 이전에 열려 있던 마커와 같으면 닫기만 하고 종료
            if (currentOpenDetailId === detailId) {
                if (modal) modal.style.display = "none";
                currentOpenDetailId = null;
                return;
            }

            currentOpenDetailId = detailId; // 현재 클릭된 마커 저장

            fillCoordinateTable(item.latitude, item.longitude, item.date);
            fillOdorDirection(item.windDirection ?? "-");

            fetch(`/arims/robot/sensor-data?detailId=${detailId}&carCode=${carCode}`)
                .then(res => res.json())
                .then(data => {
                    showSensorModal(data); // 여기가 모달을 열고 있음
                })
                .catch(err => {
                    console.error("❌ 센서 데이터 호출 실패:", err);
                    alert("센서 데이터를 불러오는 데 실패했습니다.");
                });

            // 날씨 데이터 호출 → robotModal 인스턴스를 통해 표시하도록 수정
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
                    console.log("✅ 날씨 데이터 있음:", data);
                    window.robotModal.openWeatherModal(data); // ✅ 여기 추가
                })
                .catch(err => {
                    console.error("🚨 날씨 데이터 호출 실패", err);
                });



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
        console.warn("⚠️ 경로 그릴 수 없음: 유효한 좌표 부족");
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

    // 🧪 헤더 설정 (센서명, PPM, REF, RS, RO 등)
    const headers = ["센서명", "PPM", "REF", "RS", "RO"];
    const headRow = document.createElement("tr");
    headers.forEach(title => {
        const th = document.createElement("th");
        th.textContent = title;
        headRow.appendChild(th);
    });
    tableHead.appendChild(headRow);

    // 📊 센서 데이터 행 구성
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

    // 👁 모달 표시
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


