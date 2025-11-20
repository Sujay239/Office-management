import { Outlet,} from "react-router-dom";
import { Nav } from "../Components/nav";
import { useEffect } from "react";

export default function UserLayout() {
  useEffect(() => {
    document.title = "Auto Computation - User Dashboard";
  }, []);
  return (
    <div>
      <nav>
        <Nav />
      </nav>
      <main className="flex justify-center items-center flex-wrap gap-4 p-4 w-full">
        <Outlet /> {/* Page content goes here */}
      </main>
    </div>
  );
}
