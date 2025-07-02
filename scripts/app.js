const accordions = document.querySelectorAll('.accordion')

accordions.forEach(button => {
	button.addEventListener('click', function () {
		// Переключение класса активности
		this.classList.toggle('active')

		// Найти соответствующий panel
		const panel = this.nextElementSibling
		if (panel.style.maxHeight) {
			panel.style.maxHeight = null
		} else {
			panel.style.maxHeight = panel.scrollHeight + 'px'
		}

		// Скрыть или показать стрелку ▼
		const arrow = this.querySelector('.accordion__down')
		if (arrow) {
			arrow.classList.toggle('hidden')
		}
	})
})
