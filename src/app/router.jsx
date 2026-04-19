import Login from "../public/pages/Login";
import Register from "../public/pages/Register";
import Courses from "../public/pages/Courses";
import { createBrowserRouter } from "react-router-dom";
import PublicLayout from "../public/layout/PublicLayout";
import Home from "../public/pages/Home";
import ProtectedRoute from "../shared/components/ProtectedRoute";
import StudentLayout from "../student/layout/StudentLayout";
import AdminLayout from "../admin/layout/AdminLayout";
import AdminSettings from "../admin/pages/Settings";
import Contact from "../public/pages/Contact";
import CourseDetails from "../public/pages/CourseDetails";
import Dashboard from "../student/pages/Dashboard";
import MyCourses from "../student/pages/MyCourses";
import StudentCertificates from "../student/pages/Certificates";
import StudentProfile from "../student/pages/Profile";
import StudentSecurity from "../student/pages/Security";
import StudentHistory from "../student/pages/History";
import WatchCourse from "../student/pages/WatchCourse";

import AdminDashboard from "../admin/pages/Dashboard";
import AdminCourses from "../admin/pages/Courses";
import AdminStudents from "../admin/pages/Students";
import EditCourse from "../admin/pages/EditCourse";
import CourseCurriculum from "../admin/pages/CourseCurriculum";
import PageNotFound from "../public/pages/PageNotFound";
import Terms from "../public/pages/Terms";
import Privacy from "../public/pages/Privacy";
import AboutUs from "../public/components/AboutUs";


import AdminTeachers from "../admin/pages/Teachers";
import TeacherLayout from "../teacher/layout/TeacherLayout";
import TeacherDashboard from "../teacher/pages/TeacherDashboard";
import TeacherCourses from "../teacher/pages/TeacherCourses";
import TeacherStudents from "../teacher/pages/TeacherStudents";


export const router = createBrowserRouter([
    {
        path: "/",
        element: <PublicLayout />,
        children: [
            { index: true, element: <Home /> },
            { path: "login", element: <Login /> },
            { path: "register", element: <Register /> },
            { path: "courses", element: <Courses /> },
            { path: "pricing", element: <Courses /> },
            { path: "contact", element: <Contact /> },
            { path: "aboutus", element: <AboutUs /> },
            { path: "courses/:courseId", element: <CourseDetails /> },
            { path: "course/:courseId", element: <CourseDetails /> },
            { path: "terms", element: <Terms /> },
            { path: "privacy", element: <Privacy /> },


        ],
    },

    {
        path: "/student",
        element: <ProtectedRoute role="student" />,
        children: [
            {
                path: "",
                element: <StudentLayout />,
                children: [
                    { index: true, element: <Dashboard /> },
                    { path: "my-courses", element: <MyCourses /> },
                    { path: "certificates", element: <StudentCertificates /> },
                    { path: "profile", element: <StudentProfile /> },
                    { path: "security", element: <StudentSecurity /> },
                    { path: "history", element: <StudentHistory /> },
                    { path: "watch/:courseId", element: <WatchCourse /> },

                ],
            },
        ],
    },

    {
        path: "/admin",
        element: <ProtectedRoute role="ADMIN" />,
        children: [
            {

                element: <AdminLayout />,
                children: [
                    { index: true, element: <AdminDashboard /> },
                    { path: "courses", element: <AdminCourses /> },
                    { path: "courses/:id", element: <EditCourse /> },
                    { path: "course/:id/manage", element: <CourseCurriculum /> },
                    { path: "students", element: <AdminStudents /> },
                    { path: "settings", element: <AdminSettings /> },
                ],
            },
        ],
    },
    {
        path: "/teacher",
        element: <ProtectedRoute role="TEACHER" />,
        children: [
            {

                element: <TeacherLayout />,
                children: [
                    { index: true, element: <TeacherDashboard /> },
                    { path: "courses", element: <TeacherCourses /> },
                    // { path: "courses/:id", element: <EditCourse /> },
                    { path: "course/:id/manage", element: <CourseCurriculum /> },
                    { path: "students", element: <TeacherStudents /> },
                    { path: "tests", element: <Tests /> },
                ],
            },
        ],
    },


    {
        path: "*",
        element: <PageNotFound />,
    }

]);
