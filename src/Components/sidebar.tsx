// Sidebar.tsx
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  IconLogout,
  IconSettings,
  IconDashboard,
  IconListCheck,
  IconMessageDots,
  IconUsersGroup,
  IconCalendarEvent,
  IconDoorEnter,
} from "@tabler/icons-react";
// import { Code } from "@mantine/core";
import { removeTokenCookie } from "../lib/auth";

type SidebarProps = {
  onLinkClick?: () => void; // 👈 parent can pass this to close on mobile
};

type NavItem = {
  link: string;
  label: string;
  icon: typeof IconDashboard;
};

const data: NavItem[] = [
  { link: "/admin", label: "Dashboard", icon: IconDashboard },
  { link: "/admin/tasks", label: "Tasks", icon: IconListCheck },
  { link: "/admin/chat", label: "Chat", icon: IconMessageDots },
  { link: "/admin/attendes", label: "Attendes", icon: IconCalendarEvent },
  { link: "/admin/log", label: "Office In/Out", icon: IconDoorEnter },
  { link: "/admin/users", label: "Users", icon: IconUsersGroup },
  { link: "/admin/settings", label: "Other Settings", icon: IconSettings },
];

export function Sidebar({onLinkClick }: SidebarProps) {
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = (event: React.MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault();
    removeTokenCookie();
    navigate("/");
  };






  const links = data.map((item) => {
    const Icon = item.icon;
    const active = location.pathname === item.link;

    return (
      <Link
        key={item.label}
        to={item.link}
        onClick={() => onLinkClick?.()}
        className={[
          "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
          "hover:bg-slate-800/70 hover:text-sky-300 hover:scale-105 transition-transform",
          active
            ? "bg-slate-800 text-sky-300 border border-sky-500/60 shadow-sm"
            : "text-slate-950 border border-transparent",
        ].join(" ")}
      >
        <Icon className="h-5 w-5 shrink-0" stroke={1.6} />
        <span className="truncate">{item.label}</span>
      </Link>
    );
  });

  return (
    <>
        {/* Header */}
        <div className="flex flex-col items-center justify-between gap-3 border-b border-slate-800 px-4 py-4 w-full">
          <div className="flexitems-center gap-2">
            <img
              src="/logo.png"
              alt="Logo"
              className="h-8 w-32 rounded-md object-contain"
            />

              <span className="text-xs text-slate-950 font-black">Admin Panel</span>

          </div>

        </div>

        {/* Nav links */}
        <div className="flex h-[calc(100%-4.5rem)] flex-col justify-between">
          <nav className="flex flex-col gap-1 px-3 py-3 overflow-y-auto">
            {links}
          </nav>

          {/* Footer logout */}
          <div className="border-t border-slate-800 px-3 py-3">
            <a
              href="#"
              onClick={handleLogout}
              className="
                flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium bg-red-900
                text-white hover:bg-red-900 hover:scale-105 transition-transform mb-8
              "
            >
              <IconLogout color="white" className="h-5 w-5" stroke={2} />
              <span>Logout</span>
            </a>
          </div>
        </div>

    </>
  );
}
