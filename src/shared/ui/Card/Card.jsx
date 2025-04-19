import React from "react";
import { Button, Card, Col, Typography } from "antd";
import "./Card.scss";

const { Title, Text } = Typography;

const DashboardCard = ({ title, value, extra, link, linkText }) => {
    return (
        // Указываем адаптивные размеры колонок:
        // xs={24}  -> будет занимать всю ширину на экранах < 576px
        // sm={12}  -> половину ширины от 576px до 768px
        // md={8}   -> треть ширины от 768px и выше
        <Col xs={24} sm={12} md={8}>
            <Card className="dashboard-card">
                <Title level={4}>{title}</Title>
                <Text className="dashboard-card-value">{value}</Text>

                {/* Блок для дополнительного контента */}
                {extra && <div className="dashboard-card-extra">{extra}</div>}

                {link && (
                    <div className="dashboard-card-link">
                        <Button type="primary" href={link}>
                            {linkText}
                        </Button>
                    </div>
                )}
            </Card>
        </Col>
    );
};

export default DashboardCard;
