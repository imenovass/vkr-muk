import React, { useEffect, useState } from "react";
import { Card, Row, Col, message, Button } from "antd";
import { useNavigate } from "react-router-dom";
import { getAllCourses } from "../../entities/course/model/courseStorage";
import { getSession } from "../../features/auth/model/session";

export const StudentListPage = () => {
    const [students, setStudents] = useState([]);
    const navigate = useNavigate();
    const user = getSession(); // { username, role: "teacher"|"student", ... }

    useEffect(() => {
        const courses = getAllCourses();
        if (!courses || courses.length === 0) {
            message.warn("Курсы не найдены или их нет");
            return;
        }

        // Собираем всех участников из всех курсов
        const participantsSet = new Set();
        courses.forEach((course) => {
            (course.participants || []).forEach((p) => {
                participantsSet.add(p);
            });
        });

        // Преобразуем Set в массив
        let allStudents = Array.from(participantsSet);

        // Если пользователь - студент, то показываем только его
        if (user.role === "student") {
            allStudents = [user.username];
        }

        setStudents(allStudents);
    }, []);

    // Если нет студентов
    if (!students || students.length === 0) {
        return <div style={{ padding: 16 }}>Студенты не найдены</div>;
    }

    // Рендерим в сетке (Row, Col), чтобы карточки красиво шли
    return (
        <div style={{ padding: 16 }}>
            <h2>Список студентов</h2>
            <Row gutter={[16, 16]}>
                {students.map((studentName) => (
                    <Col xs={24} sm={12} md={8} lg={6} key={studentName}>
                        <Card
                            title={studentName}
                            style={{ width: "100%" }}
                            // Небольшая стилистика
                            actions={[
                                <Button
                                    type="link"
                                    onClick={() => navigate(`/students/${studentName}`)}
                                >
                                    Оценки
                                </Button>,
                            ]}
                        >
                            {/* Дополнительная информация о студенте, если есть */}
                            <p>Роль: студент</p>
                            {/* Здесь можно выводить email, avatar, если в сессии/данных есть */}
                        </Card>
                    </Col>
                ))}
            </Row>
        </div>
    );
};
