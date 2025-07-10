// 페이지를 이동하고 버튼의 활성화 상태를 관리하는 함수
function navigateTo(url, button) {
    // 모든 버튼에서 'active' 클래스 제거
    const buttons = document.querySelectorAll('.button');
    buttons.forEach(btn => btn.classList.remove('active'));

    // 클릭된 버튼에 'active' 클래스 추가
    button.classList.add('active');

    // 페이지 이동
    window.location.href = url;
}

    window.addEventListener("DOMContentLoaded", () => {
    const currentPath = window.location.pathname;
    if (currentPath.startsWith("/arims/robot")) {
    document.getElementById("nav-robot")?.classList.add("active");
}
});

