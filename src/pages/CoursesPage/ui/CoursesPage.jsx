import React, { useEffect, useState } from "react";
import {
    Row,
    Col,
    Card,
    Button,
    Modal,
    Form,
    Input,
    notification,
} from "antd";
import { useNavigate } from "react-router-dom";
import { getSession } from "../../../features/auth/model/session";
import {
    getAllCourses,
    createCourse,
    updateCourse,
} from "../../../entities/course/model/courseStorage";

export const CoursesPage = () => {
    const navigate = useNavigate();
    const user = getSession();
    const [courses, setCourses] = useState([]);

    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [createForm] = Form.useForm();

    useEffect(() => {
        const data = getAllCourses();
        setCourses(data);
    }, []);

    // Разделяем курсы на "мои" и "другие"
    let myCourses = [];
    let otherCourses = [];

    if (user?.role === "teacher") {
        myCourses = courses.filter((c) => c.teacherId === user.username);
        otherCourses = courses.filter((c) => c.teacherId !== user.username);
    } else if (user?.role === "student") {
        myCourses = courses.filter((c) => c.participants.includes(user.username));
        otherCourses = courses.filter((c) => !c.participants.includes(user.username));
    }

    // -----------------------
    // CREATE (teacher)
    // -----------------------
    const openCreateModal = () => {
        setIsCreateModalOpen(true);
        createForm.resetFields();
    };
    const handleCancelCreate = () => {
        setIsCreateModalOpen(false);
        createForm.resetFields();
    };
    const handleCreateCourse = () => {
        createForm.validateFields().then((values) => {
            const { title, description } = values;
            const newCourse = createCourse({
                title,
                description,
                teacherId: user.username,
                participants: [],
                createdAt: new Date().toISOString(),
            });
            setCourses((prev) => [newCourse, ...prev]);
            notification.success({ message: "Курс успешно создан!" });
            handleCancelCreate();
        });
    };

    // -----------------------
    // JOIN COURSE (student)
    // -----------------------
    const handleJoinCourse = (courseId) => {
        const course = courses.find((c) => c.id === courseId);
        if (!course) return;
        if (!course.participants.includes(user.username)) {
            const updatedParticipants = [...course.participants, user.username];
            // Обновим в хранилище
            const updated = updateCourse(courseId, {
                participants: updatedParticipants,
            });
            // Локально заменим объект
            setCourses((prev) => prev.map((c) => (c.id === courseId ? updated : c)));
            notification.success({ message: "Вы записались на курс" });
        }
    };

    // -----------------------
    // Переход на детальную страницу
    // -----------------------
    const goToDetail = (courseId) => {
        navigate(`/courses/${courseId}`);
    };

    // =======================
    // РЕНДЕР КАРТОЧЕК
    // =======================
    const renderMyCourseCard = (course) => {
        return (
            <Col key={course.id} xs={24} sm={12} md={8} lg={6} style={{ marginBottom: 16 }}>
                <Card
                    title={course.title}
                    hoverable
                    style={{ height: "100%", cursor: "pointer" }}
                    onClick={() => goToDetail(course.id)}  // только переход
                >
                    <p>{course.description}</p>

                    {/* Если студент, показываем что он участвует */}
                    {user.role === "student" && course.participants.includes(user.username) && (
                        <p style={{ color: "green" }}>Вы участвуете в курсе</p>
                    )}
                </Card>
            </Col>
        );
    };

    const renderOtherCourseCard = (course) => {
        return (
            <Col key={course.id} xs={24} sm={12} md={8} lg={6} style={{ marginBottom: 16 }}>
                <Card
                    title={course.title}
                    hoverable={false}
                    style={{ height: "100%", cursor: "default" }}
                >
                    <p>{course.description}</p>
                    {/* Кнопка "Записаться" только для студентов, которые ещё не в курсе */}
                    {user.role === "student" && !course.participants.includes(user.username) && (
                        <Button type="primary" onClick={() => handleJoinCourse(course.id)}>
                            Записаться
                        </Button>
                    )}
                </Card>
            </Col>
        );
    };

    return (
        <div style={{ padding: 16 }}>
            <h2>Курсы</h2>

            {user?.role === "teacher" && (
                <Button type="primary" style={{ marginBottom: 16 }} onClick={openCreateModal}>
                    Создать курс
                </Button>
            )}

            {/* Мои курсы */}
            <h3>Мои курсы</h3>
            <Row gutter={[16, 16]}>
                {myCourses.map((course) => renderMyCourseCard(course))}
            </Row>

            {/* Другие курсы */}
            <h3 style={{ marginTop: 32 }}>Другие курсы</h3>
            <Row gutter={[16, 16]}>
                {otherCourses.map((course) => renderOtherCourseCard(course))}
            </Row>

            {/* Модалка: Создать курс */}
            <Modal
                title="Создать курс"
                open={isCreateModalOpen}
                onCancel={handleCancelCreate}
                onOk={handleCreateCourse}
            >
                <Form layout="vertical" form={createForm}>
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
        </div>
    );
};
