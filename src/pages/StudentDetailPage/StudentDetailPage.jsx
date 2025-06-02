import React, { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'

import { Grid, List, Table, message } from 'antd'

import { getAllCourses } from '../../entities/course/model/courseStorage'
import { getSession } from '../../features/auth/model/session'

export const StudentDetailPage = () => {
  const { username } = useParams()
  const navigate = useNavigate()
  const user = getSession()

  const [coursesData, setCoursesData] = useState([])

  // Хук для определения брейкпоинтов
  const breakpoints = Grid.useBreakpoint()
  // Если экран уже md — считаем "десктопом", иначе — "мобильным".
  const isMobile = !breakpoints.md

  useEffect(() => {
    const courses = getAllCourses()
    if (!courses || courses.length === 0) {
      message.error('Курсы не найдены')
      navigate('/students')
      return
    }

    // Проверка прав (если студент и пытается смотреть чужую страницу)
    if (user?.role === 'student' && username !== user?.username) {
      message.error('Нет прав для просмотра профиля другого студента')
      navigate('/students')
      return
    }

    // Отбираем все курсы, где данный студент есть в participants
    const studentCourses = courses.filter((course) => (course.participants || []).includes(username))

    // Для каждого курса находим последнюю работу и оценку
    const detailed = studentCourses.map((course) => {
      const { submissions = [], title, id } = course
      const studentSubs = submissions.filter((sub) => sub.studentId === username)

      // Если нет работ, пишем "Нет оценок"
      if (studentSubs.length === 0) {
        return {
          courseId: id,
          courseTitle: title,
          grade: 'Нет оценок',
          submissionsCount: 0,
        }
      }

      // Берём последнюю работу
      const lastSubmission = studentSubs[studentSubs.length - 1]
      const rawGrade = lastSubmission?.grade

      let finalGrade = 'Нет оценок'
      if (rawGrade) {
        const intGrade = parseInt(rawGrade, 10)
        finalGrade = isNaN(intGrade) ? 'Нет оценок' : intGrade
      }

      return {
        courseId: id,
        courseTitle: title,
        grade: finalGrade,
        submissionsCount: studentSubs.length,
      }
    })

    setCoursesData(detailed)
  }, [username, user?.role, navigate])

  // Если нет курсов
  if (coursesData.length === 0) {
    return (
      <div style={{ padding: 16 }}>
        <h2>Студент: {username}</h2>
        <p>Не найдено курсов, на которые записан данный студент</p>
      </div>
    )
  }

  // Колонки таблицы для десктопной версии
  const columns = [
    {
      title: 'Курс',
      dataIndex: 'courseTitle',
      key: 'courseTitle',
    },
    {
      title: 'Сдано работ',
      dataIndex: 'submissionsCount',
      key: 'submissionsCount',
    },
    {
      title: 'Оценка',
      dataIndex: 'grade',
      key: 'grade',
    },
  ]

  return (
    <div style={{ padding: 16 }}>
      <h2>Информация по студенту: {username}</h2>

      {/* Рендерим либо таблицу, либо список, в зависимости от isMobile */}
      {isMobile ? (
        <List
          dataSource={coursesData}
          renderItem={(item, idx) => (
            <List.Item key={`${item.courseId}-${idx}`}>
              <List.Item.Meta
                title={
                  <div>
                    <strong>Курс:</strong> {item.courseTitle}
                  </div>
                }
                description={
                  <div>
                    <div>
                      <strong>Сдано работ:</strong> {item.submissionsCount}
                    </div>
                    <div>
                      <strong>Оценка:</strong> {item.grade}
                    </div>
                  </div>
                }
              />
            </List.Item>
          )}
        />
      ) : (
        <Table
          columns={columns}
          dataSource={coursesData.map((item, idx) => ({
            key: `${item.courseId}-${idx}`,
            ...item,
          }))}
          pagination={false}
        />
      )}
    </div>
  )
}
