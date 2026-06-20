import Navbar from "@/components/navbar.jsx";
import PlaylistSidebar from "@/components/playlist-sidebar.jsx";
import { Outlet } from "react-router-dom";
import { SidebarProvider } from "@/components/ui/sidebar";
import Footer from "@/components/footer.jsx";

function SongsLayout() {
    return (
        <>
            <Navbar />
            <SidebarProvider className="min-h-0 flex-1" style={{"--sidebar-width": "100%"}}>
                <main className="grid flex-1 grid-cols-[minmax(240px,25%)_1fr] gap-6 bg-muted/30 p-6">
                    <aside className="min-w-0">
                        <PlaylistSidebar />
                    </aside>

                    <section className="min-w-0 rounded-xl border bg-background p-6">
                        <Outlet />
                    </section>
                </main>
            </SidebarProvider>
            <Footer companyName="Your Company" year={new Date().getFullYear()} />
        </>
    )
}
export default SongsLayout;