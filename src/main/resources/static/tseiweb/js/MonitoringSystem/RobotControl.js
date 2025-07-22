class RobotController {
    constructor(map) {
        this.map = map;
        this.pathRecording = false;
        this.robotPaths = []; // 여러 경로를 저장할 배열
        this.currentPath = []; // 현재 입력 경로 저장 배열
        this.robotPreviewMarkers = [];

        this.pathPolyline = null;
        this.savedPathOverlays = {};
    }

    updatePathListUI() {
        const listEl = document.getElementById("pathList");
        listEl.innerHTML = "";

        this.robotPaths.forEach((path, pathIdx) => {
            const label = String.fromCharCode(65 + pathIdx);
            const li = document.createElement("li");
            li.innerHTML = `
🚗 <strong>${label} 경로</strong> (${path.length} points)
<button onclick="robotController.viewPath(${pathIdx})">보기</button>
<button onclick="robotController.save(${pathIdx})">저장</button>
<button onclick="robotController.deleteSavedPath(${pathIdx})">삭제</button>`;
            listEl.appendChild(li);
        });

        if (this.currentPath.length > 0) {
            const divider = document.createElement("li");
            divider.innerHTML = `<hr><strong>현재 경로</strong>`;
            listEl.appendChild(divider);

            this.currentPath.forEach((point, i) => {
                const li = document.createElement("li");
                li.textContent = `${i + 1}. ${point.latitude.toFixed(7)}, ${point.longitude.toFixed(7)}`;
                listEl.appendChild(li);
            });
        }
    }

    viewPath(index) {
        const path = this.robotPaths[index];
        if (!path) return;

        this.robotPreviewMarkers.forEach(marker => marker.setMap(null));
        this.robotPreviewMarkers = [];

        path.forEach((point, i) => {
            const marker = new google.maps.Marker({
                position: { lat: point.latitude, lng: point.longitude },
                map: this.map,
                title: `Saved Point ${i + 1}`,
                icon: {
                    path: google.maps.SymbolPath.CIRCLE,
                    fillColor: "blue",
                    fillOpacity: 1.0,
                    strokeColor: "white",
                    strokeWeight: 2,
                    scale: 6
                }
            });
            this.robotPreviewMarkers.push(marker);
        });
    }

    deleteSavedPath(index) {
        this.robotPaths.splice(index, 1);
        this.updatePathListUI();
    }

    registerClickListener() {
        const mapDiv = document.getElementById("map");
        const map = this.map;

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
                title: `경로점 ${this.currentPath.length + 1}`
            });

            this.robotPreviewMarkers.push(marker);
            this.currentPath.push({
                latitude: latLng.lat(),
                longitude: latLng.lng(),
                date: new Date().toISOString(),
                windDirection: null
            });
            this.updatePathListUI();
        });
        console.log("✅ 로봇 경로 클릭 리스너 등록 완료");
    }

    start() {
        this.pathRecording = true;
        this.currentPath = [];
        this.robotPreviewMarkers.forEach(marker => marker.setMap(null));
        this.robotPreviewMarkers = [];
        document.getElementById("map").classList.add("crosshair-cursor");
        alert("🟢 경로 입력 모드입니다. 지도를 클릭하여 경로를 지정하세요.");
        console.log("📍 pathRecording 상태:", this.pathRecording);
    }

    end() {
        this.pathRecording = false;
        document.getElementById("map").classList.remove("crosshair-cursor");
        console.log("🛑 경로 입력 종료됨:", this.currentPath);
        alert("경로 입력이 완료되었습니다. 경로 저장을 이어나가세요");

        if (this.currentPath.length > 0) {
            this.robotPaths.push(this.currentPath);
            this.currentPath = [];
            this.updatePathListUI();
        } else {
            alert("⚠️ 저장할 경로가 없습니다.");
        }
    }

    async save(index) {
        const path = this.robotPaths[index];
        if (!path || !path.length) {
            alert("❗ 저장할 경로가 없습니다.");
            return;
        }

        const carCode = document.getElementById("robotSelect").value;
        const type = document.getElementById("routeType").value;
        const date = new Date().toISOString().split("T")[0];

        // ✅ 고유 pathGroup 이름 가져오기
        const pathGroup = await getNextPathGroupName();
        const labeledPath = path.map(p => ({
            ...p,
            pathGroup // ✅ 각 point 객체에 pathGroup 포함
        }));

        const payload = {
            carCode,
            type,
            date,
            pathGroup, // ✅ 여기에도 명시
            points: labeledPath
        };

        try {
            const res = await fetch("/arims/robotPath/save", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            });

            if (!res.ok) throw new Error("❌ 저장 실패");

            alert(`✅ ${pathGroup} 경로 저장 완료!`);
            this.updatePathListUI();
        } catch (err) {
            console.error(err);
            alert("❌ 저장 중 오류 발생");
        }
    }
    drawPathGroup(groupKey, points) {
        if (this.savedPathOverlays[groupKey]) return;

        const pathCoordinates = [];
        const markers = [];

        points.forEach((point, i) => {
            const latLng = { lat: point.latitude, lng: point.longitude };
            pathCoordinates.push(latLng);

            const marker = new google.maps.Marker({
                position: latLng,
                map: this.map,
                label: `${i + 1}`,
                title: `${groupKey} 경로 ${i + 1}번`,
                icon: {
                    path: google.maps.SymbolPath.CIRCLE,
                    fillColor: "#ff8800",
                    fillOpacity: 1.0,
                    strokeColor: "#fff",
                    strokeWeight: 2,
                    scale: 6
                }
            });
            markers.push(marker);
        });

        const polyline = new google.maps.Polyline({
            path: pathCoordinates,
            geodesic: true,
            strokeColor: "#ff0000",
            strokeOpacity: 1.0,
            strokeWeight: 2
        });
        polyline.setMap(this.map);

        // ✅ 📍 카메라 이동 (첫 지점으로)
        const firstLatLng = { lat: points[0].latitude, lng: points[0].longitude };
        this.map.panTo(firstLatLng);
        this.map.setZoom(18);

        this.savedPathOverlays[groupKey] = {
            markers,
            polyline
        };
    }

    clearPathGroup(groupKey) {
        const overlay = this.savedPathOverlays[groupKey];
        if (!overlay) return;

        overlay.markers.forEach(marker => marker.setMap(null));
        if (overlay.polyline) overlay.polyline.setMap(null);

        delete this.savedPathOverlays[groupKey];
    }


}

