// pages/TeacherZonePage/ui/TeacherZonePage.jsx
import React, { useEffect, useState } from "react";
import { Table, Button, Modal, Form, Input, Select } from "antd";
import { getSession } from "../../../features/auth/model/session";
import { useNavigate } from "react-router-dom";

import { getAllCourses } from "../../../entities/course/model/courseStorage";
import {
    getAllMaterials,
    createMaterial,
    deleteMaterial,
} from "../../../entities/material/model/materialStorage";

const { Option } = Select;

export const TeacherZonePage = () => {
    const sessionUser = getSession();
    const navigate = useNavigate();

    // Если пользователь не teacher, перенаправим на главную
    useEffect(() => {
        if (!sessionUser || sessionUser.role !== "teacher") {
            navigate("/");
        }
    }, [sessionUser, navigate]);

    const [materials, setMaterials] = useState([]);
    const [courses, setCourses] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [form] = Form.useForm();

    useEffect(() => {
        // Загрузим все материалы и курсы
        const mat = getAllMaterials();
        setMaterials(mat);

        const c = getAllCourses();
        setCourses(c);
    }, []);

    const columns = [
        {
            title: "Название",
            dataIndex: "title",
            key: "title",
        },
        {
            title: "Ссылка",
            dataIndex: "link",
            key: "link",
            render: (text) => (
                <a href={text} target="_blank" rel="noreferrer">
                    {text}
                </a>
            ),
        },
        {
            title: "ID курса",
            dataIndex: "courseId",
            key: "courseId",
        },
        {
            title: "Действия",
            key: "actions",
            render: (text, record) => (
                <Button danger onClick={() => handleDelete(record.id)}>
                    Удалить
                </Button>
            ),
        },
    ];

    const handleDelete = (id) => {
        deleteMaterial(id);
        setMaterials((prev) => prev.filter((m) => m.id !== id));
    };

    // Открыть модал для добавления материала
    const openModal = () => {
        setIsModalOpen(true);
    };

    // Закрыть
    const closeModal = () => {
        setIsModalOpen(false);
        form.resetFields();
    };

    // Сохранить
    const handleSave = () => {
        form.validateFields().then((values) => {
            const { title, link, courseId } = values;
            createMaterial({ title, link, courseId });
            setMaterials(getAllMaterials());
            closeModal();
        });
    };

    return (
        <div>
            <h2>Teacher Zone: Управление материалами</h2>
            <Button type="primary" onClick={openModal} style={{ marginBottom: 16 }}>
                Добавить материал
            </Button>

            <Table columns={columns} dataSource={materials} rowKey="id" />

            <Modal
                title="Добавить материал"
                visible={isModalOpen}
                onCancel={closeModal}
                onOk={handleSave}
            >
                <Form form={form} layout="vertical">
                    <Form.Item
                        label="Название"
                        name="title"
                        rules={[{ required: true, message: "Введите название" }]}
                    >
                        <Input />
                    </Form.Item>
                    <Form.Item
                        label="Ссылка"
                        name="link"
                        rules={[{ required: true, message: "Введите ссылку" }]}
                    >
                        <Input />
                    </Form.Item>
                    <Form.Item
                        label="Курс"
                        name="courseId"
                        rules={[{ required: true, message: "Выберите курс" }]}
                    >
                        <Select placeholder="Выберите курс">
                            {courses.map((c) => (
                                <Option key={c.id} value={c.id}>
                                    {c.title} (ID {c.id})
                                </Option>
                            ))}
                        </Select>
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};
