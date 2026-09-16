/* Каталог: вывод всех товаров и форма пополнения Steam. */

/* ---------- вспомогательные функции ---------- */

function labelFor(key, value) {
	if (VALUE_TITLES[value]) {
		return VALUE_TITLES[value];
	}
	return value;
}

/* Подпись «10 товаров / 1 товар / 2 товара» */
function productsTitle(count) {
	const lastTwo = count % 100;
	const last = count % 10;
	let word = "товаров";
	if (lastTwo < 11 || lastTwo > 14) {
		if (last === 1) {
			word = "товар";
		} else if (last >= 2 && last <= 4) {
			word = "товара";
		}
	}
	return count + " " + word;
}

/* ---------- вывод товаров ---------- */

function productCard(product) {
	let html = '<article class="product-card">';
	html += '<div class="product-card__media">';
	html += '<img src="' + product.image + '" alt="' + product.name + '">';
	html += "</div>";
	html += '<div class="product-card__body">';
	html += '<h3 class="product-card__name">' + product.name + "</h3>";
	html += '<p class="product-card__description">' + product.description + "</p>";
	html += '<ul class="product-card__meta">';
	html += "<li>" + labelFor("platform", product.platform) + "</li>";
	html += "<li>" + labelFor("country", product.country) + "</li>";
	html += "<li>" + product.nominal + "</li>";
	html += "</ul>";
	html += '<p class="product-card__rating">★ ' + product.rating.toFixed(1) + "</p>";
	html += '<div class="product-card__bottom">';
	html += '<p class="price">' + formatPrice(product.price);
	if (product.oldPrice) {
		html += ' <s class="price__old">' + formatPrice(product.oldPrice) + "</s>";
	}
	html += "</p>";
	html += '<button class="button button_small" type="button" data-add="' + product.id + '">В корзину</button>';
	html += "</div>";
	html += "</div>";
	html += "</article>";
	return html;
}

/* Показать все товары каталога */
function renderProducts() {
	const box = document.getElementById("catalogItems");
	if (!box) {
		return;
	}

	let html = "";
	products.forEach(function (product) {
		html += productCard(product);
	});
	box.innerHTML = html;

	const counter = document.getElementById("catalogCount");
	if (counter) {
		counter.textContent = productsTitle(products.length);
	}
}

/* Пополнение Steam по логину */
function initSteamForm() {
	const form = document.getElementById("steamForm");
	if (!form) {
		return;
	}

	form.addEventListener("submit", function (event) {
		event.preventDefault();
		if (!form.checkValidity()) {
			form.reportValidity();
			return;
		}

		const login = document.getElementById("steamLogin").value;
		const amount = document.getElementById("steamAmount").value;
		const success = document.getElementById("steamSuccess");
		success.textContent = "Заявка принята: пополним аккаунт " + login + " на " +
			Number(amount).toLocaleString("ru-RU") + " ₽ после подтверждения заказа.";
		success.hidden = false;
		form.reset();
	});
}

/* ---------- запуск ---------- */

function initCatalog() {
	/* если на странице нет каталога — ничего не делаем */
	if (!document.getElementById("catalogItems")) {
		return;
	}

	renderProducts();
}

initCatalog();
initSteamForm();
