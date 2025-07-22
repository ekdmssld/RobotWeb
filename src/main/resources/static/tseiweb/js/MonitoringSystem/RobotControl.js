let pathRecording = false;
let robotPathPoints = [];
let robotPreviewMarkers = [];
let googleMap = null; // 직접 map 참조 저장

const mapElement = document.getElementById("map");

// ✅ 마커 초기화
function clearRobotPreviewMarkers() {
    robotPreviewMarkers.forEach(marker => marker.setMap(null));
    robotPreviewMarkers = [];
}

// ✅ Google Maps 객체 가져오기 (여러 방법 시도)
function getGoogleMap() {
    // Google Maps API 로드 확인
    if (typeof google === 'undefined' || !google.maps) {
        console.error("❌ Google Maps API가 로드되지 않았습니다.");
        return null;
    }

    // 방법 1: 직접 저장된 참조 사용 (유효한 지도 객체인지 확인)
    if (googleMap && googleMap.getCenter) {
        return googleMap;
    }

    // 방법 2: webRobot 통해 접근
    if (window.webRobot?.customMap?.getMap) {
        const mapCandidate = window.webRobot.customMap.getMap();
        if (mapCandidate && mapCandidate.getCenter) {
            googleMap = mapCandidate;
            return googleMap;
        }
    }

    // 방법 3: 전역 변수 확인 (실제 Google Maps 객체인지 확인)
    if (window.map && window.map.getCenter) {
        googleMap = window.map;
        return googleMap;
    } else if (window.map) {
        console.warn("⚠️ window.map이 존재하지만 Google Maps 객체가 아님:", typeof window.map);
    }

    // 방법 4: DOM에서 map 인스턴스 찾기
    const mapDiv = document.getElementById("map");
    if (mapDiv) {
        // 여러 가능한 속성명 확인
        const possibleProps = ['_googleMap', 'map', 'googleMap', '__gm'];
        for (const prop of possibleProps) {
            if (mapDiv[prop] && mapDiv[prop].getCenter) {
                googleMap = mapDiv[prop];
                return googleMap;
            }
        }
    }

    // 방법 5: 전역에서 Google Maps 인스턴스 검색
    for (const key of Object.keys(window)) {
        try {
            if (window[key] && typeof window[key] === 'object' && window[key].getCenter) {
                googleMap = window[key];
                return googleMap;
            }
        } catch (e) {
            // 접근 불가능한 속성 무시
        }
    }

    console.error("❌ Google Maps 객체를 찾을 수 없습니다.");
    return null;
}

// ✅ 모달 열기
document.getElementById("openRobotPathModal").addEventListener("click", () => {
    document.getElementById("robotPathModal").style.display = "block";
});

// ✅ 경로 기록 시작
document.getElementById("startPath").addEventListener("click", () => {
    const map = getGoogleMap();
    if (!map) {
        alert("❌ 지도가 준비되지 않았습니다. 잠시 후 다시 시도해주세요.");
        return;
    }

    pathRecording = true;
    robotPathPoints = [];
    clearRobotPreviewMarkers();
    mapElement.classList.add("crosshair-cursor");

    alert("🟢 지도를 클릭해 경로를 지정하세요.");
});

