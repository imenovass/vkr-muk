// entities/course/model/courseStorage.js

const STORAGE_KEY = "courses";

// Стартовый (mock) список курсов (можно загрузить при первом запуске)
const initialCourses = [
    {
        id: "1",
        title: "Математика",
        description: "Базовый курс по математике",
        teacherId: "teacher", // условно привяжем к логину преподавателя
    },
    {
        id: "2",
        title: "Физика",
        description: "Введение в механику",
        teacherId: "teacher",
    },
];

// Функция получения списка из localStorage
export function getAllCourses() {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) {
        // Если ничего нет в localStorage, записываем initialCourses
        localStorage.setItem(STORAGE_KEY, JSON.stringify(initialCourses));
        return initialCourses;
    }
    try {
        return JSON.parse(data);
    } catch (e) {
        console.error("Ошибка парсинга курсов из localStorage", e);
        return [];
    }
}

// Функция поиска курса по id
export function getCourseById(id) {
    const courses = getAllCourses();
    return courses.find((c) => c.id === id) || null;
}

// Сохранить весь массив курсов
function saveAllCourses(courses) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(courses));
}

// Создать новый курс
export function createCourse(courseData) {
    const courses = getAllCourses();
    // Генерация условного ID
    const newId = String(Date.now());
    const newCourse = { id: newId, ...courseData };
    courses.push(newCourse);
    saveAllCourses(courses);
    return newCourse;
}

// Обновить существующий курс
export function updateCourse(id, updates) {
    const courses = getAllCourses();
    const index = courses.findIndex((c) => c.id === id);
    if (index === -1) return null;

    courses[index] = { ...courses[index], ...updates };
    saveAllCourses(courses);
    return courses[index];
}

// Удалить курс
export function deleteCourse(id) {
    let courses = getAllCourses();
    courses = courses.filter((c) => c.id !== id);
    saveAllCourses(courses);
}
