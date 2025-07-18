// 현재 클릭된 차량(web.customMap.onCar)
var runtimeCar;

// 좌측 메뉴 데이터 초기화
function clearTableText() {
  // 좌표(위도/경도) 및 측정일시 초기화
  document.getElementById("leftLatLng").innerText = "-";
  document.getElementById("leftTime").innerText = "-";

  // 악취 테이블 초기화
  document.getElementById("odorkind").innerText = "-";
  document.getElementById("odorstrength").innerText = "-";
  document.getElementById("winddir").innerText = "-";

  fillMatchingPlaceTable([])
  fillInRadiusTable([])
  

  var nameCells = document.querySelectorAll(
    "#predict_result_table .result_place"
  );
  var sumCells = document.querySelectorAll(
    "#predict_result_table .result_sum"
  );
  var rankCells = document.querySelectorAll(
    "#predict_result_table .result_rank"
  );


  // 최대 3개의 객체에서 title을 가져와 셀에 삽입합니다.
  for (var i = 0; i < nameCells.length; i++) {
    nameCells[i].innerText = ".";
  }

  // 최대 3개의 객체에서 title을 가져와 셀에 삽입합니다.
  for (var i = 0; i < rankCells.length; i++) {
    rankCells[i].innerText = ".";
  }

  // 최대 3개의 객체에서 title을 가져와 셀에 삽입합니다.
  for (var i = 0; i < sumCells.length; i++) {
    sumCells[i].innerText = ".";
  }

  

  var angleButtons = document.querySelectorAll('input[name="radius2"]');
  var radiusButtons = document.querySelectorAll('input[name="radius"]');

  angleButtons.forEach(function (button) {
    button.checked = false;
  });

  radiusButtons.forEach(function (button) {
    button.checked = false;
  });
}

function fillOdorPrediction(predictionResult) {
  const kind = predictionResult?.[0]?.pred_smell_kind ?? "-";
  const strength = predictionResult?.[1]?.pred_smell_strength?.toFixed(1) ?? "-";

  document.getElementById("odorkind").innerText = kind;
  document.getElementById("odorstrength").innerText = strength;
}

function fillWeatherInfo(data) {
  if (!data) return;
  document.getElementById("leftTemp").innerText = data.wdTemp !== undefined ? `${data.wdTemp} ℃` : "-";
  document.getElementById("leftHumi").innerText = data.wdHumi !== undefined ? `${data.wdHumi} %` : "-";
  document.getElementById("leftWind").innerText = data.wdWds !== undefined ? `${data.wdWds} m/s` : "-";
  document.getElementById("winddir").innerText = data.wdWdd !== undefined ? `${data.wdWdd} °` : "-";
}

// 반경 내 사업장 데이터 채우기
function fillInRadiusTable(objects) {
// 테이블을 가져옵니다.
var table = document.querySelector("#odor_correct_table");

// 기존 thead를 제거합니다.
var existingThead = table.querySelector('thead');
if (existingThead) {
  table.removeChild(existingThead);
}

// 새로운 thead 요소를 만듭니다.
var thead = document.createElement('thead');

// 첫 번째 tr 요소와 td 요소를 만듭니다.
var tr1 = document.createElement('tr');
var td1 = document.createElement('td');
td1.setAttribute('style', 'width: 10%; padding-top: 4px; padding-bottom: 4px; border: 1px solid #30497d; background-color: #1f2f63;');
td1.setAttribute('rowspan', Math.max(objects.length, 3)+1);
td1.innerText = '사업장 명';
tr1.appendChild(td1);
thead.appendChild(tr1);

// 나머지 tr과 td 요소를 만듭니다.
for (var i = 0; i < Math.max(objects.length, 3); i++) {
  var tr = document.createElement('tr');
  var td = document.createElement('td');
  td.className = 'inRadius';
  td.setAttribute('style', 'width: 25%; border: 1px solid #30497d');
  td.innerText = objects[i] ? objects[i].title : '.'; // 객체가 존재하면 title, 아니면 '.'을 설정합니다.
  tr.appendChild(td);
  thead.appendChild(tr);
}

// 테이블에 thead를 추가합니다.
table.appendChild(thead);
  (window.web || window.webRobot).addClickInRadiusEvent();
}


