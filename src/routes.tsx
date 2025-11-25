import { Routes, Route } from "react-router-dom";
import ProtectedRoute from "./Components/ProtectedRoute";
import UserLayout from "./layouts/UserLayout";
import AdminLayout from "./layouts/AdminLayout";

import Home from "./pages/user/Home";
import Profile from "./pages/user/Profile";
import Dashboard from "./pages/admin/Dashboard";
import Users from "./pages/admin/Users";
import Tasks from "./pages/admin/Tasks";
import Chat from "./pages/admin/Chat";
import OtherSettings from "./pages/admin/OtherSettings";
import AttendesAdmin from "./pages/admin/Attendes";
import Log from "./pages/admin/log";
import UserTasks from "./pages/user/task";
import Login from "./pages/auth/login";
import AttendesUser from "./pages/user/Attendes";
import NotFoundPage from "./pages/NotFound";
import ChatPanel from "./pages/admin/Chat";

export default function AppRoutes() {
  return (
    <Routes>

      {/* Login */}
      <Route path="/" element={<Login />} /> {/* Optimized for mobile */}

      {/* Protected User Routes */}
      <Route element={<ProtectedRoute />}>
        <Route path="/user" element={<UserLayout />}>                              //optimized for all devices
          <Route index element={<Home />} />                                      //optimized for all devices
          <Route path="/user/profile" element={<Profile />} />                   //optimized for all devices
          <Route path="/user/tasks" element={<UserTasks />} />                  //optimized for all devices
          <Route path="/user/attendes" element={<AttendesUser />} />           //optimized for all devices
          <Route path="/user/chat" element={<ChatPanel />} />                 //optimized for all devices
        </Route>

        {/* Protected Admin Routes */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<Dashboard />} />                         //optimized for all devices
          <Route path="tasks" element={<Tasks />} />
          <Route path="chat" element={<Chat />} />
          <Route path="chat" element={<Chat />} />                      //optimized for all devices
          <Route path="users" element={<Users />} />
          <Route path="log" element={<Log />} />
          <Route path="settings" element={<OtherSettings />} />
          <Route path="attendes" element={<AttendesAdmin />} />
        </Route>
      </Route>

      {/* Default/Fallback */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
