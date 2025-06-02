const STORAGE_KEY = 'courses'

export function saveAllCourses(courses) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(courses))
}

export function getAllCourses() {
  const data = localStorage.getItem(STORAGE_KEY)
  if (!data) {
    // если ничего нет, вернём пустой массив
    return []
  }
  try {
    const parsed = JSON.parse(data)
    // Пробежимся по каждому курсу и подстрахуемся, что там есть нужные поля
    parsed.forEach((c) => {
      if (!Array.isArray(c.participants)) {
        c.participants = []
      }
      if (!Array.isArray(c.materials)) {
        c.materials = []
      }
      if (!Array.isArray(c.submissions)) {
        c.submissions = []
      }
      // Если description / url не заданы, сделаем пустую строку
      if (typeof c.description !== 'string') {
        c.description = ''
      }
      if (typeof c.url !== 'string') {
        c.url = ''
      }
    })
    return parsed
  } catch (error) {
    console.error('Ошибка парсинга курсов:', error)
    return []
  }
}

// ============ CREATE ============

export function createCourse(courseData) {
  const courses = getAllCourses()
  const newId = String(Date.now())

  // Поле title — формально обязательное (проверка обычно в форме),
  // но тут мы не выбрасываем ошибку, если его нет.
  // Если нужно — можете добавить логику или оставим как есть.
  const newCourse = {
    id: newId,
    // Обязательные по смыслу (title), или пустая строка, если не пришло
    title: courseData.title || '',
    description: courseData.description || '',
    url: courseData.url || '',
    teacherId: courseData.teacherId || '',

    // Массивы:
    participants: courseData.participants || [],
    materials: courseData.materials || [],
    submissions: courseData.submissions || [],

    createdAt: courseData.createdAt || new Date().toISOString(),
  }

  courses.push(newCourse)
  saveAllCourses(courses)
  return newCourse
}

// ============ READ (ALL / ONE) ============

export function getCourseById(id) {
  const courses = getAllCourses()
  return courses.find((c) => c.id === id) || null
}

// ============ UPDATE ============

export function updateCourse(id, updates) {
  const courses = getAllCourses()
  const idx = courses.findIndex((c) => c.id === id)
  if (idx === -1) return null

  const oldCourse = courses[idx]

  // Обновляем только те поля, которые пришли
  // (title, description, url, participants, materials, submissions, etc.)
  courses[idx] = {
    ...oldCourse,
    ...updates,
  }

  // Гарантия: массивы не теряем
  if (!Array.isArray(courses[idx].participants)) {
    courses[idx].participants = []
  }
  if (!Array.isArray(courses[idx].materials)) {
    courses[idx].materials = []
  }
  if (!Array.isArray(courses[idx].submissions)) {
    courses[idx].submissions = []
  }

  // Строковые поля description/url, если нужны
  if (typeof courses[idx].description !== 'string') {
    courses[idx].description = ''
  }
  if (typeof courses[idx].url !== 'string') {
    courses[idx].url = ''
  }

  saveAllCourses(courses)
  return courses[idx]
}

// ============ DELETE ============

export function deleteCourse(id) {
  let courses = getAllCourses()
  courses = courses.filter((c) => c.id !== id)
  saveAllCourses(courses)
}

// ============ INTERNAL SAVE HELPER ============

function saveUpdatedCourse(updatedCourse) {
  const all = getAllCourses()
  const idx = all.findIndex((c) => c.id === updatedCourse.id)
  if (idx !== -1) {
    all[idx] = updatedCourse
    saveAllCourses(all)
  }
  return updatedCourse
}

// ============ MATERIALS CRUD ============

// Create Material
export function addMaterial(courseId, materialData) {
  const course = getCourseById(courseId)
  if (!course) return null
  if (!Array.isArray(course.materials)) {
    course.materials = []
  }

  const newId = String(Date.now())
  const newMat = { id: newId, ...materialData }
  course.materials.push(newMat)

  return saveUpdatedCourse(course)
}

// Update Material
export function updateMaterial(courseId, materialId, updates) {
  const course = getCourseById(courseId)
  if (!course) return null

  if (!Array.isArray(course.materials)) {
    course.materials = []
  }

  const index = course.materials.findIndex((m) => m.id === materialId)
  if (index === -1) return null

  course.materials[index] = {
    ...course.materials[index],
    ...updates,
  }

  return saveUpdatedCourse(course)
}

// Delete Material
export function deleteMaterial(courseId, materialId) {
  const course = getCourseById(courseId)
  if (!course) return null

  if (!Array.isArray(course.materials)) {
    course.materials = []
  }

  course.materials = course.materials.filter((m) => m.id !== materialId)

  return saveUpdatedCourse(course)
}

// ============ SUBMISSIONS ============

// Add submission (Create)
export function addSubmission(courseId, submissionData) {
  const course = getCourseById(courseId)
  if (!course) return null

  if (!Array.isArray(course.submissions)) {
    course.submissions = []
  }

  const newId = String(Date.now())
  const newSub = { id: newId, grade: null, ...submissionData }
  course.submissions.push(newSub)

  return saveUpdatedCourse(course)
}

// Set grade (Update submission)
export function setSubmissionGrade(courseId, submissionId, grade) {
  const course = getCourseById(courseId)
  if (!course) return null

  if (!Array.isArray(course.submissions)) {
    course.submissions = []
  }

  const sub = course.submissions.find((s) => s.id === submissionId)
  if (!sub) return null

  sub.grade = grade // например "5", "4", или "A", в зависимости от логики

  return saveUpdatedCourse(course)
}

export function addMaterialCompletion(courseId, materialId, studentId, reflectionText) {
  const course = getCourseById(courseId)
  if (!course) return null

  // Ищем нужный материал
  const material = course.materials.find((m) => m.id === materialId)
  if (!material) return null

  // Если массив completions ещё не существует, создаём
  if (!Array.isArray(material.completions)) {
    material.completions = []
  }

  // Добавляем запись с ответом
  material.completions.push({
    studentId,
    reflection: reflectionText,
    createdAt: new Date().toISOString(),
  })

  // Сохраняем обновлённый курс
  return saveUpdatedCourse(course)
}
