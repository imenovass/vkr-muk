import React, { useEffect, useState } from "react";
import { Button, Table, Modal, Form, Input } from "antd";
import {getAllAssignments, submitAssignment} from "../../../entities/assignment/model/assignmentStorage";
import {getSession} from "../../../features/auth/model/session";


export const CourseAssignments = ({ courseId }) => {
    const sessionUser = getSession();
    const [assignments, setAssignments] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentAssignment, setCurrentAssignment] = useState(null);
    const [form] = Form.useForm();

    useEffect(() => {
        // Фильтруем все задания по courseId
        const all = getAllAssignments();
        const filtered = all.filter((a) => a.courseId === courseId);
        setAssignments(filtered);
    }, [courseId]);

    // Открыть модалку для "сдать задание"
    const handleSubmitClick = (record) => {
        setCurrentAssignment(record);
        setIsModalOpen(true);
    };

    const handleCancel = () => {
        setIsModalOpen(false);
        setCurrentAssignment(null);
        form.resetFields();
    };

    const handleSave = () => {
        form.validateFields().then((values) => {
            // например, student указывает ссылку на решение
            const { solutionLink } = values;
            // вызываем submitAssignment(assignmentId, studentLogin, { solutionLink })
            submitAssignment(currentAssignment.id, sessionUser.login, {
                solutionLink,
            });

            handleCancel();
        });
    };

    const columns = [
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
            title: "Срок сдачи",
            dataIndex: "dueDate",
            key: "dueDate",
        },
        {
            title: "Действия",
            render: (text, record) => {
                // Если роль student, показываем кнопку “Сдать”
                if (sessionUser?.role === "student") {
                    return (
                        <Button type="primary" onClick={() => handleSubmitClick(record)}>
                            Сдать
                        </Button>
                    );
                }
                return null;
            },
        },
    ];

    return (
        <div>
            <Table columns={columns} dataSource={assignments} rowKey="id" />

            <Modal
                title={`Сдать задание: ${currentAssignment?.title}`}
                visible={isModalOpen}
                onCancel={handleCancel}
                onOk={handleSave}
            >
                <Form form={form} layout="vertical">
                    <Form.Item
                        label="Ссылка на решение"
                        name="solutionLink"
                        rules={[{ required: true, message: "Укажите ссылку на решение" }]}
                    >
                        <Input />
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};
