import { Outlet } from "react-router-dom";
import Sidebar from "../components/Sidebar";

const DashboardLayout = () => {
    return (
        <main className="dashboardMain">
            <Sidebar/>
            <Outlet/>
        </main>
    )
}

export default DashboardLayout;