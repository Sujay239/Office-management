import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  IconLogout,
  IconSettings,
  IconDashboard,
  IconListCheck,
  IconMessageDots,
  IconUsersGroup,
  IconCalendarEvent,
  IconDoorEnter,
} from '@tabler/icons-react';



import { removeTokenCookie } from '../lib/auth';
import { useNavigate } from 'react-router-dom';
import { Code, Group } from '@mantine/core';

import classes from './NavbarSimple.module.css';

const data = [
  { link: '/admin', label: 'Dashboard', icon: IconDashboard },
  { link: '/admin/tasks', label: 'Tasks', icon: IconListCheck },
  { link: '/admin/chat', label: 'Chat', icon: IconMessageDots },
  { link: '/admin/attendes', label: 'Attendes', icon: IconCalendarEvent },
  { link: '/admin/log', label: 'Office In/Out', icon: IconDoorEnter },
  { link: '/admin/users', label: 'Users', icon: IconUsersGroup },
  { link: '/admin/settings', label: 'Other Settings', icon: IconSettings },
];


export function Sidebar() {
  const location = useLocation();
  const [, setActive] = useState('Billing');
  const navigate = useNavigate();

  const handleLogout = (event: React.MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault();
    removeTokenCookie();
    navigate('/');
  };

  const links = data.map((item) => (
    <Link
      className={classes.link}
      data-active={location.pathname === item.link || undefined}
      to={item.link}
      key={item.label}
      onClick={() => setActive(item.label)}
    >
      <item.icon className={classes.linkIcon} stroke={1.5} />
      <span>{item.label}</span>
    </Link>
  ));

  return (
    <nav className={classes.navbar}>
      <div className={classes.navbarMain}>
        <Group className={classes.header} justify="space-between">
          <img src="/logo.png" alt="Logo" className={classes.logo} />
          <Code fw={700}>v0.1</Code>
        </Group>
        {links}
      </div>

      <div className={classes.footer}>
        <a href="#" className={classes.link} onClick={handleLogout}>
          <IconLogout className={classes.linkIcon} stroke={1.5} />
          <span>Logout</span>
        </a>
      </div>
    </nav>
  );
}

