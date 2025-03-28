import React, { useEffect, useState } from "react";
import { Card, Button, Modal, Form, Input, notification } from "antd";
import { getSession } from "../../../features/auth/model/session";
import { pb } from "../../../shared/config/pb"; // наш клиент PocketBase

export const ProfilePage = () => {
    const [user, setUser] = useState(null);

    // --- Создание студента (только для преподавателя)
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [form] = Form.useForm();

    useEffect(() => {
        // Получаем текущего авторизованного пользователя из localStorage
        // (здесь user может содержать { id, username, role, token } и т.д.)
        const sessionUser = getSession();
        if (sessionUser) {
            setUser(sessionUser);
        }
    }, []);

    if (!user) {
        return <div>Загрузка...</div>;
    }

    // ---------------------------
    // Открыть модалку "Добавить студента"
    // ---------------------------
    const openCreateStudentModal = () => {
        setIsModalOpen(true);
        form.resetFields();
    };

    // Закрытие модалки
    const handleCancel = () => {
        setIsModalOpen(false);
        form.resetFields();
    };

    // Сабмит формы: создать студента в PocketBase
    const handleCreateStudent = async (values) => {
        const { username, password } = values;
        try {
            // Создаём запись в вашей Auth Collection (назовём "users2")
            // role = "student"
            await pb.collection("users2").create({
                username,
                password,
                passwordConfirm: password,
                role: "student",
            });
            notification.success({ message: "Студент успешно создан!" });
            handleCancel();
        } catch (error) {
            console.error("Ошибка при создании студента:", error);
            notification.error({ message: "Не удалось создать студента" });
        }
    };

    return (
        <div style={{ maxWidth: 600 }}>
            <Card title="Мой профиль">
                <p>
                    <b>Логин:</b> {user.username}
                </p>
                <p>
                    <b>Роль:</b> {user.role}
                </p>

                {/* Кнопка "Создать студента" только для учителя */}
                {user.role === "teacher" && (
                    <Button type="primary" onClick={openCreateStudentModal}>
                        Создать студента
                    </Button>
                )}
            </Card>

            {/* Модальное окно для создания студента */}
            <Modal
                title="Создать аккаунт студента"
                open={isModalOpen}
                onCancel={handleCancel}
                onOk={() => form.submit()} // Тригерим сабмит формы
            >
                <Form
                    form={form}
                    layout="vertical"
                    onFinish={handleCreateStudent}
                >
                    <Form.Item
                        label="Логин студента"
                        name="username"
                        rules={[{ required: true, message: "Введите логин" }]}
                    >
                        <Input />
                    </Form.Item>
                    <Form.Item
                        label="Пароль"
                        name="password"
                        rules={[{ required: true, message: "Введите пароль" }]}
                    >
                        <Input.Password />
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};
