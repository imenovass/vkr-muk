// pages/ProfilePage/ui/ProfilePage.jsx
import React, { useEffect, useState } from "react";
import { Card, Button, Modal, Form, Input } from "antd";
import { getSession, setSession } from "../../../features/auth/model/session";
import { getUserByLogin, updateUser } from "../../../entities/user/model/usersStorage";

export const ProfilePage = () => {
    const [user, setUser] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Форма редактирования
    const [form] = Form.useForm();

    useEffect(() => {
        const sessionUser = getSession();
        if (!sessionUser) {
            // если нет - логика редиректа или return
            return;
        }
        // Загружаем из хранилища полную информацию (вдруг она изменилась)
        const fullUser = getUserByLogin(sessionUser.login);
        setUser(fullUser);
    }, []);

    if (!user) {
        return null;
    }

    const openModal = () => {
        setIsModalOpen(true);
        // Заполняем форму текущими данными
        form.setFieldsValue({
            fullName: user.fullName,
            password: user.password,
        });
    };

    const closeModal = () => {
        setIsModalOpen(false);
        form.resetFields();
    };

    const handleSave = () => {
        form.validateFields().then((values) => {
            const { fullName, password } = values;

            // Обновляем пользователя в localStorage
            const updated = updateUser(user.login, { fullName, password });
            // Обновим state
            setUser(updated);

            // Если мы изменили password, то логин остаётся тот же, но при повторном входе
            // нужно использовать новый пароль.
            // Также нужно обновить "currentUser" в session
            setSession(updated);

            closeModal();
        });
    };

    return (
        <div style={{ maxWidth: 600 }}>
            <Card title="Мой профиль">
                <p>
                    <b>Логин:</b> {user.login}
                </p>
                <p>
                    <b>Полное имя:</b> {user.fullName}
                </p>
                <p>
                    <b>Роль:</b> {user.role}
                </p>

                <Button type="primary" onClick={openModal}>
                    Редактировать
                </Button>
            </Card>

            <Modal
                title="Редактировать профиль"
                visible={isModalOpen}
                onCancel={closeModal}
                onOk={handleSave}
            >
                <Form form={form} layout="vertical">
                    <Form.Item
                        label="Полное имя"
                        name="fullName"
                        rules={[{ required: true, message: "Введите ваше имя" }]}
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
