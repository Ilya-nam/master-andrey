const accordions = document.querySelectorAll('.accordion')

accordions.forEach(button => {
	button.addEventListener('click', function () {
		this.classList.toggle('active')

		const panel = this.nextElementSibling
		panel.style.maxHeight = panel.style.maxHeight
			? null
			: panel.scrollHeight + 'px'

		const arrow = this.querySelector('.accordion__down')
		if (arrow) {
			arrow.classList.toggle('hidden')
		}
	})
})

// =================== СЛАЙДЕР ===================
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

// =================== ПОПАП ===================
function showPopup() {
	document.getElementById('promoPopup').classList.add('active')
}

function closePopup() {
	document.getElementById('promoPopup').classList.remove('active')
}

window.addEventListener('load', () => {
	setTimeout(showPopup, 20000)
})

// =================== МАСКА ДЛЯ ТЕЛЕФОНА ===================
document.querySelectorAll('input[type="tel"]').forEach(input => {
	input.addEventListener('input', function () {
		let numbers = this.value.replace(/\D/g, '')

		if (numbers.startsWith('8')) numbers = '7' + numbers.slice(1)
		if (!numbers.startsWith('7')) numbers = '7' + numbers

		let formatted = '+7 '
		if (numbers.length > 1) formatted += '(' + numbers.substring(1, 4)
		if (numbers.length >= 4) formatted += ') ' + numbers.substring(4, 7)
		if (numbers.length >= 7) formatted += '-' + numbers.substring(7, 9)
		if (numbers.length >= 9) formatted += '-' + numbers.substring(9, 11)

		this.value = formatted
	})
})

// =================== СООБЩЕНИЯ ===================
function showFormMessage(text, type = 'success') {
	const oldMessage = document.querySelector('.services__form__message')
	if (oldMessage) oldMessage.remove()

	const messageBox = document.createElement('div')
	messageBox.className = 'services__form__message ' + type
	messageBox.textContent = text

	document.body.prepend(messageBox)

	setTimeout(() => {
		messageBox.remove()
	}, 4000)
}

// =================== UTM и ЯНДЕКС ===================
let utmDataString = ''
let yandexSearchQuery = null

function collectUTMData() {
	const urlParams = new URLSearchParams(window.location.search)
	const allowedKeys = [
		'utm_source',
		'utm_medium',
		'utm_term',
		'utm_content',
		'utm_group',
		'clientID',
		'utm_city_id',
		'yclid',
	]
	const parts = []

	urlParams.forEach((value, key) => {
		if (allowedKeys.includes(key) && value) {
			parts.push(`${key}=${encodeURIComponent(value)}`)
		}
	})

	if (parts.length > 0) {
		utmDataString = parts.join('&')
		localStorage.setItem('utmData', utmDataString)
	} else {
		const stored = localStorage.getItem('utmData')
		if (stored) utmDataString = stored
	}
}

function getYandexSearchQuery() {
	try {
		const ref = document.referrer
		if (ref) {
			const refUrl = new URL(ref)
			if (refUrl.hostname.includes('yandex.')) {
				const query = refUrl.searchParams.get('text')
				if (query) {
					yandexSearchQuery = query
					localStorage.setItem('yandexQuery', query)
					return query
				}
			}
		}
		const stored = localStorage.getItem('yandexQuery')
		if (stored) {
			yandexSearchQuery = stored
			return stored
		}
	} catch (e) {
		return null
	}
	return null
}

window.addEventListener('DOMContentLoaded', () => {
	collectUTMData()
	getYandexSearchQuery()
})

function getUTMTerm(utmString) {
	const params = new URLSearchParams(utmString)
	return params.get('utm_term')
		? decodeURIComponent(params.get('utm_term'))
		: null
}

function getUTMGroup(utmString) {
	const params = new URLSearchParams(utmString)
	return params.get('utm_group')
		? decodeURIComponent(params.get('utm_group'))
		: null
}

function getCityIdFromUTM(utmString, defaultCityId = 39) {
	const params = new URLSearchParams(utmString)
	const cityIdParam = params.get('utm_city_id')
	const cityId = parseInt(cityIdParam, 10)
	return Number.isInteger(cityId) && cityId > 0 ? cityId : defaultCityId
}

// =================== АНТИСПАМ ===================
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
	if (digits.length !== 11 || !digits.startsWith('7')) return false
	return spamNumbers.includes(digits.slice(4))
}

