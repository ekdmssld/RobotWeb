class RobotModal {
    constructor(modalId) {
        this.modal = document.getElementById(modalId);
        this.modalText = document.getElementById("modalText");
        this.integratedTable = document.getElementById("integratedTable");

        this.weatherModal = document.getElementById("weatherModal");
        this.weatherContent = this.weatherModal?.querySelector(".content");

        this.dragging = false;
        this.startX = 0;
        this.startY = 0;
        this.offsetLeft = 0;
        this.offsetTop = 0;

        // 드래그 이벤트 등록
        this.modal.addEventListener("mousedown", this.handleDragStart.bind(this));
        document.addEventListener("mousemove", this.handleDragging.bind(this));
        document.addEventListener("mouseup", this.handleDragEnd.bind(this));
    }

    handleDragStart(e) {
        this.dragging = true;
        this.startX = e.clientX;
        this.startY = e.clientY;
        this.offsetLeft = parseInt(this.modal.style.left || 0);
        this.offsetTop = parseInt(this.modal.style.top || 0);
    }

    handleDragging(e) {
        if (!this.dragging) return;
        const dx = e.clientX - this.startX;
        const dy = e.clientY - this.startY;
        this.modal.style.left = `${this.offsetLeft + dx}px`;
        this.modal.style.top = `${this.offsetTop + dy}px`;
    }

    handleDragEnd() {
        this.dragging = false;
    }

    open(title, sensorData) {
        if (!this.modal) return;
        this.modal.style.left = "70%";
        this.modal.style.top = "5%";
        this.modal.style.display = "block";

        if (this.modalText) this.modalText.textContent = title;
        if (this.integratedTable) this.populateTable(sensorData);
    }

    openWeatherModal(data) {
        if (!this.weatherModal || !this.weatherContent) return;

        if (!data) {
            alert("해당 시간의 날씨 데이터가 없습니다.");
            return;
        }

        const html = `
      <table>
        <tr><th>시간</th><td>${data.regDate}</td></tr>
        <tr><th>온도</th><td>${data.wdTemp} ℃</td></tr>
        <tr><th>습도</th><td>${data.wdHumi} %</td></tr>
        <tr><th>풍향</th><td>${data.wdWdd} °</td></tr>
        <tr><th>풍속</th><td>${data.wdWds} m/s</td></tr>
      </table>
    `;
        this.weatherContent.innerHTML = html;
        this.weatherModal.style.display = "block";
    }

    close() {
        if (this.modal) this.modal.style.display = "none";
    }

    populateTable(data) {
        if (!Array.isArray(data)) {
            alert("센서 데이터 형식이 잘못되었습니다.");
            return;
        }

        const thead = this.integratedTable.querySelector("thead");
        const tbody = this.integratedTable.querySelector("tbody");
        if (!thead || !tbody) return;

        thead.innerHTML = `
      <tr><th>PPM</th></tr>
    `;

        tbody.innerHTML = data.map(row => `
      <tr><td>${row.ppmRefGo ?? '-'}</td></tr>
    `).join('');
    }
}

/**
 * ✅ 로봇 위치의 화학 데이터, 악취 예측값, AI 결과를 드래그 가능한 모달에 표시
 * @param {Array} chemicalData - [{chemicalName, chemicalValue, ...}]
 * @param {Array} odorResult - [{pred_smell_kind}, {pred_smell_strength}]
 */
function openRobotModal(chemicalData, odorResult) {
    const modal = document.getElementById("robotAnalysisModal");
    const header = document.getElementById("robotModalHeader");
    const table = document.getElementById("robotIntegratedTable");

    // 모달 열기
    modal.style.display = "block";
    modal.style.left = "65%";
    modal.style.top = "5%";

    // 드래그 기능 설정
    let isDragging = false;
    let startX = 0, startY = 0, startLeft = 0, startTop = 0;

    header.onmousedown = function (e) {
        isDragging = true;
        startX = e.clientX;
        startY = e.clientY;
        startLeft = parseInt(modal.style.left || 0);
        startTop = parseInt(modal.style.top || 0);
    };

    document.onmousemove = function (e) {
        if (!isDragging) return;
        const dx = e.clientX - startX;
        const dy = e.clientY - startY;
        modal.style.left = `${startLeft + dx}px`;
        modal.style.top = `${startTop + dy}px`;
    };

    document.onmouseup = function () {
        isDragging = false;
    };

    // 테이블 출력
    table.innerHTML = `
    <thead>
      <tr>
        <th>물질명</th><th>농도(ppb)</th><th>최소감지값</th>
        <th>희석배수</th><th>비율(%)</th>
      </tr>
    </thead>
    <tbody>
      ${chemicalData.map(item => `
        <tr>
          <td>${item.chemicalName}</td>
          <td>${item.chemicalValue.toFixed(2)}</td>
          <td>${item.minimumValue.toFixed(2)}</td>
          <td>${item.dilutionRate.toFixed(2)}</td>
          <td>${item.relativeRatio.toFixed(2)}</td>
        </tr>
      `).join("")}
    </tbody>
  `;

    // // 악취 예측 결과
    // kindField.textContent = odorResult[0]?.pred_smell_kind || "-";
    // strengthField.textContent = odorResult[1]?.pred_smell_strength?.toFixed(1) || "-";
}

window.RobotModal = RobotModal;
