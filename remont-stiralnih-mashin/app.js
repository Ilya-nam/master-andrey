const accordions = document.querySelectorAll('.accordion')

accordions.forEach(button => {
	button.addEventListener('click', function () {
		this.classList.toggle('active')

		const panel = this.nextElementSibling
		if (panel.style.maxHeight) {
			panel.style.maxHeight = null
		} else {
			panel.style.maxHeight = '400px'
		}

		const arrow = this.querySelector('.accordion__down')
		if (arrow) {
			arrow.classList.toggle('hidden')
		}
	})
})

let currentSlide = 0
const sliderWrapper = document.getElementById('sliderWrapper')
const totalSlides = sliderWrapper.children.length

function showSlide(index) {
	const offset = -index * 100
	sliderWrapper.style.transform = `translateX(${offset}%)`
	currentSlide = index
}

function nextSlide() {
	const nextIndex = (currentSlide + 1) % totalSlides
	showSlide(nextIndex)
}

function prevSlide() {
	const prevIndex = (currentSlide - 1 + totalSlides) % totalSlides
	showSlide(prevIndex)
}

setInterval(nextSlide, 5000)

showSlide(currentSlide)

function showPopup() {
	document.getElementById('promoPopup').classList.add('active')
}

function closePopup() {
	document.getElementById('promoPopup').classList.remove('active')
}

function submitPromoForm(event) {
	event.preventDefault()
	const form = event.target
	const name = form.name.value
	const phone = form.phone.value

	alert(`Спасибо, ${name}! Мы свяжемся с вами по телефону: ${phone}`)
	closePopup()
}

window.addEventListener('load', () => {
	setTimeout(showPopup, 20000)
})

document.querySelectorAll('input[type="tel"]').forEach(input => {
	input.addEventListener('input', function () {
		let numbers = this.value.replace(/\D/g, '')

		if (numbers.startsWith('8')) {
			numbers = '7' + numbers.slice(1)
		}
		if (!numbers.startsWith('7')) {
			numbers = '7' + numbers
		}

		let formatted = '+7 '

		if (numbers.length > 1) {
			formatted += '(' + numbers.substring(1, 4)
		}
		if (numbers.length >= 4) {
			formatted += ') ' + numbers.substring(4, 7)
		}
		if (numbers.length >= 7) {
			formatted += '-' + numbers.substring(7, 9)
		}
		if (numbers.length >= 9) {
			formatted += '-' + numbers.substring(9, 11)
		}

		this.value = formatted
	})
})

function showFormMessage(text, type = 'success') {
	// Удаляем старый блок, если есть
	const oldMessage = document.querySelector('.services__form__message')
	if (oldMessage) oldMessage.remove()

	// Создаем новый блок
	const messageBox = document.createElement('div')
	messageBox.className = 'services__form__message ' + type
	messageBox.textContent = text

	document.body.prepend(messageBox)

	setTimeout(() => {
		messageBox.remove()
	}, 4000)
}

let utmDataString = ''

function collectUTMData() {
	const urlParams = new URLSearchParams(window.location.search)
	const allowedKeys = [
		'utm_source',
		'utm_medium',
		'utm_term',
		'utm_content',
		'utm_group',
		'clientID',
		'yclid',
	]
	const parts = []

	urlParams.forEach((value, key) => {
		if (allowedKeys.includes(key)) {
			parts.push(`${key}=${encodeURIComponent(value)}`)
		}
	})

	utmDataString = parts.join('&')
}

window.addEventListener('DOMContentLoaded', collectUTMData)

let yandexSearchQuery = null

function getYandexSearchQuery() {
	try {
		const ref = document.referrer
		if (!ref) return null

		const refUrl = new URL(ref)
		if (refUrl.hostname.includes('yandex.')) {
			return refUrl.searchParams.get('text')
		}
	} catch (e) {
		return null
	}
	return null
}

window.addEventListener('DOMContentLoaded', () => {
	yandexSearchQuery = getYandexSearchQuery()
})

function getUTMTerm(utmString) {
	const params = new URLSearchParams(utmString)
	const utmTerm = params.get('utm_term')
	return utmTerm ? decodeURIComponent(utmTerm) : null
}

function getUTMGroup(utmString) {
	const params = new URLSearchParams(utmString)
	const utmGroup = params.get('utm_group')
	return utmGroup ? decodeURIComponent(utmGroup) : null
}

const spamNumbers = [
	'1234567',
	'2345678',
	'3456789',
	'4567890',
	'7654321',
	'8765432',
	'9876543',
	'0987654',
	'0001111',
	'0000011',
	'0000001',
	'9999990',
	'9999991',
	'9999992',
	'9999993',
	'9999994',
	'9999995',
	'9999996',
	'9999997',
	'9999998',
]

