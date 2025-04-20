// /entities/news/model/newsStorage.js

import img1 from "../../../assets/img/door.jpeg";
import img2 from "../../../assets/img/tree.jpeg";
import img3 from "../../../assets/img/study.jpeg";

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
        title: "Наш университет — наша забота!",
        content: "Сегодня, в 10:30 утра, на территории нашего университета прошёл субботник. Студенты и преподаватели объединились, чтобы сделать кампус чище и уютнее. Убирали листья, красили лавочки, высаживали цветы — погода, настроение и результат порадовали всех участников!\n" +
          "Огромное спасибо каждому, кто не остался в стороне — такие мероприятия не только украшают наш университет, но и объединяют нас!",
        createdAt: "2023-03-10T09:00:00.000Z",
        image: img2,
    },
    {
        id: "2",
        author: "Учитель",
        role: "teacher",
        title: "Скоро начнется экзаменационная неделя",
        content: "Друзья, совсем скоро стартует экзаменационная неделя — время собраться, повторить материал и показать всё, на что мы способны!\n" +
          "Не забывайте про режим сна, отдых и поддержку друг друга. Удачи всем — пусть билеты будут лёгкими, а оценки — высокими!",
        createdAt: "2023-03-15T15:30:00.000Z",
        image: img3,
    },
    {
        id: "2",
        author: "Учитель",
        role: "teacher",
        title: "Приглашаем всех на день открытых дверей!",
        content: "Приходи на День открытых дверей и окунись в атмосферу университетской жизни!\n" +
          "\n" +
          "📌 Что тебя ждёт:\n" +
          "— Знакомство с факультетами и преподавателями\n" +
          "— Экскурсия по кампусу\n" +
          "— Ответы на все вопросы о поступлении\n" +
          "— Живое общение с нашими студентами\n" +
          "\n" +
          "📅 Когда: 20.06.2025\n" +
          "🕒 Во сколько:13:00\n" +
          "📍 Где: проспект Чуй, 255\n" +
          "\n" +
          "Не упусти шанс сделать шаг навстречу будущему! Ждём тебя — будет интересно",
        createdAt: "2023-03-15T15:30:00.000Z",
        image: img1,
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
