class Modal {
  constructor(modalId) {
    this.modalId = modalId;
    this.modal = document.getElementById(modalId);
    this.isDragging = false;
    this.dragStartX = 0;
    this.dragStartY = 0;
    this.dragStartLeft = 0;
    this.dragStartTop = 0;
    this.carValueSortedData;
    this.carRatioSortedData;
    this.placeValueCommonData;
    this.placeRatioCommonData;

    // 이벤트 리스너 등록
    this.modal.addEventListener("mousedown", this.handleMouseDown.bind(this));
    this.modal.addEventListener("mousemove", this.handleMouseMove.bind(this));
    this.modal.addEventListener("mouseup", this.handleMouseUp.bind(this));
  }

  // 드래그 시작 위치 저장
  handleMouseDown(e) {
    this.isDragging = true;
    this.dragStartX = e.clientX;
    this.dragStartY = e.clientY;
    this.dragStartLeft = parseInt(
      window.getComputedStyle(this.modal).getPropertyValue("left")
    );
    this.dragStartTop = parseInt(
      window.getComputedStyle(this.modal).getPropertyValue("top")
    );
  }

  // 드레그 중 모달 위치 업데이트
  handleMouseMove(e) {
    if (this.isDragging) {
      var offsetX = e.clientX - this.dragStartX;
      var offsetY = e.clientY - this.dragStartY;
      var newLeft = this.dragStartLeft + offsetX;
      var newTop = this.dragStartTop + offsetY;
      this.modal.style.left = newLeft + "px";
      this.modal.style.top = newTop + "px";
    }
  }

  // 드레그 종료
  handleMouseUp() {
    this.isDragging = false;
  }

  // 모달 닫기
  close_modal() {
    // 모달 on/off 버튼 켜놓기 
    const checkbox = document.getElementById("marker_hidden_slide");
    checkbox.checked = true;
    // 좌측 메뉴 초기화
    clearTableText();
    // 필드 초기화
    this.carValueSortedData = null;
    this.carRatioSortedData = null;
    this.placeValueCommonData = null;
    this.placeRatioCommonData = null;
    //모달 숨기기
    if (this.modal.style.display === "block") {
      this.modal.style.display = "none";
    }
  }

  // 모달 열기
  open_modal() {

    this.modal.style.display = "block"; // 무조건 표시
    this.modal.style.left = "72%";
    this.modal.style.top = "2%";

    // 모달 on/off 버튼이 on일때만 보이도록하기
    // marker_hidden_slide가 존재하지 않으면 무조건 열리도록 변경
    const checkbox = document.getElementById("marker_hidden_slide");
    if (!checkbox || checkbox.checked === true || checkbox.checked === undefined) {
      this.modal.style.display = "block";
    }


  }
}

// 분석 모달(객체별 화학 물질 정보 표시)
class AnalysisModal extends Modal {
  constructor(modalId) {
    super(modalId);

    // 방지시설예측 버튼 클릭이벤트 등록
    document.querySelector("#prevention-button > button").addEventListener("click", this.preventionButtonEvent);
  }


  // 동적으로 악취 유형 테이블 , 화학 성분 테이블 태그 만들기
  modal_init(chemicalIntegratedData, odorPredictData) {
    const integratedTable = document.getElementById("integratedTable");
    this.makeIntegratedTablehead(chemicalIntegratedData, integratedTable);
    const predictionTable = document.getElementById("odorPredictTable");
    this.makePredictionTablehead(odorPredictData, predictionTable);
  }

  //화학 성분 테이블 헤더 만들기 및 바디 만들기
  makeIntegratedTablehead(chemicalIntegratedData, table) {
    const tbody = table.getElementsByTagName("thead")[0];
    tbody.innerHTML =
      "<tr><th width='122px'>물질명</th><th width='122px'>농도(ppb)</th><th width='122px'>최소감지값</th><th width='122px'>희석 배수</th><th width='122px'>비율(%)</th></tr>";
    tbody.innerHTML += this.generateIntegratedChemicalRows(
      chemicalIntegratedData
    );
    table.style.marginBottom = "20px";
  }

