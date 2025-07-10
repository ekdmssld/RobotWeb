class RobotModal {
    constructor(modalId) {
        this.modal = document.getElementById(modalId);
        this.modalText = document.getElementById("modalText");
        this.integratedTable = document.getElementById("integratedTable");

        this.dragging = false;
        this.startX = 0;
        this.startY = 0;
        this.offsetLeft = 0;
        this.offsetTop = 0;

        // 드래그 이벤트 전체 영역에 바인딩
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
            <tr>
                <th>PPM</th>
            </tr>
        `;

        const rows = data.map(row => `
            <tr>
                <td>${row.ppmRefGo ?? '-'}</td>
            </tr>
        `).join("");

        tbody.innerHTML = rows;
    }
}

window.RobotModal = RobotModal;