function isBlockedNumber(phoneNumber) {
	const digits = phoneNumber.replace(/\D/g, '')

	if (digits.length !== 11 || !digits.startsWith('7')) {
		return false
	}

	const sevenDigits = digits.slice(4)

	return spamNumbers.includes(sevenDigits)
}

function isSpamNumber(phone) {
	const match = phone.match(/\+7\s*\((\d{3})\)\s*(\d{3})-(\d{2})-(\d{2})/)
	if (!match) return true

	const [_, prefix, part1, part2, part3] = match

	const numberDigits = (part1 + part2 + part3).replace(/\D/g, '')

	if (/^(\d)\1+$/.test(numberDigits)) return true

	return false
}

function canSendLead() {
	let leadsSent = parseInt(localStorage.getItem('leads_sent') || '0')
	return leadsSent < 2
}

function getYandexClientID(counterId) {
	// 1. Попытка через cookie _ym_uid
	function getFromCookie() {
		const cookies = document.cookie.split(';')
		for (let cookie of cookies) {
			cookie = cookie.trim()
			if (cookie.startsWith('_ym_uid=')) {
				return cookie.substring('_ym_uid='.length)
			}
		}
		return null
	}

	function getFromAPI() {
		try {
			if (window.Ya && window.Ya.Metrika2 && window.Ya.Metrika2[counterId]) {
				return window.Ya.Metrika2[counterId].getClientID()
			}
			if (window.Ya && window.Ya.Metrika && window.Ya.Metrika[counterId]) {
				return window.Ya.Metrika[counterId].getClientID()
			}
		} catch (e) {
			// игнорируем ошибки
		}
		return null
	}

	// 3. Попытка через cookie yandexuid (если надо)
	function getFromYandexUidCookie() {
		const cookies = document.cookie.split(';')
		for (let cookie of cookies) {
			cookie = cookie.trim()
			if (cookie.startsWith('yandexuid=')) {
				return cookie.substring('yandexuid='.length)
			}
		}
		return null
	}

	// Попытки получить clientID по очереди
	let clientID = getFromAPI()
	if (clientID) return clientID

	clientID = getFromCookie()
	if (clientID) return clientID

	clientID = getFromYandexUidCookie()
	if (clientID) return clientID

	return null
}

const counterId = 103207586

function getVladivostokTime() {
	const now = new Date()
	return now.toLocaleTimeString('ru-RU', {
		timeZone: 'Asia/Vladivostok',
		hour12: false,
		hour: '2-digit',
		minute: '2-digit',
		second: '2-digit',
	})
}

function sendToTelegram(message) {
	const token = '8062161096:AAHIi5xcvoaoYPukNEZAnfH9Ksld4PsrOwE'
	const chatId = '6878078718'
	const url = `https://api.telegram.org/bot${token}/sendMessage`

	fetch(url, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
		},
		body: JSON.stringify({
			chat_id: chatId,
			text: message,
			parse_mode: 'HTML',
		}),
	}).catch(error => {
		console.error('Ошибка отправки в Telegram:', error)
	})
}

function handleCallClick() {
	const clientID = getYandexClientID(counterId) || 'clientID отсутствует'
	const vdkTime = getVladivostokTime()
	const message = `📞 Клиент нажал "Позвонить" Ремонт СМ\n🕒 Время (ВДК): ${vdkTime}\n🆔 clientID: ${clientID}\nМС: Андрей Валерьевич БТ\nЗапрос: ${
		yandexSearchQuery || getUTMTerm(utmDataString)
	}\nГруппа: ${getUTMGroup(utmDataString)}\nUTM: ${utmDataString}`
	sendToTelegram(message)
}

