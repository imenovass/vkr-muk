import React, { useState } from "react";
import { Form, Input, Button } from "antd";
import { useNavigate } from "react-router-dom";
import { loginFx } from "../../../features/auth/model/pbAuth";
import { setSession } from "../../../features/auth/model/session";

import "./styles.scss";
import Logo from "../../../shared/ui/Logo/Logo";

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
        <div className="login-container">
            <Logo />

            {/* Заголовок */}
            <h2 className="welcome-title">Добро пожаловать</h2>
            <p className="welcome-subtitle">
                Пожалуйста, войдите в систему, используя<br />
                предоставленные Вам данные:
            </p>

            {/* Форма входа */}
            <Form layout="vertical" onFinish={onFinish} className="login-form">
                {error && <p className="error-text">{error}</p>}

                <Form.Item
                    name="login"
                    rules={[{ required: true, message: "Введите логин" }]}
                >
                    <Input placeholder="Логин" />
                </Form.Item>

                <Form.Item
                    name="password"
                    rules={[{ required: true, message: "Введите пароль" }]}
                >
                    <Input.Password placeholder="Пароль" />
                </Form.Item>

                <Form.Item>
                    <Button type="primary" htmlType="submit" block>
                        Далее
                    </Button>
                </Form.Item>
            </Form>

            <p className="footer-text">
                Если Вы не помните логин или пароль,<br />
                пожалуйста, обратитесь к администратору.
            </p>
        </div>
    );
};
