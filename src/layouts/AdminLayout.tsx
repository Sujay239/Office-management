import { useEffect, useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { Sidebar } from "../Components/sidebar";
import { IconMenu2, IconX } from "@tabler/icons-react";

export default function AdminLayout() {
  const [opened, setOpened] = useState(false);
  const location = useLocation();

  // 👇 auto-close sidebar when route changes (even if user navigates some other way)
  useEffect(() => {
    setOpened(false);
  }, [location.pathname]);

  return (
    <div className="flex min-h-[97vh] relative">
      {/* Burger button (mobile only) */}

      <button
        onClick={() => setOpened((o) => !o)}
        className="
          lg:hidden fixed top-6 left-6 z-50 flex h-10 w-10 items-center justify-center rounded-md border border-white/20 bg-slate-900/90 text-white shadow
        "
      >
        {opened ? <IconX size={15} /> : <IconMenu2 size={15} />}
      </button>

      {/* Overlay when sidebar is open (mobile) */}
      {opened && (
        <div
          onClick={() => setOpened(false)}
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
        />
      )}

      {/* Sidebar container */}
      <aside
        className={`
          bg-slate-100 text-white shadow-xl
          w-64 h-screen z-50
          fixed top-0 left-0
          transform transition-transform duration-300
          ${opened ? "translate-x-0" : "-translate-x-full"}
          lg:static lg:translate-x-0 lg:block
        `}
      >
        <Sidebar onLinkClick={() => setOpened(false)} />
      </aside>

      {/* Main Content */}
      <main className="flex-1 pt-20 lg:pt-4 lg:ml-0">
        <Outlet />
      </main>
    </div>
  );
}