document
	.getElementById('action__form')
	.addEventListener('submit', async function (e) {
		e.preventDefault()

		const name = document.getElementById('action__name').value.trim()
		const phone = document.getElementById('action__tel').value.trim()
		const desc = document.getElementById('action__desc').value.trim()

		if (!phone.startsWith('+7 (9')) {
			showFormMessage(
				'Номер должен начинаться с +7 (9. Рекомендуем позвонить нам по телефону',
				'error'
			)
			return
		}

		if (!canSendLead()) {
			showFormMessage(
				'Ваша заявка уже обрабатывается, ожидайте или позвоните нам по телефону',
				'error'
			)
			return
		}

		if (isSpamNumber(phone)) {
			showFormMessage(
				'Недопустимый номер телефона. Рекомендуем позвонить нам по телефону',
				'error'
			)
			return
		}

		if (isBlockedNumber(phone)) {
			showFormMessage(
				'Этот номер не может отправить заявку. Рекомендуем позвонить нам по телефону',
				'error'
			)
			return
		}

		const vdkTime = getVladivostokTime()
		const clientID = getYandexClientID(counterId) || 'clientID отсутствует'

		const leadData = {
			branch_id: 0,
			direction_id: 5,
			phones: [phone],
			name: name,
			description:
				'Описание от клиента:\n' +
				desc +
				`\nЗаявка с сайта частный мастер Андрей Валерьевич\nРемонт стиральных машин\n Город не известен УТОЧНИТЬ\nИнформация о клиенте:\nclientID: ${clientID}\nГруппа: ${getUTMGroup(
					utmDataString
				)}\nЗапрос: ${
					yandexSearchQuery || getUTMTerm(utmDataString)
				}\nВремя отправки ВДК: ${vdkTime}\n UTM: ${utmDataString}`,
			is_pm: true,
		}

		try {
			const response = await fetch(
				'https://newapi.ru/lead?source=partner&idp=93a55e81-9a72-bc7a-b83ed65ada73756e',
				{
					method: 'POST',
					headers: {
						'Content-Type': 'application/json',
					},
					body: JSON.stringify(leadData),
				}
			)

			if (response.status === 204) {
				showFormMessage('Спасибо! Ваша заявка успешно отправлена.', 'success')
				e.target.reset()
				let leadsSent = parseInt(localStorage.getItem('leads_sent') || '0')
				localStorage.setItem('leads_sent', leadsSent + 1)
				ym(103207586, 'reachGoal', 'tv_lead')
				sendToTelegram(leadData.description)
			} else if (response.status === 202) {
				showFormMessage('Заявка уже была отправлена ранее.', 'info')
			} else {
				const result = await response.text()
				showFormMessage('Ошибка: ' + result, 'error')
			}
		} catch (err) {
			showFormMessage('Ошибка соединения. Повторите позже.', 'error')
			console.error(err)
		}
	})

document
	.getElementById('popup__form')
	.addEventListener('submit', async function (e) {
		e.preventDefault()

		const name = document.getElementById('popup__name').value.trim()
		const phone = document.getElementById('popup__tel').value.trim()

		if (!phone.startsWith('+7 (9')) {
			showFormMessage(
				'Номер должен начинаться с +7 (9. Рекомендуем позвонить нам по телефону',
				'error'
			)
			return
		}

		if (!canSendLead()) {
			showFormMessage(
				'Ваша заявка уже обрабатывается, ожидайте или позвоните нам по телефону',
				'error'
			)
			return
		}

		if (isSpamNumber(phone)) {
			showFormMessage(
				'Недопустимый номер телефона. Рекомендуем позвонить нам по телефону',
				'error'
			)
			return
		}

		if (isBlockedNumber(phone)) {
			showFormMessage(
				'Этот номер не может отправить заявку. Рекомендуем позвонить нам по телефону',
				'error'
			)
			return
		}

		const vdkTime = getVladivostokTime()
		const clientID = getYandexClientID(counterId) || 'clientID отсутствует'

		const data = {
			phones: [phone],
			name: name,
			description: `Описание от клиента:\nБез описания\nЗаявка с сайта частный мастер Андрей Валерьевич\nРемонт стиральных машин\n Город не известен УТОЧНИТЬ\nИнформация о клиенте\nclientID: ${clientID}\nГруппа: ${getUTMGroup(
				utmDataString
			)}\nЗапрос: ${
				yandexSearchQuery || getUTMTerm(utmDataString)
			}\nВремя ВДК: ${vdkTime}\n UTM: ${utmDataString}\n`,
			branch_id: 0,
			direction_id: 5,
			is_pm: true,
		}

		try {
			const response = await fetch(
				'https://newapi.ru/lead?source=partner&idp=93a55e81-9a72-bc7a-b83ed65ada73756e',
				{
					method: 'POST',
					headers: {
						'Content-Type': 'application/json',
					},
					body: JSON.stringify(data),
				}
			)

			if (response.status === 204 || response.status === 202) {
				showFormMessage('Спасибо! Ваша заявка успешно отправлена.', 'success')
				e.target.reset()

				let leadsSent = parseInt(localStorage.getItem('leads_sent') || '0')
				localStorage.setItem('leads_sent', leadsSent + 1)
				ym(103207586, 'reachGoal', 'tv_lead')
				sendToTelegram(data.description)
			} else {
				const result = await response.text()
				showFormMessage('Ошибка: ' + (result || 'Попробуйте позже'), 'error')
			}
		} catch (err) {
			showFormMessage('Ошибка соединения. Повторите позже.', 'error')
			console.error(err)
		}
	})
