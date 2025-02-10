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
    // Пример: "/courses/123" -> ["courses", "123"]

    // Готовим массив <Breadcrumb.Item>
    const extraBreadcrumbItems = pathSnippets.map((segment, index) => {
        const url = "/" + pathSnippets.slice(0, index + 1).join("/");
        // например, для segment="courses" url="/courses",
        // для segment="123" url="/courses/123"

        let name = breadcrumbNameMap[url];
        if (!name && index > 0 && pathSnippets[0] === "courses") {
            // Если первый сегмент "courses", а это второй сегмент (скорее всего ID)
            // Выведем "Детали курса" + сам ID (по желанию)
            name = `Детали курса (ID: ${segment})`;
        }

        // Если всё ещё нет name, будем выводить сам segment (fallback)
        if (!name) {
            name = segment;
        }

        return (
            <Breadcrumb.Item key={url}>
                <NavLink to={url}>{name}</NavLink>
            </Breadcrumb.Item>
        );
    });

    // Добавляем начальный пункт "Главная"
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
            <Sider collapsible>
                {/* Логотип или название */}
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

            <Layout className="site-layout">
                {/* Шапка */}
                <Header style={{
                    background: "#fff",
                    padding: "0 16px",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center"
                }}>
                    {/* Хлебные крошки слева */}
                    <Breadcrumb>{breadcrumbItems}</Breadcrumb>

                    {/* Имя пользователя + Logout справа */}
                    <div>
                        {user?.fullName} ({user?.role}) |{" "}
                        <span style={{ cursor: "pointer", color: "#1890ff" }} onClick={handleLogout}>
              Выйти
            </span>
                    </div>
                </Header>

                {/* Контент */}
                <Content style={{ margin: "16px" }}>
                    <Outlet />
                </Content>
            </Layout>
        </Layout>
    );
};
