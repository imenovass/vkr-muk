import React, { useState } from "react";
import "./styles.scss"; // SCSS со стилями
import { Card, Form, Input, Button, Typography, Alert } from "antd";
import { useNavigate } from "react-router-dom";
import { loginFx } from "../../../features/auth/model/pbAuth";
import { setSession } from "../../../features/auth/model/session";

// Импортируем картинку
import img from "../../../assets/img/login.jpg";

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
            setSession(authData);
            setError("");
            navigate("/");
        }
    };

    return (
        <div className="login-page-container">
            {/* Левая часть — форма логина */}
            <div className="login-section">
                <Card className="login-card">
                    <Title level={2} className="login-title">
                        Вход в систему
                    </Title>
                    {error && <Alert message={error} type="error" className="login-alert" />}
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

            <div className="image-section">
                <img src={img} alt="Login Illustration" />
            </div>
        </div>
    );
};
