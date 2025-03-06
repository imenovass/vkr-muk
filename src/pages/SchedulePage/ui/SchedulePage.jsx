// pages/SchedulePage/ui/SchedulePage.jsx
import React, { useEffect, useState } from "react";
import { Table, Button, Modal, Form, Input, DatePicker, TimePicker } from "antd";
import { createScheduleEvent, getAllSchedule, deleteScheduleEvent } from "../../../entities/schedule/model/scheduleStorage";
import { getAllCourses } from "../../../entities/course/model/courseStorage";
import { getSession } from "../../../features/auth/model/session";


export const SchedulePage = () => {
    const [data, setData] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [form] = Form.useForm();

    const user = getSession();

    useEffect(() => {
        const scheduleData = getAllSchedule();
        setData(scheduleData);
    }, []);

    const columns = [
        {
            title: "Дата",
            dataIndex: "date",
            key: "date",
        },
        {
            title: "Время",
            dataIndex: "time",
            key: "time",
        },
        {
            title: "Аудитория",
            dataIndex: "room",
            key: "room",
        },
        {
            title: "ID курса",
            dataIndex: "courseId",
            key: "courseId",
        },
        {
            title: "Действие",
            render: (text, record) => (
                user?.role === "teacher" && (
                    <Button danger onClick={() => handleDelete(record.id)}>
                        Удалить
                    </Button>
                )
            ),
        },
    ];

    const handleDelete = (id) => {
        deleteScheduleEvent(id);
        setData((prev) => prev.filter((item) => item.id !== id));
    };

    const handleOpenModal = () => {
        setIsModalOpen(true);
    };

    const handleCancel = () => {
        setIsModalOpen(false);
        form.resetFields();
    };

    const handleSave = () => {
        form.validateFields().then((values) => {
            const { date, time, room, courseId } = values;

            createScheduleEvent({
                date: date.format("YYYY-MM-DD"),
                time: time.format("HH:mm"),
                room,
                courseId,
            });
            setData(getAllSchedule());
            handleCancel();
        });
    };

    return (
        <div>
            <h2>Расписание</h2>
            {user?.role === "teacher" && (
                <Button type="primary" style={{ marginBottom: 16 }} onClick={handleOpenModal}>
                    Добавить занятие
                </Button>
            )}

            <Table columns={columns} dataSource={data} rowKey="id" />

            <Modal
                visible={isModalOpen}
                title="Добавить занятие"
                onCancel={handleCancel}
                onOk={handleSave}
            >
                <Form form={form} layout="vertical">
                    <Form.Item
                        label="Дата"
                        name="date"
                        rules={[{ required: true, message: "Выберите дату" }]}
                    >
                        <DatePicker format="YYYY-MM-DD" style={{ width: "100%" }} />
                    </Form.Item>
                    <Form.Item
                        label="Время"
                        name="time"
                        rules={[{ required: true, message: "Выберите время" }]}
                    >
                        <TimePicker format="HH:mm" style={{ width: "100%" }} />
                    </Form.Item>
                    <Form.Item
                        label="Аудитория"
                        name="room"
                        rules={[{ required: true, message: "Введите аудиторию" }]}
                    >
                        <Input />
                    </Form.Item>
                    <Form.Item
                        label="ID курса"
                        name="courseId"
                        rules={[{ required: true, message: "Укажите ID курса" }]}
                    >
                        <Input placeholder="Например, 1" />
                        {/* Можно вместо обычного Input сделать Select, подгрузив getAllCourses() */}
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};
