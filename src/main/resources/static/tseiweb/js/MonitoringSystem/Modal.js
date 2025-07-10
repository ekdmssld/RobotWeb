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

    // 초기 위치 변경
    // if (this.modalId == "compareModal") {
    //   this.modal.style.left = "60%";
    //   this.modal.style.top = "17%";
    // }else {
    //   this.modal.style.left = "20%";
    //   this.modal.style.top = "17%";
    // }
    if (this.modalId == "compareModal") {
      this.modal.style.left = "72%";
      this.modal.style.top = "50%";
    }else {
      this.modal.style.left = "72%";
      this.modal.style.top = "2%";
    }

    // 모달 on/off 버튼이 on일때만 보이도록하기
    const checkbox = document.getElementById("marker_hidden_slide");
    if (checkbox.checked) {
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
  }

  // 고농도 테이블 태그 생성 및 데이터 세팅
  modal_init(base, commonRank) {
    const compareTable = document.getElementById("compareTable");
    this.carValueSortedData = base; // 농도 기준 정렬된 차량 데이터
    this.placeValueCommonData = commonRank; // 장소 데이터 중 차량 데이터와 일치하는 데이터
    this.makeCompareTablePlace("value", compareTable);
  }

  // 비율 테이블 태그 생성 및 데이터 세팅
  modal_init2(base, commonRank) {
    const compareTable = document.getElementById("compareTable2");
    this.carRatioSortedData = base; // 비율 기준 정렬된 차량 데이터
    this.placeRatioCommonData = commonRank; // 장소 데이터 중 차량 데이터와 일치하는 데이터
    this.makeCompareTablePlace("ratio", compareTable);
  }


  // 비교 모달의 농도 혹은 비율 테이블의 헤더와 이벤트를 설정하고 바디를 만듬
  makeCompareTablePlace(mode, table) {
    const thead = table.getElementsByTagName("thead")[0];
    const tbody = table.getElementsByTagName("tbody")[0];

    // 농도 테이블 헤더 만들기
    if (mode == "value") {
      thead.innerHTML = `
            <tr>
                <th width="120px"></th>
                <th width="101px">사업장 명</th>
                <th width="130px"style="padding:0px"><select style="width: 115px;" id="1th-company-${mode}"></select></th>
                <th width="130px"style="padding:0px"><select style="width: 115px;" id="2th-company-${mode}"></select></th>
                <th width="130px"style="padding:0px"><select style="width: 115px;" id="3th-company-${mode}"></select></th>
            </tr>
            <tr>
                <th width="120px">물질명</th>
                <th width="101px">농도</th>
                <th width="125px"></th>
                <th width="125px">일치여부</th>
                <th width="125px"></th>
            </tr>

            `;
      for(var i=1; i<= this.placeValueCommonData.length && i <= 3 ; i++){
        // 각 select에 데이터 넣기
        this.makeTitleSelection(i);
      }
      // select에 이벤트 등록하기
      this.attachEventHandlers();
    }
    // 비율 테이블 헤더 만들기 
    else {
      thead.innerHTML = `
            <tr>
                <th width="120px">물질명</th>
                <th width="101px">비율</th>
                <th width="130px"></th>
                <th width="130px">일치여부</th>
                <th width="130px"></th>
            </tr>

            `;
    }

    //바디 만들기
    tbody.innerHTML = this.generateCommonChemicalRows(mode, 10);
  }

  // 이벤트 핸들러 일괄적으로 등록하기
  attachEventHandlers() {
    $(`#1th-company-value`)
      .off("change")
      .on("change", () => this.updateTable());
    $(`#2th-company-value`)
      .off("change")
      .on("change", () => this.updateTable());
    $(`#3th-company-value`)
      .off("change")
      .on("change", () => this.updateTable());
  }

  // select 기업 변경시 이벤트
  updateTable() {
    var table = document.getElementById("compareTable");
    var tbody = table.getElementsByTagName("tbody")[0];
    tbody.innerHTML = this.generateCommonChemicalRows("value", 10);

    var table = document.getElementById("compareTable2");
    var tbody = table.getElementsByTagName("tbody")[0];
    tbody.innerHTML = this.generateCommonChemicalRows("ratio", 10);
  }

  // select에 부채꼴내 기업 데이터 넣기
  makeTitleSelection(index) {
    const select = document.getElementById(index + "th-company-value");

    let commonRank = this.placeValueCommonData;

    select.innerHTML = "";

    commonRank.forEach((data, forindex) => {
      const option = document.createElement("option");
      option.text = data.title;
      option.value = forindex;
      if (forindex === index - 1) {
        option.selected = true;
      }
      select.appendChild(option);
    });
  }

  // 농도/비율 테이블 바디 생성
  generateCommonChemicalRows(mode, limit) {
    let html = "";

    let data, commonRank;
    if (mode === "ratio") {
      data = this.carRatioSortedData;
      commonRank = this.placeRatioCommonData;
    } else {
      data = this.carValueSortedData;
      commonRank = this.placeValueCommonData;
    }

    console.log("모달 계산 실행");
    console.log("data", data);

    const index1 = document.getElementById("1th-company-value").value;
    const index2 = document.getElementById("2th-company-value").value;
    const index3 = document.getElementById("3th-company-value").value;

    for (let i = 0; i < limit; i++) {
      const chemicalName = data[i]?.chemicalName || "-";
      let metchingdata;

      if (mode == "value") {
        metchingdata = data[i]?.chemicalValue.toFixed(1) || "-";
      } else {
        metchingdata = data[i]?.relativeRatio.toFixed(1) || "-";
      }
      let metchingTrue1 = "X";
      let metchingTrue2 = "X";
      let metchingTrue3 = "X";

      if (chemicalName !== "-") {
        for (const common of commonRank[index1]?.commonObject || []) {
          if (common?.chemicalName === data[i]?.chemicalName) {
            metchingTrue1 = "O";
            break;
          }
        }
        for (const common of commonRank[index2]?.commonObject || []) {
          if (common?.chemicalName === data[i]?.chemicalName) {
            metchingTrue2 = "O";
            break;
          }
        }
        for (const common of commonRank[index3]?.commonObject || []) {
          if (common?.chemicalName === data[i]?.chemicalName) {
            metchingTrue3 = "O";
            break;
          }
        }
      }

      html += `<tr><td width='80px'>${chemicalName}</td> <td width='81px'>${metchingdata}</td> <td  width='150px'>${metchingTrue1}</td><td  width='150px'>${metchingTrue2}</td><td width='150px'>${metchingTrue3}</td></tr>`;
    }

    return html;
  }
}
