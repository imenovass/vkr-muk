import React, { useEffect, useState, useMemo } from "react";
import { Card, Row, Col, message, Button } from "antd";
import { useNavigate } from "react-router-dom";
import { getSession } from "../../features/auth/model/session";
import { pb } from "../../shared/config/pb";

export const StudentListPage = () => {
    const [students, setStudents] = useState([]);
    const navigate = useNavigate();
    const user = getSession(); // { username, role, ... } - из вашей логики сессии

    useEffect(() => {
        pb.collection("users2")
            .getList(1, 50, { filter: 'role="student"' })
            .then((pageData) => {
                // pageData.items — массив записей, соответствующих фильтру
                setStudents(pageData.items);
            })
            .catch((err) => {
                console.error("Ошибка при получении списка студентов:", err);
                message.error("Не удалось загрузить список студентов");
            });
    }, []);

    // Пример useMemo: например, сортируем студентов по username (или по любому другому полю)
    // чтобы не пересчитывать это при каждом ререндере.
    const memoizedStudents = useMemo(() => {
        return [...students].sort((a, b) => a.username.localeCompare(b.username));
    }, [students]);

    if (memoizedStudents.length === 0) {
        return <div style={{ padding: 16 }}>Студенты не найдены</div>;
    }

    return (
        <div style={{ padding: 16 }}>
            <h2>Список студентов</h2>
            <Row gutter={[16, 16]}>
                {memoizedStudents.map((student) => (
                    <Col key={student.id} xs={24} sm={12} md={8} lg={6}>
                        <Card
                            title={student.username}
                            style={{ width: "100%" }}
                            actions={[
                                <Button
                                    type="link"
                                    onClick={() =>
                                        navigate(`/students/${student.username}`)
                                    }
                                >
                                    Оценки
                                </Button>,
                            ]}
                        >
                            {/* role и active у нас уже в фильтре,
                                но можно вывести ещё какую-то информацию: */}
                            <p>Роль: {student.role}</p>
                            <p>Active: {String(student.active)}</p>
                        </Card>
                    </Col>
                ))}
            </Row>
        </div>
    );
};
