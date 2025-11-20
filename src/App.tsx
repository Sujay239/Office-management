

import { BrowserRouter, useLocation } from "react-router-dom";
import AppRoutes from "./routes";
import { Notifications } from '@mantine/notifications';
import { useEffect } from 'react';

import '@mantine/core/styles.css';
import '@mantine/notifications/styles.css';

function TitleUpdater() {
  const location = useLocation();
  useEffect(() => {
    // Map routes to titles
    const routeTitles: { [key: string]: string } = {
      '/admin': 'Dashboard',
      '/admin/tasks': 'Tasks',
      '/admin/chat': 'Chat',
      '/admin/users': 'Users',
      '/admin/log': 'Office In/Out',
      '/admin/settings': 'Other Settings',
      '/admin/attendes': 'Attendes',
      '/user/profile': 'Profile',
      '/': 'Home',
    };
    // Find best match
    const path = location.pathname;
  const title = routeTitles[path] || 'autocomputation Management Software';
  document.title = `${title} - autocomputation Management Software`;
  }, [location]);
  return null;
}

function App() {
  return (
    <>
      <Notifications />
      <BrowserRouter>
        <TitleUpdater />
        <AppRoutes />
      </BrowserRouter>
    </>
  );
}

export default App;
