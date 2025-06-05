import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button, Form, Input } from 'antd'

import { loginFx } from '../../../features/auth/model/pbAuth'
import { setSession } from '../../../features/auth/model/session'
import Logo from '../../../shared/ui/Logo/Logo'
import img from "../../../assets/img/login.jpeg"

import './styles.scss'

export const LoginPage = () => {
  const navigate = useNavigate()
  const [error, setError] = useState('')

  const onFinish = async (values) => {
    const { login, password } = values
    const authData = await loginFx({ login, password })
    if (!authData) {
      setError('Неверный логин или пароль')
    } else {
      setSession(authData)
      setError('')
      navigate('/')
    }
  }

  return (
    <div className="login-wrapper">
      <div className="login-card">
        <div className="login-left">
          <div className="logo-wrapper">
            <Logo />
          </div>


          <h2 className="auth-subtitle">Добро пожаловать</h2>
          <h1 className=" auth-title">Войти в аккаунт</h1>

          <Form layout="vertical" onFinish={onFinish} className="auth-form">
            {error && <p className="error-text">{error}</p>}

            <Form.Item name="login" rules={[{ required: true, message: 'Введите логин' }]}>
              <Input placeholder="Логин" size="large" />
            </Form.Item>

            <Form.Item name="password" rules={[{ required: true, message: 'Введите пароль' }]}>
              <Input.Password placeholder="Пароль" size="large" />
            </Form.Item>

            <Form.Item>
              <Button type="primary" className="login-button" htmlType="submit" block size="large">
                Далее
              </Button>
            </Form.Item>
          </Form>

          <p className="footer-text">
            Если вы не помните логин или пароль, обратитесь к администратору.
          </p>
        </div>

        <div className="login-right">
          <img src={img} alt="Login Visual" />
        </div>

      </div>
    </div>
  )
}
