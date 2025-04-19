// pages/SchedulePage/ui/SchedulePage.jsx
import React, { useEffect, useState } from "react";
import {
    Table,
    Button,
    Modal,
    Form,
    Input,
    DatePicker,
    TimePicker,
    List,
    Grid
} from "antd";
import {
    createScheduleEvent,
    getAllSchedule,
    deleteScheduleEvent,
} from "../../../entities/schedule/model/scheduleStorage";
import { getSession } from "../../../features/auth/model/session";
import "./styles.scss";

export const SchedulePage = () => {
    const [data, setData] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [form] = Form.useForm();

    const user = getSession();

    // Антд-хук для определения брейкпоинтов
    const breakpoints = Grid.useBreakpoint();
    // Если ширина экрана меньше «md», считаем устройство мобильным
    const isMobile = !breakpoints.md;

    useEffect(() => {
        const scheduleData = getAllSchedule();
        setData(scheduleData);
    }, []);

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

    // Колонки таблицы для десктопной версии
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
            render: (_, record) =>
              user?.role === "teacher" && (
                <Button danger onClick={() => handleDelete(record.id)}>
                    Удалить
                </Button>
              ),
        },
    ];

    return (
      <div className="schedule-page">
          <h2>Расписание</h2>

          {user?.role === "teacher" && (
            <Button type="primary" style={{ marginBottom: 16 }} onClick={handleOpenModal}>
                Добавить занятие
            </Button>
          )}

          {/* На мобильных экранах — список, на больших — таблица */}
          {isMobile ? (
            <List
              dataSource={data}
              rowKey="id"
              renderItem={(item) => (
                <List.Item
                  actions={
                      user?.role === "teacher"
                        ? [
                            <Button
                              danger
                              key="delete"
                              onClick={() => handleDelete(item.id)}
                            >
                                Удалить
                            </Button>,
                        ]
                        : []
                  }
                >
                    <List.Item.Meta
                      title={
                          <div>
                              <strong>Дата:</strong> {item.date}
                              <div>
                                  <strong>Время:</strong> {item.time}
                              </div>
                          </div>
                      }
                      description={
                          <div>
                              <div>
                                  <strong>Аудитория:</strong> {item.room}
                              </div>
                              <div>
                                  <strong>ID курса:</strong> {item.courseId}
                              </div>
                          </div>
                      }
                    />
                </List.Item>
              )}
            />
          ) : (
            <Table
              columns={columns}
              dataSource={data}
              rowKey="id"
              scroll={{ x: true }}
            />
          )}

          <Modal
            visible={isModalOpen}
            title="Добавить занятие"
            onCancel={handleCancel}
            onOk={handleSave}
            // Пример, как можно отрендерить на всю ширину экрана для мобильной версии
            // {...(isMobile && { width: "100%", style: { top: 0, margin: 0, padding: 0 } })}
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
                  </Form.Item>
              </Form>
          </Modal>
      </div>
    );
};
