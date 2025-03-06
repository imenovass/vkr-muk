const STORAGE_KEY = "courses";

const initialCourses = [
    {
        id: "1",
        title: "Математика",
        description: "Базовый курс по математике",
        teacherId: "teacher",
    },
    {
        id: "2",
        title: "Физика",
        description: "Введение в механику",
        teacherId: "teacher",
    },
];

export function getAllCourses() {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) {
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

export function getCourseById(id) {
    const courses = getAllCourses();
    return courses.find((c) => c.id === id) || null;
}

function saveAllCourses(courses) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(courses));
}

export function createCourse(courseData) {
    const courses = getAllCourses();
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
