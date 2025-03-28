const STORAGE_KEY = "courses";


function saveAllCourses(courses) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(courses));
}

export function getAllCourses() {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) {
        // если ничего нет, вернём пустой массив (или можно иметь initialCourses)
        return [];
    }
    try {
        const parsed = JSON.parse(data);
        // Убедимся, что у каждого курса есть поле participants (массив)
        parsed.forEach((c) => {
            if (!Array.isArray(c.participants)) {
                c.participants = [];
            }
        });
        return parsed;
    } catch (error) {
        console.error("Ошибка парсинга курсов:", error);
        return [];
    }
}

export function createCourse(courseData) {
    const courses = getAllCourses();
    const newId = String(Date.now());
    // Если нет participants, зададим пустой массив
    const newCourse = {
        id: newId,
        participants: [],
        ...courseData,
    };
    courses.push(newCourse);
    saveAllCourses(courses);
    return newCourse;
}

export function updateCourse(id, updates) {
    const courses = getAllCourses();
    const idx = courses.findIndex((c) => c.id === id);
    if (idx === -1) return null;

    courses[idx] = {
        ...courses[idx],
        ...updates,
    };

    // Если вдруг updates.participants не передали,
    // поле останется прежним; главное — не терять массив
    if (!Array.isArray(courses[idx].participants)) {
        courses[idx].participants = [];
    }

    saveAllCourses(courses);
    return courses[idx];
}

export function deleteCourse(id) {
    let courses = getAllCourses();
    courses = courses.filter((c) => c.id !== id);
    saveAllCourses(courses);
}

export function getCourseById(id) {
    const courses = getAllCourses();
    return courses.find((c) => c.id === id) || null;
}


function saveUpdatedCourse(updated) {
    // Подмена
    const all = getAllCourses();
    const idx = all.findIndex((c) => c.id === updated.id);
    if (idx !== -1) {
        all[idx] = updated;
        saveAllCourses(all);
    }
    return updated;
}

// Добавить материал (учитель)
export function addMaterial(courseId, materialData) {
    const course = getCourseById(courseId);
    if (!course) return null;
    const newId = String(Date.now());
    const newMat = { id: newId, ...materialData };
    course.materials.push(newMat);

    return saveUpdatedCourse(course);
}

// Добавить работу (домашку) студента
export function addSubmission(courseId, submissionData) {
    const course = getCourseById(courseId);
    if (!course) return null;
    const newId = String(Date.now());
    const newSub = { id: newId, ...submissionData, grade: null };
    course.submissions.push(newSub);

    return saveUpdatedCourse(course);
}

// Выставить оценку submission
export function setSubmissionGrade(courseId, submissionId, grade) {
    const course = getCourseById(courseId);
    if (!course) return null;
    const sub = course.submissions.find((s) => s.id === submissionId);
    if (!sub) return null;

    sub.grade = grade; // например, "5" или "A"
    return saveUpdatedCourse(course);
}