// ✅ 경로 기록 종료 및 DB 저장
document.getElementById("endPath").addEventListener("click", async () => {
    pathRecording = false;
    mapElement.classList.remove("crosshair-cursor");

    if (robotPathPoints.length === 0) {
        alert("⚠️ 선택된 경로가 없습니다.");
        return;
    }

    const carCode = document.getElementById("robotSelect").value;
    const type = document.getElementById("routeType").value;
    const date = new Date().toISOString().split("T")[0];

    const payload = {
        carCode,
        type,
        date,
        points: robotPathPoints
    };

    console.log("💾 저장할 데이터:", payload);

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

// ✅ 저장된 경로 조회
document.getElementById("viewSavedPath").addEventListener("click", async () => {
    const carCode = document.getElementById("robotSelect").value;
    const date = new Date().toISOString().split("T")[0];

    try {
        const res = await fetch(`/arims/robotPath/get?carCode=${carCode}&date=${date}`);
        const data = await res.json();
        if (data.length === 0) {
            alert("⚠️ 저장된 경로가 없습니다.");
        } else {
            drawRobotMarkers(data); // 이미 정의된 함수 사용
        }
    } catch (err) {
        console.error("불러오기 오류:", err);
        alert("❌ 경로 조회 실패");
    }
});

// ✅ 지도 클릭 리스너 등록 (개선된 버전)
function registerRobotClickListener() {
    try {
        const map = getGoogleMap();
        if (!map) {
            console.error("❌ map 객체를 찾을 수 없어 클릭 리스너 등록 실패");
            return false;
        }

        if (window.robotClickListener) {
            google.maps.event.removeListener(window.robotClickListener);
        }

        const mapDiv = document.getElementById("map");
        if (mapDiv) {
            mapDiv.removeEventListener("click", window.robotDOMClickListener);
        }

        // ✅ 이 부분에서 에러가 나는지 확인
        window.robotClickListener = map.addListener("click", (e) => {
            console.log("📍 지도 클릭 발생");
            handleMapClick(e);
        });

        return true;

    } catch (err) {
        console.error("❌ 클릭 리스너 등록 중 에러:", err);
        return false;
    }

    const mapDiv = document.getElementById("map");
    mapDiv.addEventListener("click", (event) => {
        console.log("📍 DOM 클릭 발생 (백업용)");
    });

}



function isDuplicate(lat, lng) {
    return robotPathPoints.some(
        p => Math.abs(p.latitude - lat) < 0.000001 && Math.abs(p.longitude - lng) < 0.000001
    );
}

// 클릭 처리 로직을 별도 함수로 분리
function handleMapClick(e) {
    if (!pathRecording) {
        console.log("⏸️ 경로 기록 모드가 아님 (pathRecording:", pathRecording, ")");
        return;
    }

    const lat = e.latLng.lat();
    const lng = e.latLng.lng();

    console.log("실제 좌표 클릭", lat, lng);

    // 중복 좌표 체크
    if (isDuplicate(lat, lng)) {
        console.warn("⚠️ 이미 동일한 좌표가 등록되어 있습니다.");
        return;
    }

    try {
        const map = getGoogleMap();
        if (!map) {
            console.error("❌ 지도 객체 없음");
            return;
        }

        // 마커 생성
        const marker = new google.maps.Marker({
            position: { lat, lng },
            map: map,
            icon: {
                path: google.maps.SymbolPath.CIRCLE,
                fillColor: "green",
                fillOpacity: 1.0,
                strokeColor: "white",
                strokeWeight: 2,
                scale: 10
            },
            title: `경로점 ${robotPathPoints.length + 1}`,
            zIndex: 9999
        });

        robotPreviewMarkers.push(marker);
        robotPathPoints.push({
            latitude: lat,
            longitude: lng,
            date: new Date().toISOString(),
            windDirection: null
        });

        // 마커 가시성 확인
        if (!marker.getVisible()) {
            console.warn("⚠️ 마커가 보이지 않음, 강제 표시");
            marker.setVisible(true);
        }

    } catch (error) {
        console.error("❌ 마커 생성 중 오류:", error);
    }
}

// ✅ 지도 준비 상태 확인
function waitForMapReady(maxAttempts = 10, interval = 1000) {
    return new Promise((resolve, reject) => {
        let attempts = 0;

        const checkMap = () => {
            attempts++;
            const map = getGoogleMap();

            if (map) {
                resolve(map);
                return;
            }

            if (attempts >= maxAttempts) {
                console.error(`❌ 지도 로딩 실패 (${maxAttempts}회 시도)`);
                reject(new Error("지도 로딩 타임아웃"));
                return;
            }
            setTimeout(checkMap, interval);
        };

        checkMap();
    });
}

// ✅ 초기화
document.addEventListener("DOMContentLoaded", async () => {
    try {
        await waitForGoogleMaps();

        // WebRobot 먼저 초기화
        window.webRobot = new WebRobot();
        await webRobot.init();
        webRobot.addEventListeners();

        // ✅ 지도 객체가 초기화될 때까지 기다리기
        await waitForMapReady();

        // ⛳ 디버그 출력
        const map = getGoogleMap();
        console.log("🧭 getGoogleMap() 결과:", map);
        console.log("👉 typeof map.getCenter:", typeof map?.getCenter);

        // ✅ 반드시 지도 객체가 있어야 등록 시도
        if (map && typeof map.getCenter === "function") {
            const success = registerRobotClickListener();
            if (success) {
                console.log("🎉 로봇 경로 설정 초기화 완료!");
            } else {
                console.error("❌ 클릭 리스너 등록 실패 (지도 있음)");
            }
        } else {
            console.error("❌ 지도 객체가 올바르지 않음");
        }

    } catch (error) {
        console.error("❌ 초기화 실패:", error);
        setTimeout(() => {
            console.log("🔄 5초 후 재시도...");
            registerRobotClickListener();
        }, 5000);
    }
});


// ✅ 디버깅용 함수들
window.debugRobotPath = {
    checkMap: () => {
        console.log("=== 지도 상태 검사 ===");
        console.log("Google API:", typeof google !== 'undefined' ? "로드됨" : "미로드");
        console.log("google.maps:", typeof google !== 'undefined' && google.maps ? "사용 가능" : "사용 불가");

        const map = getGoogleMap();
        console.log("지도 객체:", map);
        console.log("지도 객체 타입:", typeof map);

        if (map) {
            console.log("getCenter 메소드:", typeof map.getCenter);
            if (map.getCenter) {
                console.log("지도 중심점:", map.getCenter());
            }
        }

        // DOM 요소도 확인
        const mapDiv = document.getElementById("map");
        console.log("Map DOM 요소:", mapDiv);
        console.log("Map DOM 속성들:", mapDiv ? Object.getOwnPropertyNames(mapDiv) : "없음");

        return !!map;
    },

    testMarker: () => {
        // Google Maps API 확인
        if (typeof google === 'undefined' || !google.maps) {
            console.error("❌ Google Maps API가 로드되지 않았습니다.");
            return;
        }

        const map = getGoogleMap();
        if (!map) {
            console.error("❌ 지도 객체 없음");
            return;
        }

        console.log("🗺️ 지도 객체:", map);
        console.log("🎯 지도 중심점:", map.getCenter?.());

        try {
            const testMarker = new google.maps.Marker({
                position: { lat: 35.5665, lng: 129.3326 }, // 울산 좌표
                map: map,
                icon: {
                    path: google.maps.SymbolPath.CIRCLE,
                    fillColor: "red",
                    fillOpacity: 1.0,
                    strokeColor: "white",
                    strokeWeight: 2,
                    scale: 15
                },
                title: "테스트 마커"
            });

            console.log("✅ 테스트 마커 생성됨:", testMarker);
            return testMarker;
        } catch (error) {
            console.error("❌ 마커 생성 실패:", error);
        }
    },

    forceRegisterListener: () => {
        console.log("🔧 강제 클릭 리스너 재등록...");
        return registerRobotClickListener();
    },

    getCurrentState: () => {
        console.log("=== 현재 상태 ===");
        console.log("pathRecording:", pathRecording);
        console.log("robotPathPoints 개수:", robotPathPoints.length);
        console.log("robotPreviewMarkers 개수:", robotPreviewMarkers.length);
        console.log("클릭 리스너:", window.robotClickListener);

        return {
            pathRecording,
            pointsCount: robotPathPoints.length,
            markersCount: robotPreviewMarkers.length,
            hasListener: !!window.robotClickListener
        };
    },

    simulateClick: (lat = 35.5665, lng = 129.3326) => {
        console.log("🧪 가상 클릭 시뮬레이션:", lat, lng);

        if (!pathRecording) {
            console.warn("⚠️ pathRecording이 false입니다. 먼저 시작 버튼을 누르세요.");
            return;
        }

        const map = getGoogleMap();
        if (!map) return;

        // 직접 마커 생성
        const marker = new google.maps.Marker({
            position: { lat, lng },
            map: map,
            icon: {
                path: google.maps.SymbolPath.CIRCLE,
                fillColor: "blue",
                fillOpacity: 1.0,
                strokeColor: "white",
                strokeWeight: 2,
                scale: 12
            },
            title: `시뮬레이션 마커`
        });

        console.log("✅ 시뮬레이션 마커 생성됨:", marker);
        return marker;
    },
};