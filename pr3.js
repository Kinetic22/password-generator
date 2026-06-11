class CartManager {
    constructor() {
        this.items = JSON.parse(localStorage.getItem('cart')) || [];
    }
 
    _save() {
        localStorage.setItem('cart', JSON.stringify(this.items));
        this._updateBadge();
    }
 
    // Додати товар до кошика
    addToCart(product) {
        // Перевіряємо чи вже є такий товар
        const existing = this.items.find(item => item.id === product.id);
        if (existing) {
            existing.qty = (existing.qty || 1) + 1;
        } else {
            this.items.push({ ...product, qty: 1 });
        }
        this._save();
        this._renderCart();
    }
 
    // Видалити товар з кошика за id
    removeFromCart(id) {
        this.items = this.items.filter(item => item.id !== id);
        this._save();
        this._renderCart();
    }
 
    // Очистити весь кошик
    clearCart() {
        this.items = [];
        this._save();
        this._renderCart();
    }
 
    // Порахувати загальну кількість товарів
    getTotalCount() {
        return this.items.reduce((sum, item) => sum + (item.qty || 1), 0);
    }
 
    // Порахувати загальну вартість
    getTotalPrice() {
        return this.items.reduce((sum, item) => sum + (item.price * (item.qty || 1)), 0);
    }
 
    _updateBadge() {
        const count = this.getTotalCount();
        const badge = document.getElementById('cart-badge');
        if (badge) {
            badge.textContent = count > 0 ? `Кошик: ${count} ${this._declension(count)}` : 'Кошик';
            badge.classList.toggle('text-emerald-600', count > 0);
            badge.classList.toggle('dark:text-emerald-400', count > 0);
            badge.classList.toggle('font-bold', count > 0);
        }
    }
 
    _declension(count) {
        if (count % 10 === 1 && count % 100 !== 11) return 'послуга';
        if ([2, 3, 4].includes(count % 10) && ![12, 13, 14].includes(count % 100)) return 'послуги';
        return 'послуг';
    }
 
    _renderCart() {
        const container = document.getElementById('cart-container');
        if (!container) return;
 
        container.innerHTML = '';
 
        if (this.items.length === 0) {
            container.innerHTML = '<p class="text-sm text-slate-500 text-center py-4">Кошик порожній</p>';
            return;
        }
 
        const fragment = document.createDocumentFragment();
 
        this.items.forEach(item => {
            const el = document.createElement('div');
            el.className = 'flex items-start justify-between gap-3 p-3 bg-background-light dark:bg-slate-800 rounded-xl border border-border-light dark:border-border-dark';
            el.innerHTML = `
                <div class="flex-1 min-w-0">
                    <p class="font-semibold text-sm text-slate-800 dark:text-slate-100 truncate">${item.name}</p>
                    <p class="text-xs text-slate-500 mt-0.5">${item.price > 0 ? item.price * (item.qty || 1) + ' грн' : 'Безкоштовно'} × ${item.qty || 1}</p>
                </div>
                <button data-id="${item.id}" class="remove-btn flex-shrink-0 text-red-400 hover:text-red-600 transition-colors text-lg leading-none" title="Видалити">✕</button>
            `;
            fragment.appendChild(el);
        });
 
        // Підсумок
        const total = this.getTotalPrice();
        const summary = document.createElement('div');
        summary.className = 'mt-4 pt-4 border-t border-border-light dark:border-border-dark space-y-2';
        summary.innerHTML = `
            <div class="flex justify-between text-sm font-semibold">
                <span class="text-slate-600 dark:text-slate-400">Разом:</span>
                <span class="text-primary">${total > 0 ? total + ' грн' : 'Безкоштовно'}</span>
            </div>
            <button id="clear-cart-btn" class="w-full py-2 text-sm font-semibold rounded-lg border-2 border-red-400 text-red-500 hover:bg-red-500 hover:text-white transition-all">
                Очистити кошик 🗑️
            </button>
            <button id="checkout-btn" class="w-full py-2 text-sm font-semibold rounded-lg bg-primary text-white hover:bg-blue-700 transition-all">
                Оформити замовлення ✅
            </button>
        `;
 
        container.appendChild(fragment);
        container.appendChild(summary);
 
        container.addEventListener('click', (e) => {
            if (e.target.classList.contains('remove-btn')) {
                this.removeFromCart(Number(e.target.dataset.id));
            }
            if (e.target.id === 'clear-cart-btn') {
                this.clearCart();
            }
            if (e.target.id === 'checkout-btn') {
                alert(`✅ Замовлення оформлено!\n\nТовари: ${this.items.map(i => i.name).join(', ')}\nСума: ${total > 0 ? total + ' грн' : 'Безкоштовно'}`);
                this.clearCart();
            }
        }, { once: true });
    }
 
    // Ініціалізація: оновити badge та відобразити збережений кошик одразу при завантаженні
    init() {
        this._updateBadge();
        this._renderCart();
    }
}
 
