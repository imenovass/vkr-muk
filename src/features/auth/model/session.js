// features/auth/model/session.js

export function setSession(pocketUser) {
  // pocketUser.record = данные о пользователе (username, role, ...),
  // pocketUser.token = jwt
  const { record, token } = pocketUser

  // Можно собрать объект для хранения
  const userObj = {
    id: record.id,
    username: record.username,
    role: record.role,
    token: token,
  }

  localStorage.setItem('currentUser', JSON.stringify(userObj))
}

export function getSession() {
  const data = localStorage.getItem('currentUser')
  if (!data) return null
  try {
    return JSON.parse(data) // {id, username, role, token}
  } catch (e) {
    return null
  }
}

export function clearSession() {
  localStorage.removeItem('currentUser')
}
