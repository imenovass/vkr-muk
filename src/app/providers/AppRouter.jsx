import React, { Suspense } from "react";
import { Routes, Route, Navigate } from "react-router-dom";

import { LoginPage } from "../../pages/LoginPage";
import { AppLayout } from "../../widgets/AppLayout";

import { CoursesPageAsync } from "../../pages/CoursesPage/ui/CoursesPage.async";
import { TeacherZonePageAsync } from "../../pages/TeacherZonePage/ui/TeacherZonePage.async";

import { DashboardPageAsync } from "../../pages/DashboardPage/ui/DashboardPage.async";
import { ProfilePageAsync } from "../../pages/ProfilePage/ui/ProfilePage.async";
import { SchedulePageAsync } from "../../pages/SchedulePage/ui/SchedulePage.async";

import {CourseDetailPage} from "../../pages/CourseDetailPage/ui/CourseDetailPage";
import { Loader } from "../../shared/ui/Loader/Loader";
import {StudentListPage} from "../../pages/StudentListPage/StudentListPage";
import {StudentDetailPage} from "../../pages/StudentDetailPage/StudentDetailPage";


export const AppRouter = () => {
    return (
        <Routes>
            <Route path="/login" element={<LoginPage />} />

            <Route path="/" element={<AppLayout />}>
                <Route
                    index
                    element={
                        <Suspense fallback={<Loader />}>
                            <DashboardPageAsync />
                        </Suspense>
                    }
                />
                <Route
                    path="profile"
                    element={
                        <Suspense fallback={<Loader />}>
                            <ProfilePageAsync />
                        </Suspense>
                    }
                />
                <Route path="/students" element={<StudentListPage />} />
                <Route path="/students/:username" element={<StudentDetailPage />} />
                <Route
                    path="teacher-zone"
                    element={
                        <Suspense fallback={<Loader />}>
                            <TeacherZonePageAsync />
                        </Suspense>
                    }
                />
                <Route
                    path="schedule"
                    element={
                        <Suspense fallback={<Loader />}>
                            <SchedulePageAsync />
                        </Suspense>
                    }
                />
                <Route
                    path="courses"
                    element={
                        <Suspense fallback={<Loader />}>
                            <CoursesPageAsync />
                        </Suspense>
                    }
                />
                <Route path="courses/:courseId" element={<CourseDetailPage />} />
            </Route>

            <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
    );
};
