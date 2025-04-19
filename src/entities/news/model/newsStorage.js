// /entities/news/model/newsStorage.js

import img from "../../../assets/img/matem.jpg";

const NEWS_KEY = "news";

/**
 * Начальные данные (моки).
 * Если в localStorage нет сохранённых новостей,
 * они будут записаны при первом обращении к getAllNews().
 */
const initialNews = [
    {
        id: "1",
        author: "Именова Севара",
        role: "student",
        title: "Ура, получилось решить",
        content: "Так долго мучалась)",
        createdAt: "2023-03-10T09:00:00.000Z",
        image: img,
    },
    {
        id: "2",
        author: "Учитель",
        role: "teacher",
        title: "Напоминаю!! Срок сдачи подходит к концу!!",
        content: "Успейте сдать отчеты вовремя !!",
        createdAt: "2023-03-15T15:30:00.000Z",
        image: "",
    },
];

/**
 * Функция сохраняет список новостей в localStorage по ключу NEWS_KEY.
 * @param {Array} list - массив новостей
 */
function saveNewsList(list) {
    localStorage.setItem(NEWS_KEY, JSON.stringify(list));
}

/**
 * Получить все новости из localStorage.
 * Если там ничего нет, используется массив initialNews,
 * который записывается в localStorage и затем возвращается.
 * @returns {Array} список новостей
 */
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

/**
 * Создать новость и сохранить в localStorage.
 * @param {Object} newsData - данные новости
 * @returns {Object} созданная новость (с присвоенным id)
 */
export function createNews(newsData) {
    const list = getAllNews();
    const newId = String(Date.now()); // простое уникальное значение
    const newPost = {
        id: newId,
        ...newsData,
    };
    // Добавим новость в начало списка:
    list.unshift(newPost);
    saveNewsList(list);
    return newPost;
}

/**
 * Обновить существующую новость.
 * @param {string} id - идентификатор новости
 * @param {Object} updates - поля, которые нужно изменить
 * @returns {Object|null} обновлённая новость или null, если не найдена
 */
export function updateNews(id, updates) {
    const list = getAllNews();
    const index = list.findIndex((item) => item.id === id);
    if (index === -1) {
        console.warn(`Новость с id=${id} не найдена`);
        return null;
    }
    list[index] = { ...list[index], ...updates };
    saveNewsList(list);
    return list[index];
}

/**
 * Удалить новость по её id.
 * @param {string} id - идентификатор новости
 */
export function deleteNews(id) {
    let list = getAllNews();
    list = list.filter((item) => item.id !== id);
    saveNewsList(list);
}
