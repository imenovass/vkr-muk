import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Table, message } from "antd";
import { getAllCourses } from "../../entities/course/model/courseStorage";
import { getSession } from "../../features/auth/model/session";

export const StudentDetailPage = () => {
    const { username } = useParams();
    const navigate = useNavigate();
    const user = getSession();

    const [coursesData, setCoursesData] = useState([]);

    useEffect(() => {
        const courses = getAllCourses();
        if (!courses || courses.length === 0) {
            message.error("Курсы не найдены");
            navigate("/students");
            return;
        }

        // Проверка прав (если студент – смотрит чужую страницу)
        if (user?.role === "student" && username !== user?.username) {
            message.error("Нет прав для просмотра профиля другого студента");
            navigate("/students");
            return;
        }

        // Отбираем все курсы, где данный студент есть в participants
        const studentCourses = courses.filter(course =>
            (course.participants || []).includes(username)
        );

        // Для каждого курса определяем оценку (целое число) и количество работ
        const detailed = studentCourses.map(course => {
            const { submissions = [], title, id } = course;
            const studentSubs = submissions.filter(sub => sub.studentId === username);

            // Если нет работ, пишем "Нет оценок"
            if (studentSubs.length === 0) {
                return {
                    courseId: id,
                    courseTitle: title,
                    grade: "Нет оценок",
                    submissionsCount: 0,
                };
            }

            // Допустим, берём последнюю работу
            const lastSubmission = studentSubs[studentSubs.length - 1];
            const rawGrade = lastSubmission?.grade;

            // Парсим в целое число
            let finalGrade = "Нет оценок";
            if (rawGrade) {
                // parseInt вернёт целое число, если там "4" или "5"
                const intGrade = parseInt(rawGrade, 10);
                finalGrade = isNaN(intGrade) ? "Нет оценок" : intGrade;
            }

            return {
                courseId: id,
                courseTitle: title,
                grade: finalGrade,
                submissionsCount: studentSubs.length,
            };
        });

        setCoursesData(detailed);
    }, [username, user?.role, navigate]);

    // Если нет курсов
    if (coursesData.length === 0) {
        return (
            <div style={{ padding: 16 }}>
                <h2>Студент: {username}</h2>
                <p>Не найдено курсов, на которые записан данный студент</p>
            </div>
        );
    }

    // Колонки таблицы
    const columns = [
        {
            title: "Курс",
            dataIndex: "courseTitle",
            key: "courseTitle",
        },
        {
            title: "Сдано работ",
            dataIndex: "submissionsCount",
            key: "submissionsCount",
        },
        {
            title: "Оценка",
            dataIndex: "grade",
            key: "grade",
        },
    ];

    return (
        <div style={{ padding: 16 }}>
            <h2>Информация по студенту: {username}</h2>
            <Table
                columns={columns}
                dataSource={coursesData.map((item, idx) => ({
                    key: `${item.courseId}-${idx}`,
                    ...item,
                }))}
                pagination={false}
            />
        </div>
    );
};