let robotController;
document.addEventListener("DOMContentLoaded", async () => {
    await waitForGoogleMaps();

    window.webRobot = new WebRobot();
    await webRobot.init();
    webRobot.addEventListeners();

    const map = webRobot.customMap.getMap();
    if (!map || typeof map.addListener !== "function") {
        console.error("❌ 지도 초기화 실패 또는 Google Map 객체 아님");
        return;
    }
    robotController = new RobotController(map);
    window.robotController = robotController;
    robotController.registerClickListener();

    document.getElementById("startPath").addEventListener("click", () => {
        robotController.start();
    });

    document.getElementById("endPath").addEventListener("click", () => {
        robotController.end();
    });

    document.getElementById("saveRobotPathBtn").addEventListener("click", () => {
        alert("각 경로 옆의 저장 버튼을 눌러 저장하세요.");
    });

    document.getElementById("openRobotPathModal").addEventListener("click", () => {
        document.getElementById("robotPathModal").style.display = "block";
    });

    document.getElementById("viewSavedPath").addEventListener("click", viewSavedPath);
});

async function viewSavedPath() {
    const carCode = document.getElementById("robotSelect").value;
    const date = new Date().toISOString().split("T")[0];

    try {
        const res = await fetch(`/arims/robotPath/get?carCode=${carCode}&date=${date}`);
        const data = await res.json();

        const ul = document.getElementById("pathList");
        ul.innerHTML = "";

        if (!Array.isArray(data) || data.length === 0) {
            ul.innerHTML = '<li>저장된 경로가 없습니다.</li>';
            return;
        }

        // ✅ pathGroup 기준으로 그룹핑
        const grouped = {};
        data.forEach(point => {
            const group = point.pathGroup || "unknown";
            if (!grouped[group]) grouped[group] = [];
            grouped[group].push(point);
        });

        // ✅ 그룹별로 표시
        Object.keys(grouped).sort().forEach((groupKey) => {
            const points = grouped[groupKey];

            const wrapper = document.createElement("li");

            // 체크박스 + 라벨
            const checkbox = document.createElement("input");
            checkbox.type = "checkbox";
            checkbox.id = `path-check-${groupKey}`;
            checkbox.dataset.group = groupKey;

            const label = document.createElement("label");
            label.htmlFor = checkbox.id;
            label.innerHTML = `🚗 <strong>${groupKey} 경로</strong> (${points.length} points)`;

            wrapper.appendChild(checkbox);
            wrapper.appendChild(label);
            ul.appendChild(wrapper);

            // ✅ 상세 포인트 리스트
            points.forEach((point, i) => {
                const pointLi = document.createElement("li");
                pointLi.style.paddingLeft = "20px";
                pointLi.textContent = `${i + 1}. ${point.latitude.toFixed(7)}, ${point.longitude.toFixed(7)}`;
                ul.appendChild(pointLi);
            });

            // ✅ 체크 이벤트 → 지도에 그림 그리기
            checkbox.addEventListener("change", (e) => {
                if (e.target.checked) {
                    robotController.drawPathGroup(groupKey, points);
                } else {
                    robotController.clearPathGroup(groupKey);
                }
            });
        });



    } catch (err) {
        console.error(err);
        alert("경로 조회 실패");
    }
}

async function getNextPathGroupName() {
    const carCode = document.getElementById("robotSelect").value;
    const date = new Date().toISOString().split("T")[0];

    try {
        const res = await fetch(`/arims/robotPath/groups?carCode=${carCode}&date=${date}`);
        const existingGroups = await res.json();

        const used = new Set(existingGroups);

        for (let i = 0; i < 26; i++) {
            const char = String.fromCharCode(65 + i); // A~Z
            if (!used.has(char)) return char;
        }
        return "Z";
    } catch (err) {
        console.error("❌ 경로 그룹 조회 실패", err);
        return "A";
    }
}
