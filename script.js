//бд
const savedPasswords = [
    { id: 1, "service name": "Gmail", settings: { length: 12, digits: true }, strength: "Strong", "is changed": true },
    { id: 2, "service name": "Facebook", settings: { length: 8, digits: false }, strength: "Weak", "is changed": false },
    { id: 3, "service name": "GitHub", settings: { length: 16, digits: true }, strength: "Excellent", "is changed": true },
    { id: 4, "service name": "Bank", settings: { length: 20, digits: true }, strength: "Excellent", "is changed": true },
    { id: 5, "service name": "Steam", settings: { length: 10, digits: true }, strength: "Medium", "is changed": false }
];
const catalog = [
    { name: "Базовий пароль", price: 0, category: "Генерація" },
    { name: "Преміум пароль", price: 50, category: "Генерація" },
    { name: "Аудит безпеки акаунту", price: 300, category: "Консалтинг" },
    { name: "Перевірка витоків даних", price: 0, category: "Аналітика" },
    { name: "Налаштування 2FA", price: 150, category: "Консалтинг" }
];
//бізнес логіка 
function getVulnerableServices(passwords) {
    return passwords
        .filter(p => p.strength === "Weak" || p["is changed"] === false)
        .map(p => p["service name"]);
}

function getTopLongestPasswords(passwords, limit = 3) {
    return [...passwords]
        .sort((a, b) => b.settings.length - a.settings.length)
        .slice(0, limit);
}

function getServicesByBudget(maxPrice) {
    return catalog.filter(item => item.price <= maxPrice);
}

function generateCategoryOptions(items) {
    return [...new Set(items.map(item => item.category))];
}

// Map динамічне при виклику
function checkPrice(serviceName) {
    const priceMap = new Map();
    catalog.forEach(item => priceMap.set(item.name, item.price));
    
    if (priceMap.has(serviceName)) {
        return { price: priceMap.get(serviceName), currency: "UAH" };
    }
    return null;
}
//API Controller / Dispatcher
//обробка запитів
function handleRequest(action, payload = {}) {
    try {
        switch (action) {
            case "GET_VULNERABLE_SERVICES":
                const vulnerable = getVulnerableServices(savedPasswords);
                return { success: true, data: vulnerable };
            case "GET_TOP_PASSWORDS":
                const top = getTopLongestPasswords(savedPasswords, payload.limit);
                return { success: true, data: top };

            case "GET_SERVICES_BY_BUDGET":
                if (typeof payload.maxPrice !== 'number') {
                    return { success: false, message: "Invalid payload: maxPrice is required" };
                }
                const services = getServicesByBudget(payload.maxPrice);
                return { success: true, data: services };

            case "GET_CATEGORIES":
                const categories = generateCategoryOptions(catalog);
                return { success: true, data: categories };

            case "CHECK_PRICE":
                if (!payload.serviceName) {
                    return { success: false, message: "Invalid payload: serviceName is required" };
                }
                const priceInfo = checkPrice(payload.serviceName);
                if (priceInfo) {
                    return { success: true, data: priceInfo };
                } else {
                    return { success: false, message: "Service not found in catalog" };
                }

            default:
                return { success: false, message: "Unknown action" };
        }
    } catch (error) {
        return { success: false, message: "Internal server error", error: error.message };
    }
}
//тестування
console.log("1 Отримання вразливих сервісів ");
console.log(handleRequest("GET_VULNERABLE_SERVICES"));
console.log("\n2 Послуги до 100 грн ");
console.log(handleRequest("GET_SERVICES_BY_BUDGET", { maxPrice: 100 }));
console.log("\n3 Отримання унікальних категорій ");
console.log(handleRequest("GET_CATEGORIES"));
console.log("\n4 Перевірка ціни (Успішний запит) ");
console.log(handleRequest("CHECK_PRICE", { serviceName: "Налаштування 2FA" }));
console.log("\n5 Перевірка ціни (Помилка / Неіснуюча послуга) ");
console.log(handleRequest("CHECK_PRICE", { serviceName: "Злом сторінки" }));
console.log("\n6 Невідомий запит (Обробка помилки маршруту) ");
console.log(handleRequest("DELETE_ALL_DATA"));