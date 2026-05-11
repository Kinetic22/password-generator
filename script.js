//БД
const savedPasswords = [
    { id: 1, "service name": "Gmail", settings: { length: 12, digits: true }, strength: "Strong", "is changed": true },
    { id: 2, "service name": "Facebook", settings: { length: 8, digits: false }, strength: "Weak", "is changed": false },
    { id: 3, "service name": "GitHub", settings: { length: 16, digits: true }, strength: "Excellent", "is changed": true },
    { id: 4, "service name": "Bank", settings: { length: 20, digits: true }, strength: "Excellent", "is changed": true },
    { id: 5, "service name": "Steam", settings: { length: 10, digits: true }, strength: "Medium", "is changed": false }
];

const catalog = [
    { id: 101, name: "Базовий пароль", price: 0, category: "Генерація" },
    { id: 102, name: "Преміум пароль", price: 50, category: "Генерація" },
    { id: 103, name: "Аудит безпеки акаунту", price: 300, category: "Консалтинг" },
    { id: 104, name: "Перевірка витоків", price: 0, category: "Аналітика" },
    { id: 105, name: "Налаштування 2FA", price: 150, category: "Консалтинг" }
];

//Бізнес логіка
function getVulnerableServices(passwords) {
    return passwords.filter(p => p.strength === "Weak" || p["is changed"] === false).map(p => p["service name"]);
}
function getTopLongestPasswords(passwords, limit = 3) {
    return [...passwords].sort((a, b) => b.settings.length - a.settings.length).slice(0, limit);
}
function getServicesByBudget(maxPrice) {
    return catalog.filter(item => item.price <= maxPrice);
}
function generateCategoryOptions(items) {
    return [...new Set(items.map(item => item.category))];
}
function checkPrice(serviceName) {
    const priceMap = new Map();
    catalog.forEach(item => priceMap.set(item.name.toLowerCase(), item.price));
    const query = serviceName.toLowerCase();
    if (priceMap.has(query)) {
        return { price: priceMap.get(query), currency: "UAH" };
    }
    return null;
}
document.addEventListener('DOMContentLoaded', () => {

    //ЕЛЕМЕНТИ СТОРІНКИ "КАТАЛОГ"
    const catalogContainer = document.getElementById('catalog-body');
    const categorySelect = document.getElementById('category-filter');
    const searchInput = document.getElementById('search-input');
    const searchResult = document.getElementById('search-result');
    const cartContainer = document.getElementById('cart-container');

    if (catalogContainer) {
        
        // фільтри Set
        if (categorySelect) {
            const categories = new Set(catalog.map(item => item.category));
            const fragOpt = document.createDocumentFragment();
            categories.forEach(cat => {
                const opt = document.createElement('option');
                opt.value = cat;
                opt.textContent = cat;
                fragOpt.append(opt);
            });
            categorySelect.append(fragOpt);

            // Фільтрація по зміні
            categorySelect.addEventListener('change', (e) => renderCatalog(e.target.value));
        }

        // Map) 
        if (searchInput && searchResult) {
            const productMap = new Map();
            catalog.forEach(item => productMap.set(item.name.toLowerCase(), item.price));

            searchInput.addEventListener('input', (e) => {
                const query = e.target.value.toLowerCase().trim();
                if (query === "") {
                    searchResult.textContent = "";
                    return;
                }
                
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

        // наповнення сторінки
        const renderCatalog = (filterCategory = 'all') => {
            catalogContainer.innerHTML = ''; 
            const fragment = document.createDocumentFragment(); 
            
            const filteredData = filterCategory === 'all' 
                ? catalog 
                : catalog.filter(item => item.category === filterCategory);

            filteredData.forEach(item => {
                const card = document.createElement('div');
                card.className = "product-card bg-surface-light dark:bg-surface-dark p-6 rounded-2xl border border-border-light dark:border-border-dark shadow-sm hover:shadow-md transition-all duration-300 relative overflow-hidden";
                card.dataset.id = item.id;
                
                const title = document.createElement('h3');
                title.className = "text-xl font-bold mb-1 text-slate-800 dark:text-slate-100";
                title.textContent = item.name;

                const category = document.createElement('span');
                category.className = "text-xs font-semibold bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-300 px-2 py-1 rounded mb-3 inline-block";
                category.textContent = item.category;

                const price = document.createElement('div');
                price.className = "text-lg font-mono font-bold text-primary mb-4";
                price.textContent = item.price > 0 ? `${item.price} грн` : "Безкоштовно";

                const btnGroup = document.createElement('div');
                btnGroup.className = "flex gap-3";

                const detailsBtn = document.createElement('button');
                detailsBtn.className = "details-btn flex-1 py-2 rounded-lg border-2 border-primary text-primary hover:bg-primary hover:text-white transition-colors text-sm font-semibold";
                detailsBtn.textContent = "Деталі";
                // Зберігаємо дані для алерта
                detailsBtn.dataset.info = `Послуга: ${item.name}\nКатегорія: ${item.category}\nЦіна: ${item.price} грн`;

                const buyBtn = document.createElement('button');
                buyBtn.className = "buy-btn flex-1 py-2 rounded-lg bg-primary text-white hover:bg-blue-700 transition-colors text-sm font-semibold shadow-sm";
                buyBtn.textContent = "Купити";

                btnGroup.append(detailsBtn, buyBtn);
                card.append(title, category, price, btnGroup);
                fragment.append(card);
            });
            
            catalogContainer.append(fragment);
        };

        renderCatalog();

        // Делегування подій та Маніпуляція класами
        catalogContainer.addEventListener('click', (event) => {
            const target = event.target;
            const card = target.closest('.product-card');

            if (!card) return;

            // Обробка "Детальніше"
            if (target.classList.contains('details-btn')) {
                alert(target.dataset.info);
            }

            // Обробка "Купити"
            else if (target.classList.contains('buy-btn')) {
                if (cartContainer) {
                    const clone = card.cloneNode(true);
                    clone.querySelector('.flex').remove();
                    clone.classList.remove('hover:shadow-md');
                    clone.classList.add('animate-pulse', 'border-emerald-500', 'scale-95');
                    
                    cartContainer.append(clone);
                    
                    setTimeout(() => {
                        clone.classList.remove('animate-pulse');
                    }, 1000);
                }
            }
            else {
                card.classList.toggle('border-primary');
                card.classList.toggle('ring-2');
                card.classList.toggle('ring-primary/20');
            }
        });
    }

    //Обробка подій форми 
    const contactForm = document.getElementById('contact-form');
    if (contactForm) {
        contactForm.addEventListener('submit', (event) => {
            event.preventDefault(); // Запобігаємо перезавантаженню
            
            const name = document.getElementById('user-name').value;
            alert(`Дякуємо, ${name}! Ваше повідомлення успішно надіслано. Сторінка не перезавантажилась.`);
            
            contactForm.reset();
        });
    }
});
