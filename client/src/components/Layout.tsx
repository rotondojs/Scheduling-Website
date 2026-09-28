import { Outlet } from "react-router-dom";
import Header from "./Header.tsx";
import SideBarNav from "./SideBarNav.tsx";

export default function Layout() {
  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      <Header />
      <div style={{ display: "flex", flex: 1 }}>
        <SideBarNav />
        <main style={{ flex: 1, padding: "1.5rem", overflowY: "auto" }}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}