  // 분석테이블 제목 바꾸기
  switchModalTitle(text) {
    const modalTextElement = document.getElementById("modalText");
    if (modalTextElement) {
      modalTextElement.textContent = text;
    }
  }

  // 화학 성분 테이블 바디 만들기
  generateIntegratedChemicalRows(data) {
    let html = "";
    for (let i = 0; i < data.length || i < 10; i++) {
      const chemicalName = data[i]?.chemicalName || "-";
      const chemicalValue = data[i]?.chemicalValue.toFixed(2) || "-";
      const minimumValue = data[i]?.minimumValue.toFixed(2) || "-";
      const dilutionRate = data[i]?.dilutionRate.toFixed(2) || "-";
      const relativeRatio = data[i]?.relativeRatio.toFixed(2) || "-";

      html += `<tr><td>${chemicalName}</td><td>${chemicalValue}</td><td>${minimumValue}</td><td>${dilutionRate}</td><td>${relativeRatio}</td></tr>`;
    }
    return html;
  }

  // 냄새 유형 테이블 헤더만들기 및 바디만들기
  makePredictionTablehead(predictionData, table) {
    const tbody = table.getElementsByTagName("thead")[0];
    tbody.innerHTML = "";
    tbody.innerHTML += this.generatePredictionChemicalRows(predictionData);
  }

  // 냄새 유형 테이블 바디 만들기
  generatePredictionChemicalRows(data) {

    let html = "";

    const pred_smell_kind = data[0]?.pred_smell_kind || "-";
    html += `<tr><td width='122px' style="background-color: #30497D">악취 종류</td><td width='122px' colspan="3">${pred_smell_kind}</td></tr>`;
    const pred_smell_strength = data[1]?.pred_smell_strength.toFixed(1) || "-";
    html += `<tr><td width='122px' style="background-color: #30497D">악취 세기</td><td width='122px' colspan="3" >${pred_smell_strength}</td></tr>`;

    return html;
  }

  // 방지시설예측버튼 세팅
  setPreventionButton(placeIndex){
    console.log(`setPreventionButton: ${placeIndex}`);
    console.log(placeIndex);
    const button = document.querySelector("#prevention-button button");
    if(placeIndex) {
      button.classList.remove("hidden");
      button.dataset.company_id = placeIndex;
    }
    else {
      button.classList.add("hidden");
    }


  }
  preventionButtonEvent() {
    const button = document.querySelector("#prevention-button button");
    const company_id = button.dataset.company_id;
    window.open(`http://219.249.140.29:28083/soms/page5/input?searchClicked=true&companyIndex=${company_id}`);
  }
}

// 비교모달 (사업장과 차량 화학성분 고농도/비율 기준 비교 결과 가시화)
class CompareModal extends Modal {
  constructor(modalId) {
    super(modalId);

    // // 방지시설예측 버튼 클릭이벤트 등록
    // document.querySelector("#prevention-button > button").addEventListener("click", this.preventionButtonEvent);
  }

  modal_init(base, commonRank) {
    const compareTable = document.getElementById("compareTable");
    this.carValueSortedData = base;
    this.placeValueCommonData = commonRank;
    this.makeCompareTablePlace("value", compareTable);
  }

  modal_init2(base, commonRank) {
    const compareTable = document.getElementById("compareTable2");
    this.carRatioSortedData = base;
    this.placeRatioCommonData = commonRank;
    this.makeCompareTablePlace("ratio", compareTable);
  }

