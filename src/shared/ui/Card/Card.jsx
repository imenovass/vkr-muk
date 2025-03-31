import React from 'react';
import { Button, Card, Col, Typography } from 'antd';
import './Card.scss';

const { Title, Text } = Typography;

const DashboardCard = ({ title, value, extra, link, linkText }) => (
    <Col span={8}>
        <Card className="dashboard-card">
            <Title level={4}>{title}</Title>
            <Text className="dashboard-card-value">{value}</Text>
            {link && (
                <div className="dashboard-card-link">
                    <Button type="primary"  href={link}>{linkText}</Button>
                </div>
            )}
        </Card>
    </Col>
);

export default DashboardCard;