async function loadProducts() {
    try {
        const response = await fetch('products.json');
        if (!response.ok) throw new Error(`HTTP помилка: ${response.status}`);
        const data = await response.json();
        return data;
    } catch (error) {
        console.warn('⚠️ Не вдалося завантажити products.json, використовую вбудовані дані:', error.message);
        return [
            { id: 101, name: "Базовий пароль", price: 0, category: "Генерація", description: "Простий надійний пароль з основними символами." },
            { id: 102, name: "Преміум пароль", price: 50, category: "Генерація", description: "Пароль підвищеної складності." },
            { id: 103, name: "Аудит безпеки акаунту", price: 300, category: "Консалтинг", description: "Повна перевірка ваших паролів і налаштувань безпеки." },
            { id: 104, name: "Перевірка витоків", price: 0, category: "Аналітика", description: "Перевірка email у базах витоків даних." },
            { id: 105, name: "Налаштування 2FA", price: 150, category: "Консалтинг", description: "Двофакторна автентифікація на всіх пристроях." },
            { id: 106, name: "Менеджер паролів", price: 200, category: "Аналітика", description: "Підбір та налаштування менеджера паролів." }
        ];
    }
}
 
function getVulnerableServices(passwords) {
    return passwords.filter(p => p.strength === "Weak" || p["is changed"] === false).map(p => p["service name"]);
}
function getTopLongestPasswords(passwords, limit = 3) {
    return [...passwords].sort((a, b) => b.settings.length - a.settings.length).slice(0, limit);
}
function getServicesByBudget(maxPrice, catalog) {
    return catalog.filter(item => item.price <= maxPrice);
}
function generateCategoryOptions(items) {
    return [...new Set(items.map(item => item.category))];
}
function checkPrice(serviceName, catalog) {
    const priceMap = new Map();
    catalog.forEach(item => priceMap.set(item.name.toLowerCase(), item.price));
    const query = serviceName.toLowerCase();
    return priceMap.has(query) ? { price: priceMap.get(query), currency: "UAH" } : null;
}
 
