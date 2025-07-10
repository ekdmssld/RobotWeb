class Loading {
  constructor(loadingId, processBarId) {
    this.loading = document.getElementById(loadingId);
    this.process_bar = document.getElementById(processBarId);
    this.loading_state = true;
  }

  // 로딩 키기
  loading_on() {
    this.loading_status = true;
    this.loading.style.display = "block";
  }

  // 로딩 끄기
  loading_off() {
    this.loading_status = false;
    this.loading.style.display = "none";
  }
}