function fillMatchingPlaceTable(objects) {
  // 테이블을 가져옵니다.
var table = document.querySelector("#wind_odor_correct_table");

// 기존 thead를 제거합니다.
var existingThead = table.querySelector('thead');
if (existingThead) {
  table.removeChild(existingThead);
}

// 새로운 thead 요소를 만듭니다.
var thead = document.createElement('thead');

// 첫 번째 tr 요소와 td 요소를 만듭니다.
var tr1 = document.createElement('tr');
var td1 = document.createElement('td');
td1.setAttribute('style', 'width: 10%; padding-top: 4px; padding-bottom: 4px; border: 1px solid #30497d; background-color: #1f2f63;');
td1.setAttribute('rowspan', Math.max(objects.length, 3)+1);
td1.innerText = '사업장 명';
tr1.appendChild(td1);
thead.appendChild(tr1);

// 나머지 tr과 td 요소를 만듭니다.
for (var i = 0; i < Math.max(objects.length, 3); i++) {
  var tr = document.createElement('tr');
  var td = document.createElement('td');
  td.className = 'matching';
  td.setAttribute('style', 'width: 25%; border: 1px solid #30497d');
  td.innerText = objects[i] ? objects[i].title : '.'; // 객체가 존재하면 title, 아니면 '.'을 설정합니다.
  tr.appendChild(td);
  thead.appendChild(tr);
}

// 테이블에 thead를 추가합니다.
table.appendChild(thead);
  (window.web || window.webRobot).addClickMatchingEvent()
}


// 악취 원인 사업장 예측 테이블 채우기
function fillPredictResultTable(objects){
  var nameCells = document.querySelectorAll(
    "#predict_result_table .result_place"
  );
  var sumCells = document.querySelectorAll(
    "#predict_result_table .result_sum"
  );
  var rankCells = document.querySelectorAll(
    "#predict_result_table .result_rank"
  );


  // 최대 3개의 객체에서 title을 가져와 셀에 삽입합니다.
  for (var i = 0; i < Math.min(objects.length, 3); i++) {
    nameCells[i].innerText = objects[i].title;
  }

  // 최대 3개의 객체에서 title을 가져와 셀에 삽입합니다.
  for (var i = 0; i < Math.min(objects.length, 3); i++) {
    rankCells[i].innerText = objects[i].rank;
  }

  // 최대 3개의 객체에서 title을 가져와 셀에 삽입합니다.
  for (var i = 0; i < Math.min(objects.length, 3); i++) {
    sumCells[i].innerText = objects[i].relativeRatioSum.toFixed(1);
  }

}

// 위도 경도, 측정 일시 채우기
function fillCoordinateTable(latitude, longitude, datetime) {
  document.getElementById("leftLatLng").innerText =
    latitude + " / " + longitude;
  document.getElementById("leftTime").innerText = datetime;
}

// 악취 종류 채우기
function fillOdorTable(kind, strength) {
  document.getElementById("odorkind").innerText = kind;
  document.getElementById("odorstrength").innerText = strength;
}

// 풍향 채우기
function fillOdorDirection(direction) {
  document.getElementById("winddir").innerText = direction;
}

// 클릭된 차량 객체의 radius와 angle을 통해 기본 반경, 너비 조정 인터페이스를 채움
function setRadioButtons(car) {
  runtimeCar = car;

  var angle = convertToButtonValue("angle", runtimeCar.angle);
  var radius = convertToButtonValue("radius", runtimeCar.radius);
  var angleButtons = document.querySelectorAll('input[name="radius2"]');
  var radiusButtons = document.querySelectorAll('input[name="radius"]');

  // 각도에 해당하는 라디오 버튼을 찾아 체크합니다.
  angleButtons.forEach(function (button) {
    if (parseInt(button.value) === angle) {
      button.checked = true;
    } else {
      button.checked = false;
    }
  });

  // 반경에 해당하는 라디오 버튼을 찾아 체크합니다.
  radiusButtons.forEach(function (button) {
    if (parseInt(button.value) === radius) {
      button.checked = true;
    } else {
      button.checked = false;
    }
  });
}

