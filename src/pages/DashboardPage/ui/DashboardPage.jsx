// pages/DashboardPage/ui/DashboardPage.jsx
import React, { useEffect, useState } from "react";
import { Card, Row, Col, Typography, Button } from "antd";
import { getSession } from "../../../features/auth/model/session";
import { getAllCourses } from "../../../entities/course/model/courseStorage";
import { getAllSchedule } from "../../../entities/schedule/model/scheduleStorage";
import DashboardCard from "../../../shared/ui/Card/Card";
import {NewsPage} from "../../NewsPage/ui/NewsPage";

const { Title, Text } = Typography;

export const DashboardPage = () => {
    const [user, setUser] = useState(null);
    const [courses, setCourses] = useState([]);
    const [schedule, setSchedule] = useState([]);
    const [closestEvent, setClosestEvent] = useState(null);

    useEffect(() => {
        const sessionUser = getSession();
        if (sessionUser) {
            setUser(sessionUser);
        }

        // Загрузим все курсы
        const courseData = getAllCourses();
        setCourses(courseData);

        // Загрузим все события расписания
        const scheduleData = getAllSchedule();
        setSchedule(scheduleData);

        // Найдём ближайшее событие (по дате/времени)
        if (scheduleData.length > 0) {
            const now = new Date();

            // Преобразуем "date" + "time" в Date-объект
            // и найдём самое ближайшее, которое еще не прошло
            const upcomingEvents = scheduleData
                .map((ev) => {
                    const [year, month, day] = ev.date.split("-");
                    const [hours, minutes] = ev.time.split(":");
                    const eventDate = new Date(
                        +year,
                        +month - 1, // месяцы в JS с 0
                        +day,
                        +hours,
                        +minutes
                    );
                    return { ...ev, eventDate };
                })
                .filter((ev) => ev.eventDate > now)
                .sort((a, b) => a.eventDate - b.eventDate);

            if (upcomingEvents.length > 0) {
                setClosestEvent(upcomingEvents[0]);
            }
        }
    }, []);

    // Подсчитаем, сколько курсов ведёт преподаватель (teacher) и т.д.
    let teacherCoursesCount = 0;
    if (user && user.role === "teacher") {
        teacherCoursesCount = courses.filter((c) => c.teacherId === user.login).length;
    }

    return (
        <div style={{ padding: "16px" }}>
            <Title level={2}>Добро пожаловать, {user?.fullName}!</Title>
            <Text>
                Ваша роль: <b>{user?.role === "teacher" ? "Преподаватель" : "Студент"}</b>
            </Text>

            <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
                <DashboardCard
                    title="Всего курсов:"
                    value={courses.length}
                    extra={user?.role === "teacher" && (
                        <Text type="secondary">Курсы, которые вы ведёте: <Text strong>{teacherCoursesCount}</Text></Text>
                    )}
                    link="#/courses"
                    linkText="Перейти к курсам"
                />
                <DashboardCard
                    title="Расписание:"
                    value={`${schedule.length} занятий`}
                    extra={closestEvent ? (
                        <div>
                            <Text type="secondary">Ближайшее занятие:</Text>
                            <div>
                                <Text>{closestEvent.date} в {closestEvent.time}, курс ID {closestEvent.courseId}</Text>
                            </div>
                        </div>
                    ) : (
                        <Text type="secondary">Ближайших занятий не найдено.</Text>
                    )}
                    link="#/schedule"
                    linkText="Посмотреть расписание"
                />

                {/*<DashboardCard*/}
                {/*    title="Материалы"*/}
                {/*    value="Здесь можно показать количество материалов и т.д."*/}
                {/*    link="#/teacher-zone"*/}
                {/*    linkText="Управлять материалами (Teacher Zone)"*/}
                {/*/>*/}
            </Row>
            <NewsPage />
        </div>
    );
};
