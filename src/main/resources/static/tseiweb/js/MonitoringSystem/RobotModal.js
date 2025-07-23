class RobotModal {
    constructor(modalId) {
        this.modal = document.getElementById(modalId);
        this.modalText = document.getElementById("modalText");
        this.integratedTable = document.getElementById("integratedTable");

        this.weatherModal = document.getElementById("weatherModal");
        this.weatherContent = this.weatherModal?.querySelector(".content");

        this.compareModal = new CompareModal("robotCompareModal");  // 🔧추가
        window.robotCompareModal = this.compareModal;

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
    const analysisModal = document.getElementById("analysisModal");
    const compareModal = document.getElementById("robotCompareModal");
    const header = document.querySelector(".modal_1-content");
    const table = document.getElementById("integratedTable");
    const odorTable = document.getElementById("odorPredictTable");
    odorTable.innerHTML = generatePredictionChemicalRows(odorResult);

    // 🟦 두 모달 모두 열기
    analysisModal.style.display = "block";
    analysisModal.style.left = "72%";
    analysisModal.style.top = "2%";

    compareModal.style.display = "block";
    compareModal.style.left = "72%";
    compareModal.style.top = "50%";

    const modalText = document.getElementById("modalText");
    modalText.innerText = `${runtimeCar.titleIndex}번 지점의 화학 물질 및 악취 분류 정보`;

    // 드래그 기능 설정
    let isDragging = false;
    let startX = 0, startY = 0, startLeft = 0, startTop = 0;

    header.onmousedown = function (e) {
        isDragging = true;
        startX = e.clientX;
        startY = e.clientY;
        startLeft = parseInt(analysisModal.style.left || 0);
        startTop = parseInt(analysisModal.style.top || 0);
    };


    document.onmousemove = function (e) {
        if (!isDragging) return;
        const dx = e.clientX - startX;
        const dy = e.clientY - startY;
        analysisModal.style.left = `${startLeft + dx}px`;
        analysisModal.style.top = `${startTop + dy}px`;
    };

    document.onmouseup = function () {
        isDragging = false;
    };

    // 테이블 출력
    table.innerHTML = `
    <thead>
      <tr style="background-color:#30497D;">
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
// CompareModal 복사 후 이름만 변경
class RobotCompareModal extends CompareModal {
    constructor(modalId) {
        super(modalId);
    }
}
function generatePredictionChemicalRows(data) {

    let html = "";

    const pred_smell_kind = data[0]?.pred_smell_kind || "-";
    html += `<tr><td width='122px' style="background-color: #30497D">악취 종류</td><td width='122px' colspan="3">${pred_smell_kind}</td></tr>`;
    const pred_smell_strength = data[1]?.pred_smell_strength.toFixed(1) || "-";
    html += `<tr><td width='122px' style="background-color: #30497D">악취 세기</td><td width='122px' colspan="3" >${pred_smell_strength}</td></tr>`;

    return html;
}
window.robotCompareModal = new RobotCompareModal("robotCompareModal");
window.RobotModal = RobotModal;

window.AnalysisModal = AnalysisModal;
