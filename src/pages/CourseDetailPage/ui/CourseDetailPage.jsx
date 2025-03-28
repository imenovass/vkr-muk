import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
    Tabs, Button, Modal, Form, Input, Upload, message, List, Card, Select
} from "antd";
import { InboxOutlined } from "@ant-design/icons";
import { getSession } from "../../../features/auth/model/session";
import {
    getCourseById,
    addMaterial,
    addSubmission,
    setSubmissionGrade,
    updateCourse,
    deleteCourse,
} from "../../../entities/course/model/courseStorage";

const { Dragger } = Upload;

export const CourseDetailPage = () => {
    const { courseId } = useParams();
    const navigate = useNavigate();
    const user = getSession();

    const [course, setCourse] = useState(null);

    // ——— Модалки для добавления материала / домашки ———
    const [isMaterialModalOpen, setIsMaterialModalOpen] = useState(false);
    const [isSubmissionModalOpen, setIsSubmissionModalOpen] = useState(false);
    const [materialForm] = Form.useForm();
    const [submissionForm] = Form.useForm();
    const [materialFile, setMaterialFile] = useState(null);
    const [submissionFile, setSubmissionFile] = useState(null);

    // ——— Модалка "Выставить оценку" ———
    const [isGradeModalOpen, setIsGradeModalOpen] = useState(false);
    const [gradeForm] = Form.useForm();
    const [gradingSubmissionId, setGradingSubmissionId] = useState(null);

    // ——— Модалка "Редактировать курс" ———
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editForm] = Form.useForm();

    useEffect(() => {
        reloadCourse();
    }, [courseId]);

    const reloadCourse = () => {
        const c = getCourseById(courseId);
        setCourse(c);
    };

    if (!course) {
        return <div style={{ padding: 16 }}>Курс не найден</div>;
    }

    // ==============================
    // УЧАСТНИКИ (только teacher)
    // ==============================
    const handleRemoveParticipant = async (participantName) => {
        const updatedParticipants = course.participants.filter(
            (p) => p !== participantName
        );
        const updated = updateCourse(courseId, {
            participants: updatedParticipants,
        });
        setCourse(updated);
        message.success(`Участник ${participantName} удалён из курса`);
    };

    // ==============================
    // Редактировать / Удалить курс (только teacher)
    // ==============================
    const openEditModal = () => {
        editForm.setFieldsValue({
            title: course.title,
            description: course.description,
        });
        setIsEditModalOpen(true);
    };
    const closeEditModal = () => {
        setIsEditModalOpen(false);
        editForm.resetFields();
    };
    const handleEditCourse = async () => {
        try {
            const values = await editForm.validateFields();
            const { title, description } = values;
            const updated = updateCourse(courseId, { title, description });
            setCourse(updated);
            message.success("Курс обновлён!");
            closeEditModal();
        } catch (err) {
            console.error(err);
        }
    };

    const handleDeleteCourse = () => {
        deleteCourse(courseId);
        message.success("Курс удалён!");
        // После удаления отправляем пользователя на список курсов
        navigate("/courses");
    };

    // ==============================
    // Загрузить материал (Teacher)
    // ==============================
    const openMaterialModal = () => {
        setIsMaterialModalOpen(true);
        materialForm.resetFields();
        setMaterialFile(null);
    };
    const closeMaterialModal = () => {
        setIsMaterialModalOpen(false);
        materialForm.resetFields();
        setMaterialFile(null);
    };
    const handleMaterialSubmit = async () => {
        try {
            await materialForm.validateFields();
            const { title } = materialForm.getFieldsValue();
            if (!materialFile) {
                message.error("Необходимо прикрепить файл!");
                return;
            }
            const fileBase64 = await fileToBase64(materialFile);

            addMaterial(courseId, {
                filename: title,
                fileData: fileBase64,
                authorId: user.username,
                createdAt: new Date().toISOString(),
            });
            message.success("Материал добавлен!");
            closeMaterialModal();
            reloadCourse();
        } catch (err) {
            console.error(err);
        }
    };

    // ==============================
    // Загрузить домашку (Student)
    // ==============================
    const openSubmissionModal = () => {
        setIsSubmissionModalOpen(true);
        submissionForm.resetFields();
        setSubmissionFile(null);
    };
    const closeSubmissionModal = () => {
        setIsSubmissionModalOpen(false);
        submissionForm.resetFields();
        setSubmissionFile(null);
    };
    const handleSubmissionSubmit = async () => {
        try {
            await submissionForm.validateFields();
            const { comment } = submissionForm.getFieldsValue();
            if (!submissionFile) {
                message.error("Необходимо прикрепить файл домашки!");
                return;
            }
            const fileBase64 = await fileToBase64(submissionFile);

            addSubmission(courseId, {
                studentId: user.username,
                fileData: fileBase64,
                comment,
                createdAt: new Date().toISOString(),
            });
            message.success("Домашка отправлена!");
            closeSubmissionModal();
            reloadCourse();
        } catch (err) {
            console.error(err);
        }
    };

    // ==============================
    // Поставить оценку (Teacher)
    // ==============================
    const openGradeModal = (submissionId) => {
        setGradingSubmissionId(submissionId);
        gradeForm.setFieldsValue({ grade: "" });
        setIsGradeModalOpen(true);
    };
    const closeGradeModal = () => {
        setIsGradeModalOpen(false);
        setGradingSubmissionId(null);
    };
    const handleSetGrade = async () => {
        try {
            const { grade } = await gradeForm.validateFields();
            setSubmissionGrade(courseId, gradingSubmissionId, grade);
            message.success("Оценка выставлена");
            closeGradeModal();
            reloadCourse();
        } catch (err) {
            console.error(err);
        }
    };

    // ==============================
    // fileToBase64 (утилита)
    // ==============================
    const fileToBase64 = (file) => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => resolve(e.target.result);
            reader.onerror = (err) => reject(err);
            reader.readAsDataURL(file);
        });
    };

    // ============ Рендер таба "Материалы" ============
    const renderMaterialsTab = () => {
        return (
            <div style={{ padding: 16 }}>
                {user.role === "teacher" && (
                    <Button
                        type="primary"
                        onClick={openMaterialModal}
                        style={{ marginBottom: 16 }}
                    >
                        Загрузить материал
                    </Button>
                )}

                {course.materials?.length === 0 && <p>Материалов нет</p>}
                <List
                    grid={{ gutter: 16, column: 3 }}
                    dataSource={course.materials}
                    renderItem={(item) => (
                        <List.Item>
                            <Card title={item.filename}>
                                <p>Автор: {item.authorId}</p>
                                <p>
                                    <Button
                                        type="link"
                                        onClick={() => {
                                            // Открыть файл в новой вкладке
                                            const newWindow = window.open(
                                                item.fileData,
                                                "_blank"
                                            );
                                            if (newWindow) newWindow.opener = null;
                                        }}
                                    >
                                        Открыть
                                    </Button>
                                </p>
                            </Card>
                        </List.Item>
                    )}
                />
            </div>
        );
    };

    // ============ Рендер таба "Домашние работы" ============
    const renderSubmissionsTab = () => {
        return (
            <div style={{ padding: 16 }}>
                {user.role === "student" && (
                    <Button
                        type="primary"
                        onClick={openSubmissionModal}
                        style={{ marginBottom: 16 }}
                    >
                        Загрузить работу
                    </Button>
                )}
                {course.submissions?.length === 0 && <p>Пока никто не загрузил работы</p>}
                <List
                    dataSource={course.submissions}
                    renderItem={(sub) => {
                        const isAuthor = sub.studentId === user.username;
                        return (
                            <List.Item>
                                <Card style={{ width: "100%" }}>
                                    <p>
                                        <b>Студент:</b> {sub.studentId}
                                    </p>
                                    <p>{sub.comment}</p>
                                    <p>
                                        <Button
                                            type="link"
                                            onClick={() => {
                                                // Открыть файл в новой вкладке
                                                const newWindow = window.open(
                                                    sub.fileData,
                                                    "_blank"
                                                );
                                                if (newWindow) newWindow.opener = null;
                                            }}
                                        >
                                            Посмотреть файл
                                        </Button>
                                    </p>
                                    {sub.grade ? (
                                        <p style={{ color: "green" }}>
                                            Оценка: <b>{sub.grade}</b>
                                        </p>
                                    ) : (
                                        <p style={{ color: "red" }}>Оценка не выставлена</p>
                                    )}

                                    {/* Учитель может выставить оценку */}
                                    {user.role === "teacher" && (
                                        <Button
                                            type="primary"
                                            onClick={() => openGradeModal(sub.id)}
                                        >
                                            Поставить оценку
                                        </Button>
                                    )}

                                    {/* Студент (автор) может видеть, что это его работа */}
                                    {user.role === "student" && isAuthor && (
                                        <p style={{ fontSize: 12, color: "#999" }}>
                                            (Вы загрузили эту работу)
                                        </p>
                                    )}
                                </Card>
                            </List.Item>
                        );
                    }}
                />
            </div>
        );
    };

    return (
        <div style={{ padding: 16 }}>
            <h2>{course.title}</h2>
            <p>{course.description}</p>

            {/* Блок с участниками/управлением курсом — только teacher */}
            {user.role === "teacher" && (
                <div style={{ marginBottom: 16, background: "#f9f9f9", padding: 16 }}>
                    <h3>Участники:</h3>
                    {course.participants?.length > 0 ? (
                        <List
                            dataSource={course.participants}
                            renderItem={(participant) => (
                                <List.Item>
                                    {participant}
                                    <Button
                                        type="link"
                                        danger
                                        onClick={() => handleRemoveParticipant(participant)}
                                    >
                                        Удалить
                                    </Button>
                                </List.Item>
                            )}
                        />
                    ) : (
                        <p>Пока нет участников</p>
                    )}

                    <div style={{ marginTop: 16 }}>
                        <Button style={{ marginRight: 8 }} onClick={openEditModal}>
                            Редактировать
                        </Button>
                        <Button danger onClick={handleDeleteCourse}>
                            Удалить
                        </Button>
                    </div>
                </div>
            )}

            <Tabs defaultActiveKey="materials">
                <Tabs.TabPane tab="Материалы" key="materials">
                    {renderMaterialsTab()}
                </Tabs.TabPane>
                <Tabs.TabPane tab="Домашние работы" key="submissions">
                    {renderSubmissionsTab()}
                </Tabs.TabPane>
            </Tabs>

            {/* Модалка: Редактировать курс */}
            <Modal
                title="Редактировать курс"
                open={isEditModalOpen}
                onCancel={closeEditModal}
                onOk={handleEditCourse}
            >
                <Form layout="vertical" form={editForm}>
                    <Form.Item
                        label="Название курса"
                        name="title"
                        rules={[{ required: true, message: "Введите название" }]}
                    >
                        <Input />
                    </Form.Item>
                    <Form.Item
                        label="Описание курса"
                        name="description"
                        rules={[{ required: true, message: "Введите описание" }]}
                    >
                        <Input.TextArea rows={3} />
                    </Form.Item>
                </Form>
            </Modal>

            {/* Модалка: Загрузить материал (Teacher) */}
            <Modal
                title="Загрузить материал"
                open={isMaterialModalOpen}
                onCancel={closeMaterialModal}
                onOk={handleMaterialSubmit}
            >
                <Form layout="vertical" form={materialForm}>
                    <Form.Item
                        label="Название/описание"
                        name="title"
                        rules={[{ required: true, message: "Введите название" }]}
                    >
                        <Input />
                    </Form.Item>
                </Form>
                <Dragger
                    name="file"
                    multiple={false}
                    beforeUpload={(file) => {
                        setMaterialFile(file);
                        return false; // отменяем авто-загрузку
                    }}
                    onRemove={() => setMaterialFile(null)}
                >
                    <p className="ant-upload-drag-icon">
                        <InboxOutlined />
                    </p>
                    <p>Нажмите или перетащите файл</p>
                </Dragger>
            </Modal>

            {/* Модалка: Загрузить домашку (Student) */}
            <Modal
                title="Загрузить работу"
                open={isSubmissionModalOpen}
                onCancel={closeSubmissionModal}
                onOk={handleSubmissionSubmit}
            >
                <Form layout="vertical" form={submissionForm}>
                    <Form.Item
                        label="Комментарий"
                        name="comment"
                        rules={[{ required: true, message: "Введите комментарий" }]}
                    >
                        <Input />
                    </Form.Item>
                </Form>
                <Dragger
                    multiple={false}
                    beforeUpload={(file) => {
                        setSubmissionFile(file);
                        return false;
                    }}
                    onRemove={() => setSubmissionFile(null)}
                >
                    <p className="ant-upload-drag-icon">
                        <InboxOutlined />
                    </p>
                    <p>Нажмите или перетащите файл</p>
                </Dragger>
            </Modal>

            {/* Модалка: Поставить оценку (Teacher) */}
            <Modal
                title="Поставить оценку"
                open={isGradeModalOpen}
                onCancel={closeGradeModal}
                onOk={handleSetGrade}
            >
                <Form layout="vertical" form={gradeForm}>
                    <Form.Item
                        label="Оценка"
                        name="grade"
                        rules={[{ required: true, message: "Введите оценку" }]}
                    >
                        <Select>
                            <Select.Option value="5">5</Select.Option>
                            <Select.Option value="4">4</Select.Option>
                            <Select.Option value="3">3</Select.Option>
                            <Select.Option value="2">2</Select.Option>
                        </Select>
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};
