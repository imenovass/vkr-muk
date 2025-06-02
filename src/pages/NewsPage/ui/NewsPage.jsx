import React, { useEffect, useState } from 'react'

import { PlusOutlined } from '@ant-design/icons'
import { Button, Card, Form, Input, Modal, Upload, notification } from 'antd'

import { createNews, deleteNews, getAllNews, updateNews } from '../../../entities/news/model/newsStorage'
import { getSession } from '../../../features/auth/model/session'

import './NewsPage.scss'
import { getBase64 } from './utils'

export const NewsPage = () => {
  const user = getSession() // { login, role, fullName, ... }
  const [newsList, setNewsList] = useState([])
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [createForm] = Form.useForm()
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [editForm] = Form.useForm()
  const [editingNewsId, setEditingNewsId] = useState(null)

  useEffect(() => {
    const list = getAllNews()
    setNewsList(list)
  }, [])

  // ОТКРЫТЬ/ЗАКРЫТЬ создание
  const openCreateModal = () => {
    setIsCreateModalOpen(true)
    createForm.resetFields()
  }

  const handleCancelCreate = () => {
    setIsCreateModalOpen(false)
    createForm.resetFields()
  }

  // ОТКРЫТЬ/ЗАКРЫТЬ редактирование
  const openEditModal = (post) => {
    setEditingNewsId(post.id)
    setIsEditModalOpen(true)

    // Подставляем начальные значения в форму
    editForm.setFieldsValue({
      title: post.title,
      content: post.content,
      // Для Upload нужно сформировать массив fileList
      image: post.image
        ? [
            {
              uid: '-1',
              name: 'news-image',
              status: 'done',
              url: post.image, // base64 либо какая-то ссылка
            },
          ]
        : [],
    })
  }

  const handleCancelEdit = () => {
    setIsEditModalOpen(false)
    setEditingNewsId(null)
    editForm.resetFields()
  }

  // -------------------------------
  // СОЗДАНИЕ
  // -------------------------------
  // Вызывается при сабмите формы "Создать"
  const handleCreateFinish = async (values) => {
    try {
      // Получим Base64-изображение из Upload (если загружено)
      let imageBase64 = ''
      if (values.image && values.image.length > 0) {
        const fileObj = values.image[0].originFileObj
        imageBase64 = await getBase64(fileObj)
      }

      const newPost = createNews({
        author: user.fullName || user.login,
        role: user.role,
        title: values.title,
        content: values.content,
        createdAt: new Date().toISOString(),
        image: imageBase64,
      })
      setNewsList((prev) => [newPost, ...prev])
      notification.success({ message: 'Новость опубликована!' })
      handleCancelCreate()
    } catch (error) {
      notification.error({ message: 'Ошибка при создании новости' })
      console.error(error)
    }
  }

  // -------------------------------
  // РЕДАКТИРОВАНИЕ
  // -------------------------------
  // Вызывается при сабмите формы "Редактировать"
  const handleEditFinish = async (values) => {
    try {
      let imageBase64 = ''
      if (values.image && values.image.length > 0) {
        const fileObj = values.image[0].originFileObj
        imageBase64 = await getBase64(fileObj)
      }

      const updated = updateNews(editingNewsId, {
        title: values.title,
        content: values.content,
        image: imageBase64,
      })
      setNewsList((prev) => prev.map((item) => (item.id === editingNewsId ? updated : item)))
      notification.success({ message: 'Новость отредактирована!' })
      handleCancelEdit()
    } catch (error) {
      notification.error({ message: 'Ошибка при редактировании новости' })
      console.error(error)
    }
  }

  // -------------------------------
  // УДАЛЕНИЕ
  // -------------------------------
  const handleDelete = (postId) => {
    try {
      deleteNews(postId)
      setNewsList((prev) => prev.filter((item) => item.id !== postId))
      notification.success({ message: 'Новость удалена!' })
    } catch (error) {
      notification.error({ message: 'Ошибка при удалении новости' })
      console.error(error)
    }
  }

  // Функция для удобного преобразования Upload-события в нужный формат
  const normFile = (e) => {
    if (Array.isArray(e)) {
      return e
    }
    return e?.fileList
  }

  return (
    <div className="newsContainer">
      <h2>Новости</h2>

      {user?.role === 'teacher' && (
        <Button type="primary" style={{ marginBottom: 16 }} onClick={openCreateModal}>
          Создать новость
        </Button>
      )}

      <div className="newsList">
        {newsList.map((post) => (
          <div className="newsCard" key={post.id}>
            <Card>
              <div className="newsMeta content">
                Автор: <b>{post.author}</b> | {new Date(post.createdAt).toLocaleString()}
              </div>
              {post.image && (
                <div>
                  <img src={post.image} alt="изображение новости" className="newsImage" />
                </div>
              )}

              <div className="content">
                <div className="newsTitle">{post.title}</div>
                <div className="newsContent">{post.content}</div>

                {user?.role === 'teacher' && (
                  <div style={{ textAlign: 'right', marginTop: 8 }}>
                    <Button type="link" onClick={() => openEditModal(post)} style={{ marginRight: 8 }}>
                      Редактировать
                    </Button>
                    <Button danger type="link" onClick={() => handleDelete(post.id)}>
                      Удалить
                    </Button>
                  </div>
                )}
              </div>
            </Card>
          </div>
        ))}
      </div>

      {/* Модалка: Создание */}
      <Modal
        title="Создать новость"
        open={isCreateModalOpen}
        onCancel={handleCancelCreate}
        onOk={() => createForm.submit()}
      >
        <Form form={createForm} layout="vertical" onFinish={handleCreateFinish} name="createNewsForm">
          <Form.Item label="Заголовок" name="title" rules={[{ required: true, message: 'Введите заголовок новости' }]}>
            <Input />
          </Form.Item>
          <Form.Item label="Содержание" name="content" rules={[{ required: true, message: 'Введите текст новости' }]}>
            <Input.TextArea rows={4} />
          </Form.Item>

          {/* Поле для загрузки картинки */}
          <Form.Item label="Фото (одно)" name="image" valuePropName="fileList" getValueFromEvent={normFile}>
            <Upload
              listType="picture-card"
              maxCount={1}
              beforeUpload={() => false} // чтобы не отправляло файл на сервер автоматически
            >
              <div>
                <PlusOutlined />
                <div style={{ marginTop: 8 }}>Загрузить</div>
              </div>
            </Upload>
          </Form.Item>
        </Form>
      </Modal>

      {/* Модалка: Редактирование */}
      <Modal
        title="Редактировать новость"
        open={isEditModalOpen}
        onCancel={handleCancelEdit}
        onOk={() => editForm.submit()}
      >
        <Form form={editForm} layout="vertical" onFinish={handleEditFinish} name="editNewsForm">
          <Form.Item label="Заголовок" name="title" rules={[{ required: true, message: 'Введите заголовок новости' }]}>
            <Input />
          </Form.Item>
          <Form.Item label="Содержание" name="content" rules={[{ required: true, message: 'Введите текст новости' }]}>
            <Input.TextArea rows={4} />
          </Form.Item>

          <Form.Item label="Фото (одно)" name="image" valuePropName="fileList" getValueFromEvent={normFile}>
            <Upload listType="picture-card" maxCount={1} beforeUpload={() => false}>
              <div>
                <PlusOutlined />
                <div style={{ marginTop: 8 }}>Загрузить</div>
              </div>
            </Upload>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}