document.addEventListener('DOMContentLoaded', async () => {
 
    const cart = new CartManager();
    cart.init();
 
    const catalogContainer = document.getElementById('catalog-body');
 
    if (catalogContainer) {
        // Показуємо стан завантаження
        catalogContainer.innerHTML = `
            <div class="col-span-2 text-center py-10 text-slate-400">
                <div class="text-4xl mb-3">⏳</div>
                <p class="font-medium">Завантаження послуг...</p>
            </div>
        `;
 
        // ЗАВДАННЯ 2: Завантажуємо каталог через Fetch API
        const catalogData = await loadProducts();
        console.log('✅ Каталог завантажено через Fetch API:', catalogData);
 
        const categorySelect = document.getElementById('category-filter');
        if (categorySelect) {
            const categories = new Set(catalogData.map(item => item.category));
            const fragOpt = document.createDocumentFragment();
            categories.forEach(cat => {
                const opt = document.createElement('option');
                opt.value = cat;
                opt.textContent = cat;
                fragOpt.append(opt);
            });
            categorySelect.append(fragOpt);
            categorySelect.addEventListener('change', (e) => renderCatalog(e.target.value));
        }
 
        const searchInput = document.getElementById('search-input');
        const searchResult = document.getElementById('search-result');
 
        if (searchInput && searchResult) {
            const productMap = new Map();
            catalogData.forEach(item => productMap.set(item.name.toLowerCase(), item.price));
 
            searchInput.addEventListener('input', (e) => {
                const query = e.target.value.toLowerCase().trim();
                if (query === "") { searchResult.textContent = ""; return; }
 
                if (productMap.has(query)) {
                    const price = productMap.get(query);
                    searchResult.textContent = price > 0 ? `Знайдено: ${price} грн` : `Знайдено: Безкоштовно`;
                    searchResult.className = "text-emerald-600 font-bold ml-3 text-sm";
                } else {
                    searchResult.textContent = "Не знайдено";
                    searchResult.className = "text-red-500 font-medium ml-3 text-sm";
                }
            });
        }
 
        // Рендер карток каталогу
        const renderCatalog = (filterCategory = 'all') => {
            catalogContainer.innerHTML = '';
            const fragment = document.createDocumentFragment();
 
            const filteredData = filterCategory === 'all'
                ? catalogData
                : catalogData.filter(item => item.category === filterCategory);
 
            if (filteredData.length === 0) {
                catalogContainer.innerHTML = '<p class="col-span-2 text-center text-slate-400 py-8">Нічого не знайдено</p>';
                return;
            }
 
            filteredData.forEach(item => {
                const card = document.createElement('div');
                card.className = "product-card bg-surface-light dark:bg-surface-dark p-6 rounded-2xl border border-border-light dark:border-border-dark shadow-sm hover:shadow-md transition-all duration-300 relative overflow-hidden cursor-pointer";
                card.dataset.id = item.id;
 
                card.innerHTML = `
                    <div class="flex items-start justify-between mb-2">
                        <h3 class="text-xl font-bold text-slate-800 dark:text-slate-100">${item.name}</h3>
                    </div>
                    <span class="text-xs font-semibold bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-300 px-2 py-1 rounded mb-3 inline-block">${item.category}</span>
                    <p class="text-sm text-slate-500 dark:text-slate-400 mb-4 leading-relaxed">${item.description || ''}</p>
                    <div class="text-lg font-mono font-bold text-primary mb-4">${item.price > 0 ? item.price + ' грн' : 'Безкоштовно'}</div>
                    <div class="flex gap-3">
                        <button class="details-btn flex-1 py-2 rounded-lg border-2 border-primary text-primary hover:bg-primary hover:text-white transition-colors text-sm font-semibold"
                            data-info="Послуга: ${item.name}\nКатегорія: ${item.category}\nЦіна: ${item.price > 0 ? item.price + ' грн' : 'Безкоштовно'}\n\n${item.description || ''}">
                            Деталі
                        </button>
                        <button class="buy-btn flex-1 py-2 rounded-lg bg-primary text-white hover:bg-blue-700 transition-colors text-sm font-semibold shadow-sm"
                            data-id="${item.id}" data-name="${item.name}" data-price="${item.price}" data-category="${item.category}">
                            До кошика 🛒
                        </button>
                    </div>
                `;
                fragment.append(card);
            });
 
            catalogContainer.append(fragment);
        };
 
        renderCatalog();
 
        // Делегування подій на каталог
        catalogContainer.addEventListener('click', (event) => {
            const target = event.target;
            const card = target.closest('.product-card');
            if (!card) return;
 
            if (target.classList.contains('details-btn')) {
                alert(target.dataset.info);
            } else if (target.classList.contains('buy-btn')) {
                // ЗАВДАННЯ 1: використовуємо CartManager.addToCart()
                const product = {
                    id: Number(target.dataset.id),
                    name: target.dataset.name,
                    price: Number(target.dataset.price),
                    category: target.dataset.category
                };
                cart.addToCart(product);
 
                // Візуальний фідбек
                target.textContent = '✅ Додано!';
                target.classList.add('bg-emerald-500', 'hover:bg-emerald-600');
                target.classList.remove('bg-primary', 'hover:bg-blue-700');
                setTimeout(() => {
                    target.textContent = 'До кошика 🛒';
                    target.classList.remove('bg-emerald-500', 'hover:bg-emerald-600');
                    target.classList.add('bg-primary', 'hover:bg-blue-700');
                }, 1500);
            } else {
                // Клік на картку — підсвічуємо
                card.classList.toggle('border-primary');
                card.classList.toggle('ring-2');
                card.classList.toggle('ring-primary/20');
            }
        });
    }
 
    const contactForm = document.getElementById('contact-form');
 
    if (contactForm) {
        const messageField = document.getElementById('message');
 
        if (messageField) {
            messageField.addEventListener('input', () => {
                messageField.setCustomValidity('');
            });
        }
 
        contactForm.addEventListener('submit', (event) => {
            event.preventDefault();
 
            const messageText = messageField ? messageField.value.toLowerCase() : '';
            if (messageText.includes('спам') || messageText.includes('реклама')) {
                messageField.setCustomValidity('Будь ласка, уникайте слів "спам" та "реклама" у повідомленні.');
            } else {
                if (messageField) messageField.setCustomValidity('');
            }
 
            if (contactForm.checkValidity()) {
                const formData = new FormData(contactForm);
                const formObject = Object.fromEntries(formData.entries());
                console.log('✅ Дані форми готові до відправки:', formObject);
                alert('Повідомлення успішно відправлено! Перевірте консоль (F12).');
                contactForm.reset();
            } else {
                contactForm.reportValidity();
            }
        });
    }
});
