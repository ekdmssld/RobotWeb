class RobotController {
    constructor(map) {
        this.map = map;
        this.pathRecording = false;
        this.robotPathPoints = [];
        this.robotPreviewMarkers = [];
    }
    updatePathListUI(){
        const listEl = document.getElementById("pathList");
        listEl.innerHTML = "";
        this.robotPathPoints.forEach((point, idx) => {
            const li = document.createElement("li");
            li.innerHTML =  `<span><strong>${idx+1}.</strong>(${point.latitude.toFixed(6)},${point.latitude.toFixed(6)})</span>
<button onclick = "robotController.deletePathPoint(${idx})" style="margin-left:8px;">X</button> `;
            listEl.appendChild(li);
        })
    }
    deletePathPoint(idx){
        if(this.robotPreviewMarkers[idx]){
            this.robotPreviewMarkers[idx].setMap(null);
        }
        this.robotPreviewMarkers.splice(idx, 1);
        this.robotPathPoints.splice(idx, 1);
        this.updatePathListUI();
    }

    registerClickListener() {
        const mapDiv = document.getElementById("map");
        const map = this.map;

        // Google Maps overlayView 생성
        const overlay = new google.maps.OverlayView();
        overlay.onAdd = function () {};
        overlay.draw = function () {};
        overlay.setMap(map);

        mapDiv.addEventListener("click", (event) => {
            if (!this.pathRecording) return;

            const bounds = mapDiv.getBoundingClientRect();
            const x = event.clientX - bounds.left;
            const y = event.clientY - bounds.top;

            const projection = overlay.getProjection();
            if (!projection) {
                console.warn("❗ projection 없음. 지도 초기화가 덜 됐을 수 있음");
                return;
            }

            const point = new google.maps.Point(x, y);
            const latLng = projection.fromContainerPixelToLatLng(point);

            console.log("📌 클릭한 위경도:", latLng.lat(), latLng.lng());

            // 마커 추가
            const marker = new google.maps.Marker({
                position: latLng,
                map: this.map,
                icon: {
                    path: google.maps.SymbolPath.CIRCLE,
                    fillColor: "green",
                    fillOpacity: 1.0,
                    strokeColor: "white",
                    strokeWeight: 2,
                    scale: 10,
                },
                title: `경로점 ${this.robotPathPoints.length + 1}`
            });

            this.robotPreviewMarkers.push(marker);
            this.robotPathPoints.push({
                latitude: latLng.lat(),
                longitude: latLng.lng(),
                date: new Date().toISOString(),
                windDirection: null
            });
            this.robotPreviewMarkers.push(marker);
            this.robotPathPoints.push({ latitude: lat, longitude: lng });
            this.updatePathListUI();

        });
        console.log("✅ 로봇 경로 클릭 리스너 등록 완료");
    }


    start() {
        this.pathRecording = true;
        this.robotPathPoints = [];
        this.robotPreviewMarkers.forEach(marker => marker.setMap(null));
        this.robotPreviewMarkers = [];

        // 커서 변경
        document.getElementById("map").classList.add("crosshair-cursor");

        // 피드백
        alert("🟢 경로 입력 모드입니다. 지도를 클릭하여 경로를 지정하세요.");
        console.log("📍 pathRecording 상태:", this.pathRecording);
    }

    end() {
        this.pathRecording = false;
        document.getElementById("map").classList.remove("crosshair-cursor");
        console.log("🛑 경로 입력 종료됨:", this.robotPathPoints);
    }

    async save() {
        if (!this.robotPathPoints.length) {
            alert("❗ 저장할 경로가 없습니다.");
            return;
        }

        const carCode = document.getElementById("robotSelect").value;
        const type = document.getElementById("routeType").value;
        const date = new Date().toISOString().split("T")[0];

        const payload = {
            carCode,
            type,
            date,
            points: this.robotPathPoints
        };

        try {
            const res = await fetch("/arims/robotPath/save", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            });

            if (!res.ok) throw new Error("❌ 저장 실패");

            alert("✅ 경로 저장 완료!");
            this.robotPathPoints = [];
            this.robotPreviewMarkers.forEach(marker => marker.setMap(null));
            this.robotPreviewMarkers = [];
            document.getElementById("robotPathModal").style.display = "none";
            document.getElementById("map").classList.remove("crosshair-cursor");

        } catch (err) {
            console.error(err);
            alert("❌ 저장 중 오류 발생");
        }
    }
}

// ✅ 초기화
document.addEventListener("DOMContentLoaded", async () => {
    await waitForGoogleMaps();

    window.webRobot = new WebRobot();
    await webRobot.init();
    webRobot.addEventListeners();


    // ✅ 지도 초기화가 확실히 끝난 뒤 getMap() 호출
    const map = webRobot.customMap.getMap();
    if (!map || typeof map.addListener !== "function") {
        console.error("❌ 지도 초기화 실패 또는 Google Map 객체 아님");
        return;
    }
    window.robotController = new RobotController(map);
    robotController.registerClickListener();

    // 버튼 연결
    document.getElementById("startPath").addEventListener("click", () => {
        robotController.start();
    });

    document.getElementById("endPath").addEventListener("click", () => {
        robotController.end();
    });

    document.getElementById("saveRobotPathBtn").addEventListener("click", () => {
        robotController.save();
    });

    document.getElementById("openRobotPathModal").addEventListener("click", () => {
        document.getElementById("robotPathModal").style.display = "block";
    });
});

