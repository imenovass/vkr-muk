import React, { useState } from "react";
import { Card, Form, Input, Button, Typography, Alert } from "antd";
import { useNavigate } from "react-router-dom";
import { loginFx } from "../../../features/auth/model/pbAuth";
import { setSession } from "../../../features/auth/model/session";

const { Title } = Typography;

export const LoginPage = () => {
    const navigate = useNavigate();
    const [error, setError] = useState("");

    const onFinish = async (values) => {
        const { login, password } = values;
        const authData = await loginFx({ login, password });
        if (!authData) {
            setError("Неверный логин или пароль");
        } else {
            // Сохраняем в localStorage (или Context) - что угодно
            setSession(authData);
            setError("");
            navigate("/");
        }
    };

    return (
        <div style={{ display: "flex", justifyContent: "center", marginTop: 50 }}>
            <Card style={{ width: 400 }}>
                <Title level={2} style={{ textAlign: "center" }}>
                    Вход в систему
                </Title>
                {error && <Alert message={error} type="error" style={{ marginBottom: 16 }} />}
                <Form layout="vertical" onFinish={onFinish}>
                    <Form.Item
                        label="Логин"
                        name="login"
                        rules={[{ required: true, message: "Введите логин" }]}
                    >
                        <Input placeholder="teacher или student" />
                    </Form.Item>
                    <Form.Item
                        label="Пароль"
                        name="password"
                        rules={[{ required: true, message: "Введите пароль" }]}
                    >
                        <Input.Password placeholder="teacher или 12345" />
                    </Form.Item>
                    <Form.Item>
                        <Button type="primary" htmlType="submit" block>
                            Войти
                        </Button>
                    </Form.Item>
                </Form>
            </Card>
        </div>
    );
};
