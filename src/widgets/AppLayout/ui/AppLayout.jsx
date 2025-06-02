import React from 'react'
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'

import {
  BookOutlined,
  CalendarOutlined,
  HomeOutlined,
  PieChartOutlined,
  SettingOutlined,
  UserOutlined,
} from '@ant-design/icons'
import { Breadcrumb, Layout, Menu } from 'antd'

import { clearSession, getSession } from '../../../features/auth/model/session'
import { breadcrumbNameMap } from '../../../shared/config/breadcrumbs'
import Logo from '../../../shared/ui/Logo/Logo'

import './styles.scss'

const { Sider, Header, Content } = Layout

export const AppLayout = () => {
  const [collapsed, setCollapsed] = React.useState(false)

  const navigate = useNavigate()
  const location = useLocation()
  const user = getSession()

  const menuItems = [
    {
      key: '/',
      icon: <HomeOutlined />,
      label: <NavLink to="/">Главная</NavLink>,
    },
    {
      key: '/courses',
      icon: <BookOutlined />,
      label: <NavLink to="/courses">Курсы</NavLink>,
    },
    {
      key: '/students',
      icon: <UserOutlined />,
      label: <NavLink to="/students">Студенты</NavLink>,
    },
    {
      key: '/schedule',
      icon: <CalendarOutlined />,
      label: <NavLink to="/schedule">Расписание</NavLink>,
    },
    {
      key: '/profile',
      icon: <SettingOutlined />,
      label: <NavLink to="/profile">Профиль</NavLink>,
    },
  ]

  React.useEffect(() => {
    if (!user) {
      navigate('/login')
    }
  }, [user, navigate])

  // Если роль "teacher", добавляем пункт
  if (user?.role === 'teacher') {
    menuItems.push({
      key: '/teacher-zone',
      icon: <PieChartOutlined />,
      label: <NavLink to="/teacher-zone">Для преподавателя</NavLink>,
    })
  }

  // Логика меню (подсветка пункта)
  const selectedKey = `/${location.pathname.split('/')[1]}`

  // --- Хлебные крошки ---
  const pathSnippets = location.pathname.split('/').filter(Boolean)
  const extraBreadcrumbItems = pathSnippets.map((segment, index) => {
    const url = '/' + pathSnippets.slice(0, index + 1).join('/')
    let name = breadcrumbNameMap[url]

    // Пример динамического имени
    if (!name && index > 0 && pathSnippets[0] === 'courses') {
      name = `Детали курса (ID: ${segment})`
    }
    if (!name && index > 0 && pathSnippets[0] === 'students') {
      name = `Студент: ${segment}`
    }
    if (!name) {
      name = segment
    }
    return (
      <Breadcrumb.Item key={url}>
        <NavLink to={url}>{name}</NavLink>
      </Breadcrumb.Item>
    )
  })
  const breadcrumbItems = [
    <Breadcrumb.Item key="home">
      <NavLink to="/">Главная</NavLink>
    </Breadcrumb.Item>,
    ...extraBreadcrumbItems,
  ]

  const handleLogout = () => {
    clearSession()
    navigate('/login')
  }

  console.log('user', user)

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider
        width={200}
        collapsible
        collapsed={collapsed}
        breakpoint="md" // "md" = 768px
        onBreakpoint={(broken) => setCollapsed(broken)}
        collapsedWidth={80} // Можно установить 0, если нужно полностью скрывать
        trigger={null} // Убирает стандартную стрелку снизу
        style={{
          position: 'fixed',
          left: 0,
          top: 0,
          bottom: 0,
          overflow: 'auto',
        }}
      >
        <Logo />
        <Menu theme="dark" mode="inline" selectedKeys={[selectedKey]} items={menuItems} />
      </Sider>

      <Layout style={{ marginLeft: collapsed ? 80 : 200 }}>
        <Header
          style={{
            background: '#fff',
            padding: '0 16px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            borderBottom: '1px solid #f0f0f0',
            transition: 'margin-left 0.2s',
          }}
        >
          <Breadcrumb>{breadcrumbItems}</Breadcrumb>

          <div className="name">
            <UserOutlined />
            <div className="username"> {user?.username} |</div>
            <div style={{ cursor: 'pointer', color: '#1890ff' }} onClick={handleLogout}>
              Выйти
            </div>
          </div>
        </Header>

        <Content
          style={{
            margin: '16px',
            minHeight: '100vh',
            overflow: 'auto',
          }}
        >
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  )
}