function isSpamNumber(phone) {
	const match = phone.match(/\+7\s*\((\d{3})\)\s*(\d{3})-(\d{2})-(\d{2})/)
	if (!match) return true
	const numberDigits = (match[2] + match[3] + match[4]).replace(/\D/g, '')
	return /^(\d)\1+$/.test(numberDigits)
}

// (оставляю твою старую логику на кол-во лидов)
function canSendLead() {
	return parseInt(localStorage.getItem('leads_sent') || '0') < 2
}

// === Новая логика: не чаще 1 раза в 15 минут (общий кулдаун на все формы) ===
const LEAD_COOLDOWN_MS = 15 * 60 * 1000

function isCooldownActive() {
	const last = parseInt(localStorage.getItem('lead_last_sent_at') || '0', 10)
	return last && Date.now() - last < LEAD_COOLDOWN_MS
}

function markLeadSentNow() {
	localStorage.setItem('lead_last_sent_at', Date.now().toString())
}

function getCooldownLeftText() {
	const last = parseInt(localStorage.getItem('lead_last_sent_at') || '0', 10)
	if (!last) return ''
	const leftMs = LEAD_COOLDOWN_MS - (Date.now() - last)
	if (leftMs <= 0) return ''
	const m = Math.floor(leftMs / 60000)
	const s = Math.floor((leftMs % 60000) / 1000)
	const mm = String(m).padStart(2, '0')
	const ss = String(s).padStart(2, '0')
	return `${mm}:${ss}`
}

// =================== ЯНДЕКС clientID ===================
function getYandexClientID(counterId) {
	function getFromCookie() {
		const cookies = document.cookie.split(';')
		for (let cookie of cookies) {
			cookie = cookie.trim()
			if (cookie.startsWith('_ym_uid='))
				return cookie.substring('_ym_uid='.length)
		}
		return null
	}
	function getFromAPI() {
		try {
			if (window.Ya?.Metrika2?.[counterId])
				return window.Ya.Metrika2[counterId].getClientID()
			if (window.Ya?.Metrika?.[counterId])
				return window.Ya.Metrika[counterId].getClientID()
		} catch {}
		return null
	}
	function getFromYandexUidCookie() {
		const cookies = document.cookie.split(';')
		for (let cookie of cookies) {
			cookie = cookie.trim()
			if (cookie.startsWith('yandexuid='))
				return cookie.substring('yandexuid='.length)
		}
		return null
	}
	return getFromAPI() || getFromCookie() || getFromYandexUidCookie() || null
}

const counterId = 103207586

// =================== ВРЕМЯ ===================
function getVladivostokTime() {
	const options = {
		year: 'numeric',
		month: '2-digit',
		day: '2-digit',
		hour: '2-digit',
		minute: '2-digit',
		second: '2-digit',
		hour12: false,
		timeZone: 'Asia/Vladivostok',
	}

	const formatter = new Intl.DateTimeFormat('ru-RU', options)
	const parts = formatter.formatToParts(new Date())

	const map = {}
	for (const part of parts) {
		map[part.type] = part.value
	}

	return `${map.day}.${map.month}.${map.year} ${map.hour}:${map.minute}:${map.second}`
}

// =================== TELEGRAM ===================
function sendToTelegram(message) {
	fetch('/api/send_telegram.php', {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			'X-Requested-With': 'XMLHttpRequest',
		},
		body: JSON.stringify({ message }),
	}).catch(error => console.error('Ошибка отправки в Telegram:', error))
}

