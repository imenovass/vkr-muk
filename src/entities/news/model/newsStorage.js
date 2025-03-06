// entities/news/model/newsStorage.js

const NEWS_KEY = "news";

const initialNews = [
    {
        id: "1",
        author: "Teacher Admin",
        role: "teacher",
        title: "Добро пожаловать!",
        content: "Наша платформа открыта для всех!",
        createdAt: "2025-01-10T09:30:00.000Z"
    },
    {
        id: "2",
        author: "Teacher Admin",
        role: "teacher",
        title: "Важное объявление",
        content: "Завтра лекция по Математике отменяется!",
        createdAt: "2025-01-15T12:00:00.000Z"
    },
];

// Вспомогательная функция для сохранения массива новостей
function saveNewsList(list) {
    localStorage.setItem(NEWS_KEY, JSON.stringify(list));
}

// Получить все новости (если нет - записать initialNews)
export function getAllNews() {
    const data = localStorage.getItem(NEWS_KEY);
    if (!data) {
        saveNewsList(initialNews);
        return initialNews;
    }
    try {
        return JSON.parse(data);
    } catch (e) {
        console.error("Ошибка парсинга news из localStorage", e);
        return [];
    }
}

// Создать новость
export function createNews(newsData) {
    const list = getAllNews();
    const newId = String(Date.now());
    const newPost = {
        id: newId,
        ...newsData,
    };
    list.unshift(newPost); // добавим в начало, чтобы сразу шло сверху
    saveNewsList(list);
    return newPost;
}

// Обновить существующую новость
export function updateNews(id, updates) {
    const list = getAllNews();
    const index = list.findIndex((item) => item.id === id);
    if (index === -1) return null;

    list[index] = { ...list[index], ...updates };
    saveNewsList(list);
    return list[index];
}

// Удалить новость
export function deleteNews(id) {
    let list = getAllNews();
    list = list.filter((item) => item.id !== id);
    saveNewsList(list);
}
