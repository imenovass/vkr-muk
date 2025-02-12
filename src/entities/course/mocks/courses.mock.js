import {Button} from "antd";
import React from "react";

export const courseMocks = [
    {
        title: "Изображение",
        dataIndex: "imageUrl",
        key: "imageUrl",
        width: 70,
        render: (url, record) => {
            // Используем другую заглушку
            const defaultImage = "https://placehold.co/50x50?text=No+Image";
            const imageSrc = url || defaultImage;
            return (
                <img
                    src={imageSrc}
                    alt={record.title}
                    style={{ width: 50, height: 50, objectFit: "cover", borderRadius: "50%" }}
                />
            );
        },
    },
    {
        title: "Название",
        dataIndex: "title",
        key: "title",
    },
    {
        title: "Описание",
        dataIndex: "description",
        key: "description",
    },
    {
        title: "Действия",
        key: "actions",
        render: (text, record) => (
            <Button type="link" onClick={() => navigate(`/courses/${record.id}`)}>
                Открыть
            </Button>
        ),
    },
];
