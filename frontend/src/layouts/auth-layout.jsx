import Footer from "@/components/footer.jsx";
import Navbar from "@/components/navbar.jsx";
import { Outlet } from "react-router-dom";


function AuthLayout() {
    return (
        <>
            <Navbar />
            <main className="flex w-full flex-1 items-start justify-center py-5">
                <Outlet />
            </main>

            <Footer companyName="Your Company" year={new Date().getFullYear()} />
        </>
    );
}

export default AuthLayout;
