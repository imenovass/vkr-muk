import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button, Card, Modal, Form, Input, notification } from "antd";
import {
    getCourseById,
    deleteCourse,
    updateCourse,
} from "../../../entities/course/model/courseStorage";
import { getSession } from "../../../features/auth/model/session";

export const CourseDetailPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const user = getSession();

    const [course, setCourse] = useState(null);

    // Модалка для редактирования
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [form] = Form.useForm();

    useEffect(() => {
        const data = getCourseById(id);
        if (!data) {
            // Если курс не найден, уходим на /courses
            navigate("/courses");
            return;
        }
        setCourse(data);
    }, [id, navigate]);

    if (!course) {
        return null;
    }

    // Удаление курса (только преподаватель)
    const handleDelete = () => {
        deleteCourse(course.id);
        notification.success({ message: "Курс удалён" });
        navigate("/courses");
    };

    // Открыть модалку для редактирования
    const openEditModal = () => {
        setIsModalOpen(true);
        // Заполнить форму текущими данными
        form.setFieldsValue({
            title: course.title,
            description: course.description,
        });
    };

    // Закрыть модалку
    const handleCancel = () => {
        setIsModalOpen(false);
        form.resetFields();
    };

    // Сохранить (обработчик формы)
    const handleFinish = (values) => {
        try {
            // Вызываем updateCourse из локального хранилища
            const updated = updateCourse(course.id, {
                title: values.title,
                description: values.description,
            });
            // Обновляем локальный state
            setCourse(updated);
            notification.success({ message: "Курс успешно обновлён" });
            handleCancel();
        } catch (error) {
            notification.error({ message: "Ошибка при обновлении курса" });
            console.error(error);
        }
    };

    return (
        <div style={{ maxWidth: 600 }}>
            <Card title={course.title}>
                <p>{course.description}</p>
                <p>Teacher ID: {course.teacherId}</p>

                {user?.role === "teacher" && (
                    <div style={{ marginTop: "16px" }}>
                        <Button type="primary" onClick={openEditModal} style={{ marginRight: 8 }}>
                            Редактировать
                        </Button>
                        <Button danger onClick={handleDelete}>
                            Удалить
                        </Button>
                    </div>
                )}
            </Card>

            {/* Модальное окно для редактирования */}
            <Modal
                title="Редактировать курс"
                open={isModalOpen}
                onCancel={handleCancel}
                onOk={() => form.submit()} // При нажатии "ОК" сабмитим форму
            >
                <Form
                    form={form}
                    layout="vertical"
                    onFinish={handleFinish}
                    // Можно добавить onFinishFailed если хотите обработать ошибки валидации
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
                </Form>
            </Modal>
        </div>
    );
};
