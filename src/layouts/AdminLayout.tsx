import { Outlet } from "react-router-dom";
import { Sidebar } from "../Components/sidebar";

export default function AdminLayout() {
  return (
    <div style={{ display: "flex", minHeight: "97vh" }}>
      {/* Sidebar on the left */}
      <aside style={{ width: "300px", background: "#f5f5f5" }}>
        <Sidebar />
      </aside>

      {/* Page Content */}
      <main style={{ flex: 1, padding: "15px" }}>
        <Outlet />
      </main>
    </div>
  );
}