// =================== ОБРАБОТКА ФОРМ ===================
async function handleFormSubmit(e, options) {
	e.preventDefault()

	const { formId, nameId, phoneId, descId, buttonId, buttonDefaultText } =
		options
	const name = document.getElementById(nameId).value.trim()
	const phone = document.getElementById(phoneId).value.trim()
	const desc = descId
		? document.getElementById(descId).value.trim()
		: 'без описания'
	const button = document.getElementById(buttonId)

	button.disabled = true
	button.textContent = 'Отправка...'

	// Валидация
	if (!phone.startsWith('+7 (9')) {
		showFormMessage(
			'Номер должен начинаться с +7 (9. Рекомендуем позвонить нам по телефону',
			'error'
		)
		button.disabled = false
		button.textContent = buttonDefaultText
		return
	}
	if (!canSendLead()) {
		showFormMessage(
			'Ваша заявка уже обрабатывается, ожидайте или позвоните нам по телефону',
			'error'
		)
		button.disabled = false
		button.textContent = buttonDefaultText
		return
	}
	// Проверка кулдауна 15 минут
	if (isCooldownActive()) {
		const left = getCooldownLeftText()
		showFormMessage(
			`Вы уже отправляли заявку. Повторить можно через ${left || '15:00'}.`,
			'error'
		)
		button.disabled = false
		button.textContent = buttonDefaultText
		return
	}
	if (isSpamNumber(phone)) {
		showFormMessage(
			'Недопустимый номер телефона. Рекомендуем позвонить нам по телефону',
			'error'
		)
		button.disabled = false
		button.textContent = buttonDefaultText
		return
	}
	if (isBlockedNumber(phone)) {
		showFormMessage(
			'Этот номер не может отправить заявку. Рекомендуем позвонить нам по телефону',
			'error'
		)
		button.disabled = false
		button.textContent = buttonDefaultText
		return
	}

	// Подготовка данных
	const vdkTime = getVladivostokTime()
	const cityID = getCityIdFromUTM(utmDataString)

	const data = {
		city_id: cityID,
		customer_phone: phone,
		customer_name: name,
		description: `✉️ ЛИД\n🌐 Сайт: АНДРЕЙ\n🗒 Описание от клиента: ${desc}\n🔎 Запрос: ${
			yandexSearchQuery || getUTMTerm(utmDataString)
		}\n⭐️ Группа: ${getUTMGroup(
			utmDataString
		)}\n📞 Номер телефона: ${phone}\nДата и время: ${vdkTime}\nCityID: ${cityID}\nClientID: ${getYandexClientID(
			counterId
		)}`,
		source_id: 815,
	}

	try {
		const response = await fetch('/api/send_lead.php', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				'X-Requested-With': 'XMLHttpRequest',
			},
			body: JSON.stringify(data),
		})

		const result = await response.json()

		if (response.ok && result.result === true) {
			showFormMessage('Спасибо! Ваша заявка успешно отправлена.', 'success')
			e.target.reset()
			let leadsSent = parseInt(localStorage.getItem('leads_sent') || '0')
			localStorage.setItem('leads_sent', leadsSent + 1)
			markLeadSentNow() // фиксируем время успешной отправки (кулдаун 15 минут)
			ym(103207586, 'reachGoal', 'pc_lead')
			sendToTelegram(data.description)
		} else {
			showFormMessage(
				'Ошибка: ' + (result.message || 'Попробуйте позже'),
				'error'
			)
		}
	} catch (err) {
		showFormMessage('Ошибка соединения. Повторите позже.', 'error')
		console.error(err)
	} finally {
		button.disabled = false
		button.textContent = buttonDefaultText
	}
}

// =================== ПРИВЯЗКА ФОРМ ===================
document.getElementById('action__form').addEventListener('submit', e =>
	handleFormSubmit(e, {
		formId: 'action__form',
		nameId: 'action__name',
		phoneId: 'action__tel',
		descId: 'action__desc',
		buttonId: 'action__form__button',
		buttonDefaultText: 'Отправить',
	})
)

document.getElementById('popup__form').addEventListener('submit', e =>
	handleFormSubmit(e, {
		formId: 'popup__form',
		nameId: 'popup__name',
		phoneId: 'popup__tel',
		buttonId: 'popup__button',
		buttonDefaultText: 'Участвовать',
	})
)

// =================== ОБРАБОТКА КЛИКА ПО ЗВОНОК ===================
function handleCallClick() {
	const clientID = getYandexClientID(counterId) || 'clientID отсутствует'
	const vdkTime = getVladivostokTime()
	const storageKey = `call_clicked_${clientID}`
	const now = Date.now()
	const lastSent = parseInt(localStorage.getItem(storageKey), 10)

	if (!isNaN(lastSent) && now - lastSent < 86400000) {
		return
	}

	const message = `📞 ЗВОНОК
🌐 Сайт: АНДРЕЙ
🔍 Запрос: ${yandexSearchQuery || getUTMTerm(utmDataString)}
⭐️ Группа: ${getUTMGroup(utmDataString)}
Дата и время: ${vdkTime}
CityID: ${getCityIdFromUTM(utmDataString)}
ClientID: ${clientID}`

	sendToTelegram(message)
	localStorage.setItem(storageKey, now.toString())
}
