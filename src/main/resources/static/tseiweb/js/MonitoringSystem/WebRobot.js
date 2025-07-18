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
    async searchPlace() {
        const keyword = document.getElementById("selectPlaceMarker").value;
        const matched = this.sourcePlaceList.places.filter(place =>
            place.getTitle().includes(keyword)
        );

        if (matched.length === 0) {
            alert("일치하는 장소가 없습니다.");
            return;
        }

        matched.forEach(place => {
            const pos = place.getLocation();
            this.customMap.map.setCenter(pos);
            this.customMap.map.setZoom(17);
            place.markerSetColor("red");
        });
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
    addEventListeners() {
        document.getElementById("searchCar").addEventListener("click", () => {
            this.searchCar();
        });

        document.getElementById("searchPlace").addEventListener("click", () => {
            this.searchPlace();
        });

        document.getElementById("carCodeSelect").addEventListener("change", () => {
            this.populateAvailableDates();
        });
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
}

window.webRobot = new WebRobot();

document.addEventListener("DOMContentLoaded", async () => {
    await waitForGoogleMaps();
    await window.webRobot.init();
    webRobot.carList.makeSelectionCar();
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
