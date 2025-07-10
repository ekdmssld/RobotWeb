$(document).ready(function () {
	notifications = document.querySelector('.notifications');
});

var notifications;
// Object containing details for different types of toasts
const toastDetails = {
	timer: 6000,
	success: {
		icon: 'fa-circle-check',
	},
	error: {
		icon: 'fa-circle-xmark',
	},
	warning: {
		icon: 'fa-triangle-exclamation',
	},
	info: {
		icon: 'fa-circle-info',
	},
};

const removeToast = (toast) => {
	toast.classList.add('hide');
	if (toast.timeoutId) clearTimeout(toast.timeoutId); // Clearing the timeout for the toast
	setTimeout(() => toast.remove(), 6000); // Removing the toast after 500ms
};

const createToast = (id, text) => {
	// Getting the icon and text for the toast based on the id passed
	const { icon } = toastDetails[id];
	const toast = document.createElement('li'); // Creating a new 'li' element for the toast
	toast.className = `toast ${id}`; // Setting the classes for the toast
	// Setting the inner HTML for the toast
	toast.innerHTML = `<div class="column">
                         <i class="fa-solid ${icon}"></i>
                         <span>${text}</span>
                      </div>
                      <i class="fa-solid fa-xmark" onclick="removeToast(this.parentElement)"></i>`;
	notifications.appendChild(toast); // Append the toast to the notification ul
	// Setting a timeout to remove the toast after the specified duration
	toast.timeoutId = setTimeout(() => removeToast(toast), toastDetails.timer);
};
function showToast(message, duration = 3000) {
	const toast = document.createElement('div');
	toast.className = 'toast';
	toast.textContent = message;
	document.querySelector('.notifications').appendChild(toast);

	setTimeout(() => {
		toast.remove();
	}, duration);
}