  makeCompareTablePlace(mode, table) {
    const thead = table.getElementsByTagName("thead")[0];
    const tbody = table.getElementsByTagName("tbody")[0];

    if (mode === "value") {
      thead.innerHTML = `
            <tr>
                <th></th><th>사업장 명</th>
                <th><select id="1th-company-${mode}"></select></th>
                <th><select id="2th-company-${mode}"></select></th>
                <th><select id="3th-company-${mode}"></select></th>
            </tr>
            <tr>
                <th>물질명</th><th>농도</th>
                <th></th><th>일치여부</th><th></th>
            </tr>
        `;

      if (this.placeValueCommonData.length > 0) {
        for (let i = 1; i <= this.placeValueCommonData.length && i <= 3; i++) {
          this.makeTitleSelection(i);
        }
        this.attachEventHandlers();
      }
    }
    else if(mode === "ratio"){
      thead.innerHTML = `
      <tr>
      <th>물질명</th><th>비율</th><th></th><th>일치여부</th><th></th>
</tr>
`
    }
    // 바디는 항상 출력
    tbody.innerHTML = this.generateCommonChemicalRows(mode, 10);
  }


  makeSelectOptions(index) {
    if (!this.placeValueCommonData || this.placeValueCommonData.length === 0) {
      return `<option value="-1">-</option>`;
    }

    return this.placeValueCommonData
        .map((data, idx) => {
          const selected = idx === index ? "selected" : "";
          return `<option value="${idx}" ${selected}>${data.title}</option>`;
        })
        .join("");
  }

  attachEventHandlers() {
    $(`#1th-company-value`).off("change").on("change", () => this.updateTable());
    $(`#2th-company-value`).off("change").on("change", () => this.updateTable());
    $(`#3th-company-value`).off("change").on("change", () => this.updateTable());
  }

  updateTable() {
    const table1 = document.getElementById("compareTable");
    const tbody1 = table1.getElementsByTagName("tbody")[0];
    tbody1.innerHTML = this.generateCommonChemicalRows("value", 10);

    const table2 = document.getElementById("compareTable2");
    const tbody2 = table2.getElementsByTagName("tbody")[0];
    tbody2.innerHTML = this.generateCommonChemicalRows("ratio", 10);
  }

  generateCommonChemicalRows(mode, limit) {
    let html = "";

    let data = mode === "ratio" ? this.carRatioSortedData : this.carValueSortedData;
    let commonRank = mode === "ratio" ? this.placeRatioCommonData : this.placeValueCommonData;

    if (!data) data = [];
    if (!commonRank) commonRank = [];

    // 💡 기본적으로 index1~3는 -1로 설정 (회사 데이터 없을 때 대비)
    let index1 = -1, index2 = -1, index3 = -1;

    if (commonRank.length > 0) {
      const getIndexValue = (id) => {
        const el = document.getElementById(id);
        return el ? parseInt(el.value) : -1;
      };
      index1 = getIndexValue("1th-company-value");
      index2 = getIndexValue("2th-company-value");
      index3 = getIndexValue("3th-company-value");
    }

    const getMatchingMark = (index, chemicalName) => {
      if (
          index === -1 ||
          !commonRank[index] ||
          !commonRank[index].commonObject ||
          !Array.isArray(commonRank[index].commonObject)
      ) return "X";

      return commonRank[index].commonObject.some(
          (common) => common?.chemicalName?.trim().toLowerCase() === chemicalName?.trim().toLowerCase()
      ) ? "O" : "X";
    };

    for (let i = 0; i < limit; i++) {
      const chemicalName = data[i]?.chemicalName || "-";
      let value = mode === "value"
          ? (data[i]?.chemicalValue?.toFixed(1) || "-")
          : (data[i]?.relativeRatio?.toFixed(1) || "-");

      // 기업 데이터가 없으면 무조건 X 표시
      const match1 = getMatchingMark(index1, chemicalName);
      const match2 = getMatchingMark(index2, chemicalName);
      const match3 = getMatchingMark(index3, chemicalName);

      html += `
    <tr>
      <td>${chemicalName}</td>
      <td>${value}</td>
      <td>${match1}</td>
      <td>${match2}</td>
      <td>${match3}</td>
    </tr>`;
    };


    return html;
  }



}
