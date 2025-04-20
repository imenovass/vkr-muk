import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
    Tabs,
    Button,
    Modal,
    Form,
    Input,
    Upload,
    message,
    List,
    Card,
    Select,
    Avatar,
    Popconfirm,
} from "antd";
import {
    UserOutlined,
    DeleteOutlined,
    InboxOutlined,
    EditOutlined,
} from "@ant-design/icons";

import { getSession } from "../../../features/auth/model/session";
import {
    getCourseById,
    addMaterial,
    updateMaterial,
    deleteMaterial,
    addSubmission,
    setSubmissionGrade,
    updateCourse,
    deleteCourse,
    addMaterialCompletion,
} from "../../../entities/course/model/courseStorage";

import "./style.scss";

const { Dragger } = Upload;
const { TextArea } = Input;

export const CourseDetailPage = () => {
    const { courseId } = useParams();
    const navigate = useNavigate();
    const user = getSession();

    const [course, setCourse] = useState(null);

    // Модалки
    // 1) Создание материала
    const [isMaterialModalOpen, setIsMaterialModalOpen] = useState(false);
    const [materialForm] = Form.useForm();
    // (важно!) Управляем списком файлов для материала
    const [materialFileList, setMaterialFileList] = useState([]);

    // 2) Редактирование материала
    const [isEditMaterialModalOpen, setIsEditMaterialModalOpen] = useState(false);
    const [editMaterialForm] = Form.useForm();
    const [editingMaterialId, setEditingMaterialId] = useState(null);

    // 3) Загрузка домашки (студент)
    const [isSubmissionModalOpen, setIsSubmissionModalOpen] = useState(false);
    const [submissionForm] = Form.useForm();
    // (важно!) Управляем списком файлов для домашки
    const [submissionFileList, setSubmissionFileList] = useState([]);

    // 4) Выставление оценки (учитель)
    const [isGradeModalOpen, setIsGradeModalOpen] = useState(false);
    const [gradeForm] = Form.useForm();
    const [gradingSubmissionId, setGradingSubmissionId] = useState(null);

    // 5) Редактирование курса
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editForm] = Form.useForm();

    // Оставить ответ к материалу
    const [isReflectionModalOpen, setIsReflectionModalOpen] = useState(false);
    const [reflectionForm] = Form.useForm();
    const [currentMaterialId, setCurrentMaterialId] = useState(null);

    useEffect(() => {
        reloadCourse();
    }, [courseId]);

    const reloadCourse = () => {
        const c = getCourseById(courseId);
        setCourse(c);
    };

    if (!course) {
        return <div style={{ padding: 16 }}>Курс не найден</div>;
    }

    // =======================
    // Ответ по материалу (Reflection)
    // =======================
    const openReflectionModal = (materialId) => {
        setCurrentMaterialId(materialId);
        reflectionForm.resetFields();
        setIsReflectionModalOpen(true);
    };
    const closeReflectionModal = () => {
        setIsReflectionModalOpen(false);
        setCurrentMaterialId(null);
        reflectionForm.resetFields();
    };
    const handleReflectionSubmit = async () => {
        try {
            const { reflection } = await reflectionForm.validateFields();
            if (!reflection) {
                message.error("Введите ответ!");
                return;
            }
            addMaterialCompletion(courseId, currentMaterialId, user.username, reflection);
            message.success("Ответ сохранён!");
            closeReflectionModal();
            reloadCourse();
        } catch (err) {
            console.error(err);
        }
    };

    // =======================
    // Удалить участника (teacher)
    // =======================
    const handleRemoveParticipant = (participantName) => {
        const updatedParticipants = course.participants.filter(
          (p) => p !== participantName
        );
        const updated = updateCourse(courseId, {
            participants: updatedParticipants,
        });
        setCourse(updated);
        message.success(`Участник "${participantName}" удалён из курса`);
    };

    // =======================
    // Редактирование / Удалить курс (teacher)
    // =======================
    const openEditModal = () => {
        editForm.setFieldsValue({
            title: course.title,
            description: course.description,
            url: course.url,
        });
        setIsEditModalOpen(true);
    };
    const closeEditModal = () => {
        setIsEditModalOpen(false);
        editForm.resetFields();
    };
    const handleEditCourse = async () => {
        try {
            const { title, description, url } = await editForm.validateFields();
            const updated = updateCourse(courseId, { title, description, url });
            setCourse(updated);
            message.success("Курс обновлён!");
            closeEditModal();
        } catch (err) {
            console.error(err);
        }
    };
    const handleDeleteCourse = () => {
        deleteCourse(courseId);
        message.success("Курс удалён!");
        navigate("/courses");
    };

    // =======================
    // (C)reate материал (teacher)
    // =======================
    const openMaterialModal = () => {
        // (важно!) сбрасываем форму и state списка файлов
        materialForm.resetFields();
        setMaterialFileList([]);
        setIsMaterialModalOpen(true);
    };
    const closeMaterialModal = () => {
        setIsMaterialModalOpen(false);
        materialForm.resetFields();
        setMaterialFileList([]);
    };
    const handleMaterialSubmit = async () => {
        try {
            await materialForm.validateFields();
            const { title, url } = materialForm.getFieldsValue();

            // Берём первый загруженный файл, если он есть
            let fileBase64 = "";
            if (materialFileList.length > 0) {
                const fileObj = materialFileList[0].originFileObj;
                fileBase64 = await fileToBase64(fileObj);
            }

            addMaterial(courseId, {
                title,
                url,
                fileData: fileBase64,
                authorId: user.username,
                createdAt: new Date().toISOString(),
            });

            message.success("Материал добавлен!");
            closeMaterialModal();
            reloadCourse();
        } catch (err) {
            console.error(err);
        }
    };

    // =======================
    // (U)pdate материал (teacher)
    // =======================
    const openEditMaterialModal = (material) => {
        setEditingMaterialId(material.id);
        editMaterialForm.setFieldsValue({
            title: material.title,
            url: material.url,
        });
        setIsEditMaterialModalOpen(true);
    };
    const closeEditMaterialModal = () => {
        setIsEditMaterialModalOpen(false);
        setEditingMaterialId(null);
        editMaterialForm.resetFields();
    };
    const handleEditMaterial = async () => {
        try {
            await editMaterialForm.validateFields();
            const { title, url } = editMaterialForm.getFieldsValue();
            if (!title) {
                message.error("Название материала обязательно!");
                return;
            }
            const updated = updateMaterial(courseId, editingMaterialId, {
                title,
                url,
            });
            if (updated) {
                message.success("Материал обновлён!");
                reloadCourse();
            }
            closeEditMaterialModal();
        } catch (err) {
            console.error(err);
        }
    };

    // =======================
    // (D)elete материал (teacher)
    // =======================
    const handleDeleteMaterial = (materialId) => {
        deleteMaterial(courseId, materialId);
        message.success("Материал удалён!");
        reloadCourse();
    };

    // =======================
    // Загрузить домашку (student)
    // =======================
    const openSubmissionModal = () => {
        // (важно!) сбрасываем форму и стейт
        submissionForm.resetFields();
        setSubmissionFileList([]);
        setIsSubmissionModalOpen(true);
    };
    const closeSubmissionModal = () => {
        setIsSubmissionModalOpen(false);
        submissionForm.resetFields();
        setSubmissionFileList([]);
    };
    const handleSubmissionSubmit = async () => {
        try {
            await submissionForm.validateFields();
            const { comment } = submissionForm.getFieldsValue();
            if (submissionFileList.length === 0) {
                message.error("Необходимо прикрепить файл домашки!");
                return;
            }
            const fileObj = submissionFileList[0].originFileObj;
            const fileBase64 = await fileToBase64(fileObj);

            addSubmission(courseId, {
                studentId: user.username,
                fileData: fileBase64,
                comment,
                createdAt: new Date().toISOString(),
            });
            message.success("Домашка отправлена!");
            closeSubmissionModal();
            reloadCourse();
        } catch (err) {
            console.error(err);
        }
    };

    // =======================
    // Поставить оценку (teacher)
    // =======================
    const openGradeModal = (submissionId) => {
        setGradingSubmissionId(submissionId);
        gradeForm.setFieldsValue({ grade: "" });
        setIsGradeModalOpen(true);
    };
    const closeGradeModal = () => {
        setIsGradeModalOpen(false);
        setGradingSubmissionId(null);
    };
    const handleSetGrade = async () => {
        try {
            const { grade } = await gradeForm.validateFields();
            setSubmissionGrade(courseId, gradingSubmissionId, grade);
            message.success("Оценка выставлена");
            closeGradeModal();
            reloadCourse();
        } catch (err) {
            console.error(err);
        }
    };

    // =======================
    // fileToBase64 (утилита)
    // =======================
    const fileToBase64 = (file) => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => resolve(e.target.result);
            reader.onerror = (err) => reject(err);
            reader.readAsDataURL(file);
        });
    };

    function openPdfInNewTab(base64Pdf) {
        const [header, base64String] = base64Pdf.split(",");
        const byteCharacters = atob(base64String);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
            byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        const blob = new Blob([byteArray], { type: "application/pdf" });
        const blobUrl = URL.createObjectURL(blob);

        const pdfWindow = window.open("", "_blank");
        if (!pdfWindow) {
            alert("Окно было заблокировано браузером. Разрешите всплывающие окна (popups).");
            return;
        }
        pdfWindow.document.write(`
      <html>
      <head><title>PDF Preview</title></head>
      <body style="margin:0">
        <iframe
          width="100%"
          height="100%"
          style="border:none"
          src="${blobUrl}"
        ></iframe>
      </body>
      </html>
    `);
    }

    // =======================
    // Рендер списка материалов
    // =======================
    const renderMaterialsTab = () => {
        return (
          <div style={{ padding: 16 }}>
              {user.role === "teacher" && (
                <Button
                  type="primary"
                  onClick={openMaterialModal}
                  style={{ marginBottom: 16 }}
                >
                    Загрузить материал
                </Button>
              )}

              {course.materials?.length === 0 && <p>Материалов нет</p>}

              <List
                dataSource={course.materials}
                renderItem={(material) => {
                    const actions = [];
                    if (user.role === "teacher") {
                        actions.push(
                          <Button
                            type="link"
                            icon={<EditOutlined />}
                            onClick={() => openEditMaterialModal(material)}
                          />
                        );
                        actions.push(
                          <Popconfirm
                            title="Удалить материал?"
                            onConfirm={() => handleDeleteMaterial(material.id)}
                          >
                              <Button type="link" danger icon={<DeleteOutlined />} />
                          </Popconfirm>
                        );
                    }

                    return (
                      <List.Item>
                          <Card title={material.title} actions={actions} className="card-silka">
                              {material.url && (
                                <p>
                                    Ссылка:{" "}
                                    <a href={material.url} target="_blank" rel="noreferrer">
                                        {material.url}
                                    </a>
                                </p>
                              )}
                              <p>Автор: {material.authorId}</p>

                              {material.fileData && (
                                <Button onClick={() => openPdfInNewTab(material.fileData)}>
                                    Посмотреть документ
                                </Button>
                              )}
                          </Card>
                      </List.Item>
                    );
                }}
              />
          </div>
        );
    };

    // =======================
    // Рендер таба "Домашние работы"
    // =======================
    const renderSubmissionsTab = () => {
        const visibleSubmissions =
          user.role === "teacher"
            ? course.submissions
            : (course.submissions || []).filter(
              (sub) => sub.studentId === user.username
            );

        if (!visibleSubmissions || visibleSubmissions.length === 0) {
            return (
              <div style={{ padding: 16 }}>
                  {user.role === "student" ? (
                    <p>Вы пока не загрузили ни одной работы.</p>
                  ) : (
                    <p>Пока никто не загрузил работы</p>
                  )}
                  {user.role === "student" && (
                    <Button type="primary" onClick={openSubmissionModal}>
                        Загрузить работу
                    </Button>
                  )}
              </div>
            );
        }

        return (
          <div style={{ padding: 16 }}>
              {user.role === "student" && (
                <Button
                  type="primary"
                  onClick={openSubmissionModal}
                  style={{ marginBottom: 16 }}
                >
                    Загрузить работу
                </Button>
              )}

              <List
                dataSource={visibleSubmissions}
                renderItem={(sub) => {
                    const isAuthor = sub.studentId === user.username;
                    return (
                      <List.Item>
                          <Card className="card-silka">
                              <p>
                                  <b>Студент:</b> {sub.studentId}
                              </p>
                              <p>{sub.comment}</p>
                              <p>
                                  <Button onClick={() => openPdfInNewTab(sub.fileData)}>
                                      Посмотреть документ
                                  </Button>
                              </p>
                              {sub.grade ? (
                                <p style={{ color: "green" }}>
                                    Оценка: <b>{sub.grade}</b>
                                </p>
                              ) : (
                                <p style={{ color: "red" }}>Оценка не выставлена</p>
                              )}

                              {user.role === "teacher" && (
                                <Button type="primary" onClick={() => openGradeModal(sub.id)}>
                                    Поставить оценку
                                </Button>
                              )}

                              {user.role === "student" && isAuthor && (
                                <p style={{ fontSize: 12, color: "#999" }}>
                                    (Вы загрузили эту работу)
                                </p>
                              )}
                          </Card>
                      </List.Item>
                    );
                }}
              />
          </div>
        );
    };

    return (
      <div className="coursePage">
          <div
            style={{
                marginBottom: 16,
                padding: 16,
                background: "#f5f5f5",
                borderRadius: 4,
            }}
          >
              <h2 style={{ marginBottom: 8 }}>{course.title}</h2>
              {course.url && (
                <p style={{ marginBottom: 8 }}>
                    Ссылка:{" "}
                    <a href={course.url} target="_blank" rel="noreferrer">
                        {course.url}
                    </a>
                </p>
              )}
              <p style={{ margin: 0 }}>{course.description}</p>

              {user.role === "teacher" && (
                <div style={{ marginTop: 16 }}>
                    <Button style={{ marginRight: 8 }} onClick={openEditModal}>
                        Редактировать
                    </Button>
                    <Button danger onClick={handleDeleteCourse}>
                        Удалить
                    </Button>
                </div>
              )}
          </div>

          {user.role === "teacher" && (
            <div
              style={{
                  marginBottom: 24,
                  padding: 16,
                  background: "#fafafa",
                  border: "1px solid #ddd",
                  borderRadius: 4,
              }}
            >
                <h3>Участники курса:</h3>
                {course.participants?.length > 0 ? (
                  <List
                    dataSource={course.participants}
                    style={{ marginTop: 8 }}
                    renderItem={(participant) => (
                      <List.Item
                        actions={[
                            <Popconfirm
                              title={`Удалить участника "${participant}"?`}
                              okText="Да"
                              cancelText="Нет"
                              onConfirm={() => handleRemoveParticipant(participant)}
                            >
                                <Button type="link" danger icon={<DeleteOutlined />} />
                            </Popconfirm>,
                        ]}
                      >
                          <List.Item.Meta
                            avatar={<Avatar icon={<UserOutlined />} />}
                            title={participant}
                            description="Участник курса"
                          />
                      </List.Item>
                    )}
                  />
                ) : (
                  <p>Пока нет участников</p>
                )}
            </div>
          )}

          <Tabs defaultActiveKey="materials">
              <Tabs.TabPane tab="Материалы" key="materials">
                  {renderMaterialsTab()}
              </Tabs.TabPane>
              <Tabs.TabPane tab="Домашние работы" key="submissions">
                  {renderSubmissionsTab()}
              </Tabs.TabPane>
          </Tabs>

          {/* ============================= */}
          {/* Модалка: Редактировать курс */}
          {/* ============================= */}
          <Modal
            title="Редактировать курс"
            open={isEditModalOpen}
            onCancel={closeEditModal}
            onOk={handleEditCourse}
          >
              <Form layout="vertical" form={editForm}>
                  <Form.Item
                    label="Название курса"
                    name="title"
                    rules={[{ required: true, message: "Введите название" }]}
                  >
                      <Input />
                  </Form.Item>
                  <Form.Item label="Описание курса" name="description">
                      <Input.TextArea rows={2} />
                  </Form.Item>
                  <Form.Item label="URL" name="url">
                      <Input placeholder="Например: https://example.com" />
                  </Form.Item>
              </Form>
          </Modal>

          {/* ============================= */}
          {/* Модалка: Создать материал (Create) */}
          {/* ============================= */}
          <Modal
            title="Загрузить материал"
            open={isMaterialModalOpen}
            onCancel={closeMaterialModal}
            onOk={handleMaterialSubmit}
          >
              <Form layout="vertical" form={materialForm}>
                  <Form.Item
                    label="Название материала"
                    name="title"
                    rules={[{ required: true, message: "Введите название" }]}
                  >
                      <Input />
                  </Form.Item>
                  <Form.Item label="URL (необязательно)" name="url">
                      <Input placeholder="https://example.com/something" />
                  </Form.Item>
              </Form>

              {/* (важно!) Контролируемый Upload */}
              <Dragger
                accept="application/pdf"
                multiple={false}
                fileList={materialFileList}
                beforeUpload={(file) => {
                    if (file.type !== "application/pdf") {
                        message.error("Можно загрузить только PDF-файлы!");
                        return Upload.LIST_IGNORE;
                    }
                    return true; // пропускаем в onChange
                }}
                onChange={(info) => {
                    // Сами решаем, какие файлы оставить
                    setMaterialFileList(info.fileList.slice(-1)); // оставим последний добавленный
                }}
              >
                  <p className="ant-upload-drag-icon">
                      <InboxOutlined />
                  </p>
                  <p>Нажмите или перетащите PDF-файл</p>
              </Dragger>
          </Modal>

          {/* ============================= */}
          {/* Модалка: Редактировать материал (Update) */}
          {/* ============================= */}
          <Modal
            title="Редактировать материал"
            open={isEditMaterialModalOpen}
            onCancel={closeEditMaterialModal}
            onOk={handleEditMaterial}
          >
              <Form layout="vertical" form={editMaterialForm}>
                  <Form.Item
                    label="Название материала"
                    name="title"
                    rules={[{ required: true, message: "Введите название" }]}
                  >
                      <Input />
                  </Form.Item>
                  <Form.Item label="URL" name="url">
                      <Input placeholder="https://example.com/..." />
                  </Form.Item>
              </Form>
          </Modal>

          {/* ============================= */}
          {/* Модалка: Загрузить домашку (Student) */}
          {/* ============================= */}
          <Modal
            title="Загрузить работу"
            open={isSubmissionModalOpen}
            onCancel={closeSubmissionModal}
            onOk={handleSubmissionSubmit}
          >
              <Form layout="vertical" form={submissionForm}>
                  <Form.Item
                    label="Комментарий"
                    name="comment"
                    rules={[{ required: true, message: "Введите комментарий" }]}
                  >
                      <Input />
                  </Form.Item>
              </Form>
              <Dragger
                multiple={false}
                fileList={submissionFileList}
                beforeUpload={(file) => {
                    // Здесь можно проверить тип файла, размер и т.п.
                    return true; // Пропустим в onChange
                }}
                onChange={(info) => {
                    // берем только последний файл
                    setSubmissionFileList(info.fileList.slice(-1));
                }}
              >
                  <p className="ant-upload-drag-icon">
                      <InboxOutlined />
                  </p>
                  <p>Нажмите или перетащите файл</p>
              </Dragger>
          </Modal>

          {/* ============================= */}
          {/* Модалка: Поставить оценку (Teacher) */}
          {/* ============================= */}
          <Modal
            title="Поставить оценку"
            open={isGradeModalOpen}
            onCancel={closeGradeModal}
            onOk={handleSetGrade}
          >
              <Form layout="vertical" form={gradeForm}>
                  <Form.Item
                    label="Оценка"
                    name="grade"
                    rules={[{ required: true, message: "Введите оценку" }]}
                  >
                      <Select>
                          <Select.Option value="5">5</Select.Option>
                          <Select.Option value="4">4</Select.Option>
                          <Select.Option value="3">3</Select.Option>
                          <Select.Option value="2">2</Select.Option>
                      </Select>
                  </Form.Item>
              </Form>
          </Modal>

          {/* ============================= */}
          {/* Модалка: Оставить ответ по материалу */}
          {/* ============================= */}
          <Modal
            title="Оставить ответ по материалу"
            open={isReflectionModalOpen}
            onCancel={closeReflectionModal}
            onOk={handleReflectionSubmit}
          >
              <Form layout="vertical" form={reflectionForm}>
                  <Form.Item
                    label="Ваш ответ"
                    name="reflection"
                    rules={[{ required: true, message: "Введите ответ" }]}
                  >
                      <TextArea
                        rows={3}
                        placeholder="Что нового узнали, осталось ли что-то непонятное?"
                      />
                  </Form.Item>
              </Form>
          </Modal>
      </div>
    );
};