// 반경을 변경시 생기는 이벤트
function changeRadius(radius) {
  clearTableText()
  runtimeCar.radius = radius;
  runtimeCar.checkmarker_event_start();
}

// 너비를 변경할시 생기는 이벤트
function changeAngle(angle) {
  runtimeCar.angle = angle;
  clearTableText()
  runtimeCar.checkmarker_event_start();
}


// 반경 및 부채꼴 너비 값을 범주형 데이터로 변환
function convertToButtonValue(type, value) {
  if (type === "angle") {
    // 반경을를 버튼의 값으로 변환합니다.
    if (value >= 0 && value <= 30) {
      return 30;
    } else if (value > 30 && value <= 60) {
      return 60;
    } else if (value > 60 && value <= 90) {
      return 90;
    } else if (value > 90 && value <= 120) {
      return 120;
    } else {
      return 120; // 해당하는 범위가 없을 경우 null 반환
    }
  } else if (type === "radius") {
    // 반경을 버튼의 값으로 변환합니다.
    // 예를 들어, 반경이 0 ~ 5000 사이에 있을 때, 1000, 2000, 3000, 4000, 5000 값으로 변환합니다.
    if (value >= 0 && value <= 500) {
      return 500;
    } else if (value > 500 && value <= 1000) {
      return 1000;
    } else if (value > 1000 && value <= 2000) {
      return 2000;
    } else if (value > 2000 && value <= 3000) {
      return 3000;
    } else if (value > 3000 && value <= 4000) {
      return 4000;
    } else if (value > 4000 && value <= 5000) {
      return 5000;
    } else {
      return null; // 해당하는 범위가 없을 경우 null 반환
    }
  } else {
    return null; // 유효하지 않은 type일 경우 null 반환
  }
}

// 웹이 처음 실행될때 이벤트 등록하기
document.addEventListener("DOMContentLoaded", function () {
  //getWeather_Realtime();
  initClock();


  // 기본 반경 클릭시 이벤트
  document.querySelectorAll('input[name="radius"]').forEach((radio) => {
    radio.addEventListener("change", (event) => {
      console.log("반경 변경");
      if (runtimeCar) {
        changeRadius(event.target.value);
      }
    });
  });

  // 너비 변경시 이벤트
  document.querySelectorAll('input[name="radius2"]').forEach((radio) => {
    radio.addEventListener("change", (event) => {
      console.log("너비 변경");
      if (runtimeCar) {
        changeAngle(event.target.value);
      }
    });
  });
});


// 실시간 시계
function getTime() {
  let today = new Date();
  let year = today.getFullYear();
  let month = today.getMonth() + 1;
  if (month < 10) {
    month = "0" + month;
  }
  let date = today.getDate();
  if (date < 10) {
    date = "0" + date;
  }

  $("#nowDate").replaceWith(
    '<span id="nowDate">' + year + "-" + month + "-" + date + "</span>"
  );
  const time = new Date();
  const hour = time.getHours();
  const minutes = time.getMinutes();
  const seconds = time.getSeconds();

  if (minutes == "00" && seconds == "35") {
    createToast("info", hour + "시 정각입니다.");
  }
  $(".h1-clock").replaceWith(
    "<h1 class = h1-clock>" +
      `${hour < 10 ? `0${hour}` : hour}:${
        minutes < 10 ? `0${minutes}` : minutes
      }:${seconds < 10 ? `0${seconds}` : seconds}` +
      "</h1>"
  );
}

function initClock() {
  setInterval(getTime, 1000);
}

