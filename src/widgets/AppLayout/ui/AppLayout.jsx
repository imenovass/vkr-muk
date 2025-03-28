import React from "react";
import { Layout, Menu, Breadcrumb } from "antd";
import {
    HomeOutlined,
    BookOutlined,
    CalendarOutlined,
    UserOutlined,
    PieChartOutlined,
} from "@ant-design/icons";
import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import { getSession, clearSession } from "../../../features/auth/model/session";
import { breadcrumbNameMap } from "../../../shared/config/breadcrumbs";
import Logo from "../../../shared/ui/Logo/Logo";

const { Sider, Header, Content } = Layout;

export const AppLayout = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const user = getSession();


    React.useEffect(() => {
        if (!user) {
            navigate("/login");
        }
    }, [user, navigate]);


    // Логика меню (подсветка пункта)
    const selectedKey = `/${location.pathname.split("/")[1]}`;

    // --- Хлебные крошки ---
    // Разбиваем текущий путь на сегменты
    const pathSnippets = location.pathname.split("/").filter(Boolean);

    // Формируем <Breadcrumb.Item> для каждого сегмента
    const extraBreadcrumbItems = pathSnippets.map((segment, index) => {
        const url = "/" + pathSnippets.slice(0, index + 1).join("/");

        let name = breadcrumbNameMap[url];
        // Если, например, /courses/123 → «Детали курса (ID: 123)»
        if (!name && index > 0 && pathSnippets[0] === "courses") {
            name = `Детали курса (ID: ${segment})`;
        }
        // Если не нашли в словаре – используем сам segment
        if (!name) {
            name = segment;
        }

        return (
            <Breadcrumb.Item key={url}>
                <NavLink to={url}>{name}</NavLink>
            </Breadcrumb.Item>
        );
    });

    // Добавляем пункт "Главная"
    const breadcrumbItems = [
        <Breadcrumb.Item key="home">
            <NavLink to="/">Главная</NavLink>
        </Breadcrumb.Item>,
        ...extraBreadcrumbItems,
    ];

    const handleLogout = () => {
        clearSession();
        navigate("/login");
    };

    return (
        <Layout style={{ minHeight: "100vh" }}>
            {/* Фиксированный Sider */}
            <Sider
                width={200}
                collapsible
                style={{
                    position: "fixed",
                    left: 0,
                    top: 0,
                    bottom: 0,
                    overflow: "auto", // Если меню длинное, появляется скролл в самом Sider
                }}
            >
                <Logo />
                <Menu theme="dark" mode="inline" selectedKeys={[selectedKey]}>
                    <Menu.Item key="/" icon={<HomeOutlined />}>
                        <NavLink to="/">Главная</NavLink>
                    </Menu.Item>
                    <Menu.Item key="/courses" icon={<BookOutlined />}>
                        <NavLink to="/courses">Курсы</NavLink>
                    </Menu.Item>
                    <Menu.Item key="/schedule" icon={<CalendarOutlined />}>
                        <NavLink to="/schedule">Расписание</NavLink>
                    </Menu.Item>
                    <Menu.Item key="/profile" icon={<UserOutlined />}>
                        <NavLink to="/profile">Профиль</NavLink>
                    </Menu.Item>
                    {user?.role === "teacher" && (
                        <Menu.Item key="/teacher-zone" icon={<PieChartOutlined />}>
                            <NavLink to="/teacher-zone">Для преподавателя</NavLink>
                        </Menu.Item>
                    )}
                </Menu>
            </Sider>

            {/* Чтобы контент не налезал на зафиксированный Sider,
          смещаем Layout вправо на ширину в 200px */}
            <Layout style={{ marginLeft: 200 }}>
                <Header
                    style={{
                        background: "#fff",
                        padding: "0 16px",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        borderBottom: "1px solid #f0f0f0",
                    }}
                >
                    {/* Хлебные крошки */}
                    <Breadcrumb>{breadcrumbItems}</Breadcrumb>

                    {/* Имя пользователя + Logout */}
                    <div>
                        {user?.fullName} ({user?.role}) |{" "}
                        <span style={{ cursor: "pointer", color: "#1890ff" }} onClick={handleLogout}>
              Выйти
            </span>
                    </div>
                </Header>

                <Content style={{ margin: "16px", minHeight: "100vh", overflow: "auto" }}>
                    <Outlet />
                </Content>
            </Layout>
        </Layout>
    );
};
