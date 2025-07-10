
function activateTab(link) {
    // 모든 탭에서 'active' 클래스 제거
    const tabs = document.querySelectorAll('.tab');
    tabs.forEach(tab => tab.classList.remove('active'));

    // 클릭된 탭에 'active' 클래스 추가
    link.parentElement.classList.add('active');
}