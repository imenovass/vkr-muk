import React, { useEffect, useState } from "react";
import { Table, Button, Modal, Form, Input, notification } from "antd";
import { useNavigate } from "react-router-dom";
import { getSession } from "../../../features/auth/model/session";
import {
    getAllCourses,
    createCourse,
} from "../../../entities/course/model/courseStorage";

export const CoursesPage = () => {
    const navigate = useNavigate();
    const user = getSession();
    const [courses, setCourses] = useState([]);

    // Модалка для создания курса
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [form] = Form.useForm();

    useEffect(() => {
        let data = getAllCourses();
        // Сортируем курсы (новые сверху)
        data = data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        setCourses(data);
    }, []);

    const columns = [
        {
            title: "Изображение",
            dataIndex: "imageUrl",
            key: "imageUrl",
            width: 70,
            render: (url, record) => {
                // Используем другую заглушку
                const defaultImage = "https://placehold.co/50x50?text=No+Image";
                const imageSrc = url || defaultImage;
                return (
                    <img
                        src={imageSrc}
                        alt={record.title}
                        style={{ width: 50, height: 50, objectFit: "cover", borderRadius: "50%" }}
                    />
                );
            },
        },
        {
            title: "Название",
            dataIndex: "title",
            key: "title",
        },
        {
            title: "Описание",
            dataIndex: "description",
            key: "description",
        },
        {
            title: "Действия",
            key: "actions",
            render: (text, record) => (
                <Button type="link" onClick={() => navigate(`/courses/${record.id}`)}>
                    Открыть
                </Button>
            ),
        },
    ];

    // Открытие модалки
    const handleOpenModal = () => {
        setIsModalOpen(true);
    };

    // Закрыть модалку
    const handleCancel = () => {
        setIsModalOpen(false);
        form.resetFields();
    };

    // Успешная валидация формы -> создание курса
    const handleFinish = async (values) => {
        try {
            const { title, description, imageUrl } = values;
            // При создании добавляем поле createdAt
            const newCourse = createCourse({
                title,
                description,
                teacherId: user.login,
                createdAt: new Date().toISOString(),
                imageUrl,
            });

            // Добавляем новый курс в список и сортируем заново
            setCourses((prev) => {
                const updated = [...prev, newCourse];
                return updated.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
            });

            // Уведомление об успехе
            notification.success({ message: "Курс успешно создан!" });

            // Закрываем модалку
            handleCancel();
        } catch (error) {
            console.error(error);
            notification.error({ message: "Ошибка при создании курса" });
        }
    };

    // Ошибка валидации
    const handleFinishFailed = (errorInfo) => {
        console.log("Validation Failed:", errorInfo);
    };

    return (
        <div>
            <h2>Список курсов</h2>

            {user?.role === "teacher" && (
                <Button type="primary" onClick={handleOpenModal} style={{ marginBottom: 16 }}>
                    Добавить курс
                </Button>
            )}

            <Table
                rowKey="id"
                columns={columns}
                dataSource={courses}
                pagination={false}
            />

            <Modal
                title="Добавить курс"
                open={isModalOpen}
                onCancel={handleCancel}
                onOk={() => form.submit()}
            >
                <Form
                    form={form}
                    layout="vertical"
                    onFinish={handleFinish}
                    onFinishFailed={handleFinishFailed}
                >
                    <Form.Item
                        label="Название курса"
                        name="title"
                        rules={[{ required: true, message: "Введите название курса" }]}
                    >
                        <Input />
                    </Form.Item>
                    <Form.Item
                        label="Описание"
                        name="description"
                        rules={[{ required: true, message: "Введите описание курса" }]}
                    >
                        <Input.TextArea rows={3} />
                    </Form.Item>
                    <Form.Item
                        label="Ссылка на изображение (необязательно)"
                        name="imageUrl"
                        rules={[
                            {
                                type: "url",
                                message: "Введите корректную ссылку на изображение (URL)",
                            },
                        ]}
                    >
                        <Input placeholder="https://example.com/image.jpg" />
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};
