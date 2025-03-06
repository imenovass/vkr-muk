// pages/NewsPage/ui/NewsPage.jsx

import React, { useEffect, useState } from "react";
import { Button, Card, Modal, Form, Input, notification } from "antd";
import { getSession } from "../../../features/auth/model/session";
import {
    getAllNews,
    createNews,
    updateNews,
    deleteNews,
} from "../../../entities/news/model/newsStorage";

// Импорт SASS (проверьте, что у вас настроен loader)
import "./NewsPage.scss";

export const NewsPage = () => {
    const user = getSession(); // { login, role, fullName, ... }
    const [newsList, setNewsList] = useState([]);

    // --- Модалка "Создать новость" ---
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [createForm] = Form.useForm();

    // --- Модалка "Редактировать новость" ---
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editForm] = Form.useForm();
    const [editingNewsId, setEditingNewsId] = useState(null);

    useEffect(() => {
        const list = getAllNews();
        setNewsList(list); // уже отсортированное или нет — можно, например, list.sort(...)
    }, []);

    // -------------------------------
    // СОЗДАНИЕ
    // -------------------------------
    const openCreateModal = () => {
        setIsCreateModalOpen(true);
        createForm.resetFields();
    };

    const handleCancelCreate = () => {
        setIsCreateModalOpen(false);
        createForm.resetFields();
    };

    const handleCreateFinish = (values) => {
        try {
            const newPost = createNews({
                author: user.fullName || user.login,
                role: user.role,
                title: values.title,
                content: values.content,
                createdAt: new Date().toISOString(),
            });
            setNewsList((prev) => [newPost, ...prev]);
            notification.success({ message: "Новость опубликована!" });
            handleCancelCreate();
        } catch (error) {
            notification.error({ message: "Ошибка при создании новости" });
            console.error(error);
        }
    };

    // -------------------------------
    // РЕДАКТИРОВАНИЕ
    // -------------------------------
    const openEditModal = (post) => {
        setEditingNewsId(post.id);
        setIsEditModalOpen(true);
        editForm.setFieldsValue({
            title: post.title,
            content: post.content,
        });
    };

    const handleCancelEdit = () => {
        setIsEditModalOpen(false);
        setEditingNewsId(null);
        editForm.resetFields();
    };

    const handleEditFinish = (values) => {
        try {
            const updated = updateNews(editingNewsId, {
                title: values.title,
                content: values.content,
            });
            setNewsList((prev) =>
                prev.map((item) => (item.id === editingNewsId ? updated : item))
            );
            notification.success({ message: "Новость отредактирована!" });
            handleCancelEdit();
        } catch (error) {
            notification.error({ message: "Ошибка при редактировании новости" });
            console.error(error);
        }
    };

    // -------------------------------
    // УДАЛЕНИЕ
    // -------------------------------
    const handleDelete = (postId) => {
        try {
            deleteNews(postId);
            setNewsList((prev) => prev.filter((item) => item.id !== postId));
            notification.success({ message: "Новость удалена!" });
        } catch (error) {
            notification.error({ message: "Ошибка при удалении новости" });
            console.error(error);
        }
    };

    return (
        <div className="newsContainer">
            <h2>Новости</h2>

            {user?.role === "teacher" && (
                <Button
                    type="primary"
                    style={{ marginBottom: 16 }}
                    onClick={openCreateModal}
                >
                    Создать новость
                </Button>
            )}

            <div className="newsList">
                {newsList.map((post) => (
                    <div className="newsCard" key={post.id}>
                        <Card>
                            <div className="newsMeta">
                                Автор: <b>{post.author}</b> |{" "}
                                {new Date(post.createdAt).toLocaleString()}
                            </div>
                            <div className="newsTitle">{post.title}</div>
                            <div className="newsContent">{post.content}</div>

                            {user?.role === "teacher" && (
                                <div style={{textAlign: "right", marginTop: 8}}>
                                    <Button
                                        type="link"
                                        onClick={() => openEditModal(post)}
                                        style={{marginRight: 8}}
                                    >
                                        Редактировать
                                    </Button>
                                    <Button danger type="link" onClick={() => handleDelete(post.id)}>
                                        Удалить
                                    </Button>
                                </div>
                            )}
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
                <Form form={createForm} layout="vertical" onFinish={handleCreateFinish}>
                    <Form.Item
                        label="Заголовок"
                        name="title"
                        rules={[{ required: true, message: "Введите заголовок новости" }]}
                    >
                        <Input />
                    </Form.Item>
                    <Form.Item
                        label="Содержание"
                        name="content"
                        rules={[{ required: true, message: "Введите текст новости" }]}
                    >
                        <Input.TextArea rows={4} />
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
                <Form form={editForm} layout="vertical" onFinish={handleEditFinish}>
                    <Form.Item
                        label="Заголовок"
                        name="title"
                        rules={[{ required: true, message: "Введите заголовок новости" }]}
                    >
                        <Input />
                    </Form.Item>
                    <Form.Item
                        label="Содержание"
                        name="content"
                        rules={[{ required: true, message: "Введите текст новости" }]}
                    >
                        <Input.TextArea rows={4} />
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};
