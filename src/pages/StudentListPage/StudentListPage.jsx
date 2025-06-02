import React, { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { Button, Card, Col, Row, message } from 'antd'

import { getSession } from '../../features/auth/model/session'
import { pb } from '../../shared/config/pb'

export const StudentListPage = () => {
  const [students, setStudents] = useState([])
  const navigate = useNavigate()
  const user = getSession()

  useEffect(() => {
    pb.collection('users2')
      .getList(1, 50, { filter: 'role="student"' })
      .then((pageData) => {
        setStudents(pageData.items)
      })
      .catch((err) => {
        console.error('Ошибка при получении списка студентов:', err)
        message.error('Не удалось загрузить список студентов')
      })
  }, [])

  const memoizedStudents = useMemo(() => {
    return [...students].sort((a, b) => a.username.localeCompare(b.username))
  }, [students])

  const majors = [
    'Программная инженерия',
    'Кибербезопасность',
    'Искусственный интеллект',
    'Информационные системы',
    'Веб-разработка',
  ]

  const years = ['1 курс', '2 курс', '3 курс', '4 курс']

  const projects = [
    'Сайт онлайн-библиотеки',
    'Система бронирования комнат',
    'Калькулятор расходов',
    'Сайт-портфолио',
    'Прототип онлайн-магазина',
  ]

  const interests = [
    'Frontend-разработка',
    'Backend-разработка',
    'Data Science',
    'UI/UX дизайн',
    'DevOps',
    'QA-инженерия',
  ]

  const getRandomItem = (arr) => arr[Math.floor(Math.random() * arr.length)]

  const getMockStudentData = () => ({
    major: getRandomItem(majors),
    year: getRandomItem(years),
    project: getRandomItem(projects),
    gpa: (Math.random() * (4 - 2.5) + 2.5).toFixed(2),
    interest: getRandomItem(interests),
  })

  if (memoizedStudents.length === 0) {
    return <div style={{ padding: 16 }}>Студенты не найдены</div>
  }

  return (
    <div style={{ padding: 16 }}>
      <h2>Список студентов</h2>
      <Row gutter={[16, 16]}>
        {memoizedStudents.map((student) => {
          const mock = getMockStudentData()

          return (
            <Col key={student.id} xs={24} sm={12} md={8} lg={6}>
              <Card
                title={<span style={{ fontSize: '16px', fontWeight: 600 }}>{student.username}</span>}
                style={{
                  width: '100%',
                  height: 280,
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  fontSize: '13px',
                }}
                bodyStyle={{ flexGrow: 1, padding: '12px 16px' }}
                actions={
                    student.username === user.username
                      ? [
                          <Button
                            type="link"
                            style={{ fontSize: "13px" }}
                            onClick={() => navigate(`/students/${student.username}`)}
                          >
                              Подробнее
                          </Button>,
                      ]
                      : []
                }

              >
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', flexGrow: 1 }}>
                  <p style={{ margin: 0 }}>
                    <strong>Специальность:</strong> {mock.major}
                  </p>
                  <p style={{ margin: 0 }}>
                    <strong>Курс:</strong> {mock.year}
                  </p>
                  <p style={{ margin: 0 }}>
                    <strong>Проект:</strong> {mock.project}
                  </p>
                  <p style={{ margin: 0 }}>
                    <strong>GPA:</strong> {mock.gpa}
                  </p>
                  <p style={{ margin: 0 }}>
                    <strong>Интерес:</strong> {mock.interest}
                  </p>
                </div>
              </Card>
            </Col>
          )
        })}
      </Row>
    </div>
  )
}
