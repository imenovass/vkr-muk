// pages/TeacherZonePage/ui/AssignmentsPage.jsx
import React, { useEffect, useState } from 'react'

import { Button, DatePicker, Form, Input, Modal, Table } from 'antd'

import {
  createAssignment,
  deleteAssignment,
  getAllAssignments,
} from '../../../entities/assignment/model/assignmentStorage'
import { getAllCourses } from '../../../entities/course/model/courseStorage'

export const AssignmentsPage = () => {
  const [assignments, setAssignments] = useState([])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [courses, setCourses] = useState([])
  const [form] = Form.useForm()

  useEffect(() => {
    setAssignments(getAllAssignments())
    setCourses(getAllCourses())
  }, [])

  const columns = [
    {
      title: 'Курс',
      dataIndex: 'courseId',
      key: 'courseId',
    },
    {
      title: 'Название',
      dataIndex: 'title',
      key: 'title',
    },
    {
      title: 'Срок сдачи',
      dataIndex: 'dueDate',
      key: 'dueDate',
    },
    {
      title: 'Действия',
      key: 'actions',
      render: (text, record) => (
        <Button danger onClick={() => handleDelete(record.id)}>
          Удалить
        </Button>
      ),
    },
  ]

  const handleDelete = (id) => {
    deleteAssignment(id)
    setAssignments(getAllAssignments())
  }

  const openModal = () => setIsModalOpen(true)
  const closeModal = () => {
    setIsModalOpen(false)
    form.resetFields()
  }

  const handleSave = () => {
    form.validateFields().then((values) => {
      const { courseId, title, description, dueDate } = values
      createAssignment({
        courseId,
        title,
        description,
        dueDate: dueDate.format('YYYY-MM-DD'),
      })
      setAssignments(getAllAssignments())
      closeModal()
    })
  }

  return (
    <div>
      <Button type="primary" onClick={openModal} style={{ marginBottom: 16 }}>
        Создать задание
      </Button>
      <Table columns={columns} dataSource={assignments} rowKey="id" />

      <Modal title="Создать задание" visible={isModalOpen} onCancel={closeModal} onOk={handleSave}>
        <Form form={form} layout="vertical">
          <Form.Item label="Курс" name="courseId" rules={[{ required: true, message: 'Выберите курс' }]}>
            <select style={{ width: '100%', padding: 8 }}>
              <option value="">-- Выберите курс --</option>
              {courses.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.title} (ID {c.id})
                </option>
              ))}
            </select>
          </Form.Item>
          <Form.Item label="Название" name="title" rules={[{ required: true, message: 'Введите название' }]}>
            <Input />
          </Form.Item>
          <Form.Item label="Описание" name="description">
            <Input.TextArea />
          </Form.Item>
          <Form.Item label="Срок сдачи" name="dueDate" rules={[{ required: true, message: 'Укажите срок сдачи' }]}>
            <DatePicker format="YYYY-MM-DD" style={{ width: '100%' }} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}
