const USERS_KEY = "users";

const initialUsers = [
    {
        login: "student",
        password: "12345",
        role: "student",
        fullName: "Иван Петров",
    },
    {
        login: "teacher",
        password: "teacher",
        role: "teacher",
        fullName: "Пётр Иванов",
    },
];

// Прочитать всех пользователей
export function getAllUsers() {
    const data = localStorage.getItem(USERS_KEY);
    if (!data) {
        localStorage.setItem(USERS_KEY, JSON.stringify(initialUsers));
        return initialUsers;
    }
    try {
        return JSON.parse(data);
    } catch (e) {
        console.error("Ошибка парсинга пользователей", e);
        return [];
    }
}

// Записать массив пользователей
function saveAllUsers(users) {
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

// Обновить данные одного пользователя
export function updateUser(login, updates) {
    const users = getAllUsers();
    const index = users.findIndex((u) => u.login === login);
    if (index === -1) return null;

    users[index] = { ...users[index], ...updates };
    saveAllUsers(users);
    return users[index];
}

// Найти пользователя по логину
export function getUserByLogin(login) {
    const users = getAllUsers();
    return users.find((u) => u.login === login) || null;
}
