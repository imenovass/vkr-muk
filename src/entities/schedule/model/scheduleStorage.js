// entities/schedule/model/scheduleStorage.js

const SCHEDULE_KEY = "schedule";

// Какие-то начальные данные (mock)
const initialSchedule = [
    {
        id: "101",
        courseId: "1",      // курс Математика
        date: "2025-02-01", // YYYY-MM-DD
        time: "10:00",      // строка (HH:mm)
        room: "Аудитория 305",
    },
    {
        id: "102",
        courseId: "2",      // курс Физика
        date: "2025-02-02",
        time: "12:30",
        room: "Лаборатория 2",
    },
];

function saveSchedule(scheduleList) {
    localStorage.setItem(SCHEDULE_KEY, JSON.stringify(scheduleList));
}

// Получаем все события расписания
export function getAllSchedule() {
    const data = localStorage.getItem(SCHEDULE_KEY);
    if (!data) {
        localStorage.setItem(SCHEDULE_KEY, JSON.stringify(initialSchedule));
        return initialSchedule;
    }
    try {
        return JSON.parse(data);
    } catch (e) {
        console.error("Ошибка парсинга schedule из localStorage", e);
        return [];
    }
}

// Добавляем новое событие
export function createScheduleEvent(eventData) {
    const all = getAllSchedule();
    const newId = String(Date.now());
    const newEvent = { id: newId, ...eventData };
    all.push(newEvent);
    saveSchedule(all);
    return newEvent;
}

// Удаляем событие
export function deleteScheduleEvent(id) {
    let all = getAllSchedule();
    all = all.filter((item) => item.id !== id);
    saveSchedule(all);
}

// Можно сделать updateScheduleEvent, если понадобится
