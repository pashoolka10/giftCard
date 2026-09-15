/* Каталог: вывод товаров и «умный фильтр». */

const state = {
	filters: { platform: [], country: [], nominal: [] },
	maxPrice: MAX_PRICE,
	sort: "popular"
};

/* ---------- вспомогательные функции ---------- */

function labelFor(key, value) {
	if (VALUE_TITLES[value]) {
		return VALUE_TITLES[value];
	}
	return value;
}

/* Все значения характеристики, которые встречаются в товарах */
function valuesOf(key) {
	/* у Steam нет товаров — он пополняется по логину, но в фильтре должен быть */
	if (key === "platform") {
		return PLATFORM_VALUES;
	}

	const values = [];
	products.forEach(function (product) {
		if (values.indexOf(product[key]) === -1) {
			values.push(product[key]);
		}
	});
	return values;
}

/* Подпись «12 товаров / 1 товар / 2 товара» */
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

/* Подходит ли товар текущим условиям фильтра */
function isSuitable(product, filters) {
	for (const key in filters) {
		const selected = filters[key];
		if (selected.length > 0 && selected.indexOf(product[key]) === -1) {
			return false;
		}
	}
	if (product.price > state.maxPrice) {
		return false;
	}
	return true;
}

function filteredProducts() {
	const result = products.filter(function (product) {
		return isSuitable(product, state.filters);
	});

	if (state.sort === "price-asc") {
		result.sort(function (a, b) { return a.price - b.price; });
	} else if (state.sort === "price-desc") {
		result.sort(function (a, b) { return b.price - a.price; });
	} else if (state.sort === "rating") {
		result.sort(function (a, b) { return b.rating - a.rating; });
	} else {
		result.sort(function (a, b) { return b.popular - a.popular; });
	}
	return result;
}

/* ---------- фильтр ---------- */

function renderFilters() {
	const box = document.getElementById("filters");
	if (!box) {
		return;
	}

	let html = "";
	filterConfig.forEach(function (group) {
		html += '<div class="filter-group">';
		html += '<h3 class="filter-group__title">' + group.title + "</h3>";
		valuesOf(group.key).forEach(function (value) {
			const checked = state.filters[group.key].indexOf(value) !== -1 ? " checked" : "";
			html += '<label class="checkbox">';
			html += '<input type="checkbox" name="' + group.key + '" value="' + value + '"' + checked + ">";
			html += "<span>" + labelFor(group.key, value) + "</span>";
			html += "</label>";
		});
		html += "</div>";
	});

	html += '<div class="filter-group">';
	html += '<h3 class="filter-group__title">Цена, до <span id="priceValue">' + formatPrice(state.maxPrice) + "</span></h3>";
	html += '<input class="range" type="range" id="priceRange" min="500" max="' + MAX_PRICE + '" step="100" value="' + state.maxPrice + '">';
	html += "</div>";

	box.innerHTML = html;
}

function collectFilters() {
	filterConfig.forEach(function (group) {
		const checked = document.querySelectorAll('#filters input[name="' + group.key + '"]:checked');
		state.filters[group.key] = Array.prototype.map.call(checked, function (input) {
			return input.value;
		});
	});
}

/* «Умный фильтр»: значения, которые дадут пустой результат, становятся недоступными */
function updateAvailability() {
	filterConfig.forEach(function (group) {
		const inputs = document.querySelectorAll('#filters input[name="' + group.key + '"]');
		Array.prototype.forEach.call(inputs, function (input) {
			const testFilters = {};
			for (const key in state.filters) {
				testFilters[key] = state.filters[key].slice();
			}
			testFilters[group.key] = [input.value];

			const hasResult = products.some(function (product) {
				return isSuitable(product, testFilters);
			});

			const isSteam = group.key === "platform" && input.value === STEAM_PLATFORM;
			input.disabled = !hasResult && !input.checked && !isSteam;
			input.closest(".checkbox").classList.toggle("checkbox_disabled", input.disabled);
		});
	});
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

function renderProducts() {
	const box = document.getElementById("catalogItems");
	if (!box) {
		return;
	}

	const list = filteredProducts();
	box.innerHTML = list.map(productCard).join("");

	/* Steam пополняется по логину: показываем форму вместо карточек */
	const steamSelected = state.filters.platform.indexOf(STEAM_PLATFORM) !== -1;
	const onlySteam = steamSelected && state.filters.platform.length === 1;
	const steamBlock = document.getElementById("steamBlock");
	if (steamBlock) {
		steamBlock.hidden = !steamSelected;
	}

	const counter = document.getElementById("catalogCount");
	if (counter) {
		counter.textContent = onlySteam ? "Пополнение Steam" : productsTitle(list.length);
	}

	const empty = document.getElementById("catalogEmpty");
	if (empty) {
		empty.hidden = list.length > 0 || onlySteam;
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

function readUrlParams() {
	const params = new URLSearchParams(window.location.search);
	["platform", "country", "nominal"].forEach(function (key) {
		const value = params.get(key);
		if (value) {
			state.filters[key] = [value];
		}
	});
}

function initCatalog() {
	if (!document.getElementById("catalogItems")) {
		return;
	}

	readUrlParams();
	renderFilters();

	const filters = document.getElementById("filters");
	filters.addEventListener("change", function (event) {
		if (event.target.type === "checkbox") {
			collectFilters();
			renderProducts();
			updateAvailability();
		}
	});

	/* ползунок цены перерисовывается вместе с блоком фильтра, поэтому слушаем контейнер */
	filters.addEventListener("input", function (event) {
		if (event.target.id !== "priceRange") {
			return;
		}
		state.maxPrice = Number(event.target.value);
		document.getElementById("priceValue").textContent = formatPrice(state.maxPrice);
		renderProducts();
		updateAvailability();
	});

	const sort = document.getElementById("sortSelect");
	sort.addEventListener("change", function () {
		state.sort = sort.value;
		renderProducts();
	});

	document.getElementById("resetFilters").addEventListener("click", function () {
		state.filters = { platform: [], country: [], nominal: [] };
		state.maxPrice = MAX_PRICE;
		state.sort = "popular";
		sort.value = "popular";
		renderFilters();
		renderProducts();
		updateAvailability();
	});

	renderProducts();
	updateAvailability();
}

initCatalog();
initSteamForm();
