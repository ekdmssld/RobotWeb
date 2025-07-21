let pathRecording = false;
let robotPathPoints = [];
let robotPreviewMarkers = [];

// ✅ 마커 초기화
function clearRobotPreviewMarkers() {
    robotPreviewMarkers.forEach(marker => marker.setMap(null));
    robotPreviewMarkers = [];
}

// ✅ 모달 열기
document.getElementById("openRobotPathModal").addEventListener("click", () => {
    document.getElementById("robotPathModal").style.display = "block";
});

// ✅ 경로 기록 시작
document.getElementById("startPath").addEventListener("click", () => {
    pathRecording = true;
    robotPathPoints = [];
    clearRobotPreviewMarkers();
    alert("🟢 지도를 클릭해 경로를 지정하세요.");
});

// ✅ 경로 기록 종료 및 DB 저장
document.getElementById("endPath").addEventListener("click", async () => {
    if (robotPathPoints.length === 0) {
        alert("⚠️ 선택된 경로가 없습니다.");
        return;
    }

    pathRecording = false;

    const carCode = document.getElementById("robotSelect").value;
    const type = document.getElementById("routeType").value;
    const date = new Date().toISOString().split("T")[0];

    const payload = {
        carCode,
        type,
        date,
        points: robotPathPoints
    };

    try {
        const res = await fetch("/arims/robotPath/save", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
        });

        if (!res.ok) throw new Error("저장 실패");

        alert("✅ DB 저장 완료!");
        robotPathPoints = [];
        clearRobotPreviewMarkers();
        document.getElementById("robotPathModal").style.display = "none";
    } catch (err) {
        console.error(err);
        alert("❌ 저장 중 오류가 발생했습니다.");
    }
});

// ✅ 저장된 경로 조회 및 표시
document.getElementById("viewSavedPath").addEventListener("click", async () => {
    const carCode = document.getElementById("robotSelect").value;
    const date = new Date().toISOString().split("T")[0];

    try {
        const res = await fetch(`/arims/robotPath/get?carCode=${carCode}&date=${date}`);
        const data = await res.json();
        if (data.length === 0) {
            alert("⚠️ 저장된 경로가 없습니다.");
        } else {
            drawRobotMarkers(data); // 이미 있는 함수 사용
        }
    } catch (err) {
        console.error("불러오기 오류:", err);
        alert("❌ 경로 조회 실패");
    }
});

// ✅ 지도 클릭 이벤트 등록
function addRobotMapClickListener() {
    if (!window.webRobot?.customMap?.map) {
        setTimeout(addRobotMapClickListener, 100); // 로딩 완료될 때까지 재시도
        return;
    }

    window.webRobot.customMap.map.addListener("click", (e) => {
        if (pathRecording) {
            const lat = e.latLng.lat();
            const lng = e.latLng.lng();
            const time = new Date().toISOString();

            robotPathPoints.push({
                latitude: lat,
                longitude: lng,
                date: time,
                windDirection: null
            });

            const marker = new google.maps.Marker({
                position: { lat, lng },
                map: window.webRobot.customMap.map,
                icon: {
                    path: google.maps.SymbolPath.CIRCLE,
                    fillColor: "green",
                    fillOpacity: 0.8,
                    strokeColor: "white",
                    strokeWeight: 1,
                    scale: 6
                },
                title: `경로 ${robotPathPoints.length}`
            });

            robotPreviewMarkers.push(marker);
        }
    });
}
// WebRobot 초기화 이후에 실행
document.addEventListener("DOMContentLoaded", async () => {
    await waitForGoogleMaps();            // 구글 맵 준비
    window.webRobot = new WebRobot();
    await webRobot.init();                // customMap.map 생성됨
    webRobot.addEventListeners();

    // ✅ 반드시 init 이후 등록
    addRobotMapClickListener();
});

