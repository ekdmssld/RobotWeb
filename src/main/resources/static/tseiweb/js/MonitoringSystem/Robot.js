// 🟡 로봇별 고정된 날짜 (강조용)
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

    const carCode = "R1";
    const fixedDate = fixedDates[carCode];

    document.getElementById("carCodeSelect").value = carCode;
    await fetchRobotPath(fixedDate, carCode);

    // 로봇 선택 이벤트
    document.getElementById("carCodeSelect").addEventListener("change", handleCarCodeChange);

    // 조회 버튼
    document.getElementById("searchRobot").addEventListener("click", () => {
        const carCode = document.getElementById("carCodeSelect").value;
        const fixedDate = fixedDates[carCode];
        if (!fixedDate) return alert("해당 로봇의 날짜가 지정되지 않았습니다.");

        fetchRobotPath(fixedDate, carCode);
    });

    await handleCarCodeChange(); // 초기 날짜 목록 로딩
});

// ✅ 구글 맵 로딩 대기
function waitForGoogleMaps() {
    return new Promise(resolve => {
        const check = () => {
            if (window.google && window.google.maps) resolve();
            else setTimeout(check, 100);
        };
        check();
    });
}

// ✅ 로봇 날짜 목록 불러오기
async function handleCarCodeChange() {
    const carCode = document.getElementById("carCodeSelect").value;
    try {
        const res = await fetch(`/arims/robot/available-dates?carCode=${carCode}`);
        const dates = await res.json();
        renderDateOptions(dates, carCode);
    } catch (err) {
        console.error("날짜 불러오기 실패:", err);
    }
}

// ✅ 날짜 select 렌더링
function renderDateOptions(dates, carCode) {
    const dateSelect = document.getElementById("availableDates");
    if (!dateSelect) return;
    dateSelect.innerHTML = "";

    if (!Array.isArray(dates)) return console.warn("잘못된 날짜 형식:", dates);

    dates.forEach(date => {
        const opt = document.createElement("option");
        opt.value = date;
        opt.textContent = date;
        if (date === fixedDates[carCode]) {
            opt.style.backgroundColor = "gold";
            opt.style.fontWeight = "bold";
        }
        dateSelect.appendChild(opt);
    });
}

// ✅ 경로 조회
async function fetchRobotPath(date, carCode) {
    const startTime = `${date} 00:00:00`;
    const endTime = `${date} 23:59:59`;

    try {
        const res = await fetch(`/arims/robot/path?startTime=${startTime}&endTime=${endTime}&carCode=${carCode}`);
        const data = await res.json();

        // console.log("📦 로봇 경로 데이터:", data);

        if (data && data.length > 0) {
            drawRobotMarkers(data);
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

    dataList.forEach((item) => {
        // console.log("💬 마커 좌표:", item.latitude, item.longitude);  // 디버깅용

        if (!item.latitude || !item.longitude) {
            console.warn("❌ 좌표 없음 또는 잘못된 데이터:", item);
            return;
        }

        const position = { lat: item.latitude, lng: item.longitude };
        const marker = new google.maps.Marker({
            position,
            map: window.robotMap,
            icon: "https://maps.google.com/mapfiles/ms/icons/blue-dot.png",
            title: `로봇 위치 (${item.date})`
        });

        marker.addListener("click", () => openChemicalModal(item.sensorId));

        window.robotMarkers.push(marker);
        path.push(position);
    });

    // 선 그리기
    if (path.length > 1) {
        window.robotPolyline = new google.maps.Polyline({
            path,
            geodesic: true,
            strokeColor: "#00AAFF",
            strokeOpacity: 0.8,
            strokeWeight: 3,
        });
        window.robotPolyline.setMap(window.robotMap);
    } else {
        console.warn("⚠️ 경로 그릴 수 없음: 유효한 좌표 부족");
    }
}


// ✅ 모달 호출
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
        console.log("클릭한 detailId", detailId);

        window.robotModal.open("센서 농도 정보", []);
    } catch (err) {
        console.error("센서 정보 오류:", err);
        alert("센서 정보를 불러올 수 없습니다.");
    }
}


