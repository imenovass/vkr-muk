import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { Button, Card, Col, Form, Input, Modal, Row, notification } from 'antd'

import { createCourse, getAllCourses, saveAllCourses, updateCourse } from '../../../entities/course/model/courseStorage'
import { getSession } from '../../../features/auth/model/session'
import './styles.scss'

export const CoursesPage = () => {
  const navigate = useNavigate()
  const user = getSession()
  const [courses, setCourses] = useState([])

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [createForm] = Form.useForm()

  useEffect(() => {
    // 1. Считываем курсы из localStorage
    let data = getAllCourses()

    // 2. Если данных нет, добавляем стартовые курсы
    if (data.length === 0) {
      const defaultCourses = [
        {
          id: '1',
          title: 'Математика',
          description:
            'Изучаем числа, формулы, функции и методы решения задач — всё, что нужно для науки, техники и современных технологий!',
          teacherId: 'teacher',
          participants: [],
          materials: [],
          submissions: [],
          url: '',
          createdAt: new Date().toISOString(),
        },
        {
          id: '2',
          title: 'Физика',
          description:
            'Изучаем движение, силы, энергию, волны, электричество и многое другое. Основа для технических и инженерных специальностей!',
          teacherId: 'teacher',
          participants: [],
          materials: [],
          submissions: [],
          url: '',
          createdAt: new Date().toISOString(),
        },
        {
          id: '3',
          title: 'Программная инженерия',
          description:
            'Узнаем как создавать качественное, надёжное и масштабируемое программное обеспечение. Изучаем полный цикл разработки, современные подходы (Agile, DevOps), проектирование, тестирование и командную работу.',
          teacherId: 'teacher',
          participants: [],
          materials: [],
          submissions: [],
          url: '',
          createdAt: new Date().toISOString(),
        },
        {
          id: '4',
          title: 'Английский язык',
          description:
            'Развиваем навыки чтения, письма, аудирования и разговорной речи. Учим язык — открываем мир!',
          teacherId: 'teacher',
          participants: [],
          materials: [],
          submissions: [],
          url: '',
          createdAt: new Date().toISOString(),
        },
      ]

      // 3. Сохраняем стартовые курсы
      saveAllCourses(defaultCourses)
      data = defaultCourses
    }

    // 4. Кладём в стейт
    setCourses(data)
  }, [])


  // Разделяем курсы на "мои" и "другие"
  let myCourses = []
  let otherCourses = []

  if (user?.role === 'teacher') {
    myCourses = courses.filter((c) => c.teacherId === user.username)
    otherCourses = courses.filter((c) => c.teacherId !== user.username)
  } else if (user?.role === 'student') {
    myCourses = courses.filter((c) => c.participants.includes(user.username))
    otherCourses = courses.filter((c) => !c.participants.includes(user.username))
  }

  // -----------------------
  // CREATE (teacher)
  // -----------------------
  const openCreateModal = () => {
    setIsCreateModalOpen(true)
    createForm.resetFields()
  }
  const handleCancelCreate = () => {
    setIsCreateModalOpen(false)
    createForm.resetFields()
  }
  const handleCreateCourse = () => {
    createForm.validateFields().then((values) => {
      const { title, description } = values
      const newCourse = createCourse({
        title,
        description,
        teacherId: user.username,
        participants: [],
        createdAt: new Date().toISOString(),
      })
      setCourses((prev) => [newCourse, ...prev])
      notification.success({ message: 'Курс успешно создан!' })
      handleCancelCreate()
    })
  }

  // -----------------------
  // JOIN COURSE (student)
  // -----------------------
  const handleJoinCourse = (courseId) => {
    const course = courses.find((c) => c.id === courseId)
    if (!course) return
    if (!course.participants.includes(user.username)) {
      const updatedParticipants = [...course.participants, user.username]
      // Обновим в хранилище
      const updated = updateCourse(courseId, {
        participants: updatedParticipants,
      })
      // Локально заменим объект
      setCourses((prev) => prev.map((c) => (c.id === courseId ? updated : c)))
      notification.success({ message: 'Вы записались на курс' })
    }
  }

  // -----------------------
  // Переход на детальную страницу
  // -----------------------
  const goToDetail = (courseId) => {
    navigate(`/courses/${courseId}`)
  }

  const renderMyCourseCard = (course) => {
    return (
      <Col key={course.id} xs={24} sm={12} md={8} lg={6} style={{ marginBottom: 16 }}>
        <Card
          className="course-card"
          title={course.title}
          hoverable
          onClick={() => goToDetail(course.id)}
        >
          <div className="course-card-content">
            <div className="course-description">{course.description}</div>


            {user.role === 'student' && course.participants.includes(user.username) && (
              <p className="course-status">Вы участвуете в курсе</p>
            )}
          </div>
        </Card>

      </Col>
  )
  }

  const renderOtherCourseCard = (course) => {
    return (
      <Col key={course.id} xs={24} sm={12} md={8} lg={6} style={{ marginBottom: 16 }}>
        <Card
          className="course-card"
          title={course.title}
          hoverable={false}
        >
          <div className="course-card-content">
          <div className="course-description">{course.description}</div>

          {user.role === 'student' && !course.participants.includes(user.username) && (
            <Button type="primary" block size="small" onClick={() => handleJoinCourse(course.id)}>
              Записаться
            </Button>
          )}
          </div>
        </Card>

      </Col>
    )
  }

  return (
    <div style={{ padding: 16 }}>
      <h2>Курсы</h2>

      {user?.role === 'teacher' && (
        <Button type="primary" style={{ marginBottom: 16 }} onClick={openCreateModal}>
          Создать курс
        </Button>
      )}

      <h3>Мои курсы</h3>
      {myCourses.length === 0 ? (
        <p>Нет курсов</p>
      ) : (
        <Row gutter={[16, 16]}>{myCourses.map((course) => renderMyCourseCard(course))}</Row>
      )}

      {/* Другие курсы */}
      <h3 style={{ marginTop: 32 }}>Другие курсы</h3>
      {otherCourses.length === 0 ? (
        <p>Нет курсов</p>
      ) : (
        <Row gutter={[16, 16]}>{otherCourses.map((course) => renderOtherCourseCard(course))}</Row>
      )}

      {/* Модалка: Создать курс */}
      <Modal title="Создать курс" open={isCreateModalOpen} onCancel={handleCancelCreate} onOk={handleCreateCourse}>
        <Form layout="vertical" form={createForm}>
          <Form.Item label="Название курса" name="title" rules={[{ required: true, message: 'Введите название' }]}>
            <Input />
          </Form.Item>
          <Form.Item
            label="Описание курса"
            name="description"
            rules={[{ required: true, message: 'Введите описание' }]}
          >
            <Input.TextArea rows={3} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}
