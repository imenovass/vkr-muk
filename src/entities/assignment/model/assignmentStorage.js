// entities/assignment/model/assignmentStorage.js

const ASSIGNMENTS_KEY = 'assignments'

const initialAssignments = [
  {
    id: '101',
    courseId: '1',
    title: 'Домашнее задание 1 (Математика)',
    description: 'Решить задачи 1-5 из учебника',
    dueDate: '2025-02-10',
    submissions: [], // здесь будет [{ studentLogin: ..., solutionLink: ..., comment: ..., grade: ... }, ...]
  },
]

function saveAll(assignments) {
  localStorage.setItem(ASSIGNMENTS_KEY, JSON.stringify(assignments))
}

export function getAllAssignments() {
  const data = localStorage.getItem(ASSIGNMENTS_KEY)
  if (!data) {
    localStorage.setItem(ASSIGNMENTS_KEY, JSON.stringify(initialAssignments))
    return initialAssignments
  }
  try {
    return JSON.parse(data)
  } catch (e) {
    console.error('Ошибка парсинга assignments', e)
    return []
  }
}

export function createAssignment(assignmentData) {
  const list = getAllAssignments()
  const newId = String(Date.now())
  const newAssign = { id: newId, ...assignmentData, submissions: [] }
  list.push(newAssign)
  saveAll(list)
  return newAssign
}

export function deleteAssignment(id) {
  let list = getAllAssignments()
  list = list.filter((item) => item.id !== id)
  saveAll(list)
}

export function getAssignmentById(id) {
  const list = getAllAssignments()
  return list.find((item) => item.id === id) || null
}

// Обновить само задание (title, description, dueDate)
export function updateAssignment(id, updates) {
  const list = getAllAssignments()
  const index = list.findIndex((a) => a.id === id)
  if (index === -1) return null

  list[index] = { ...list[index], ...updates }
  saveAll(list)
  return list[index]
}

// Добавить (или обновить) submission (работу студента)
export function submitAssignment(assignmentId, studentLogin, submissionData) {
  const list = getAllAssignments()
  const index = list.findIndex((a) => a.id === assignmentId)
  if (index === -1) return null

  // submissions: [{ studentLogin, solutionLink, grade, comment }, ...]
  const assignment = list[index]
  const existingSubmission = assignment.submissions.find((sub) => sub.studentLogin === studentLogin)

  if (existingSubmission) {
    // Обновляем существующую
    Object.assign(existingSubmission, submissionData)
  } else {
    // Создаём новую запись
    assignment.submissions.push({
      studentLogin,
      ...submissionData,
    })
  }

  saveAll(list)
  return assignment
}
