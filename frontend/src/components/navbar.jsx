import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { ButtonGroup } from "@/components/ui/button-group";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
    Alert,
    AlertAction,
    AlertDescription,
    AlertTitle,
} from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import Icons from "@/components/icons";
import { useAuth } from "@/contexts/auth";
import { Link, useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { config } from "@/config";

const PLAYLISTS_CHANGED_EVENT = "playlists:changed";

function getPlaylistNotificationMeta(notification) {
    if (notification.action === "created") {
        return {
            title: "Playlist public mới",
            description: "Playlist vừa được tạo ở chế độ public.",
            canView: true,
            variant: "default",
        };
    }
    if (notification.action === "made_public") {
        return {
            title: "Playlist đã public",
            description: "Playlist vừa được chuyển sang public.",
            canView: true,
            variant: "default",
        };
    }
    if (notification.action === "deleted") {
        return {
            title: "Playlist đã bị xóa",
            description: "Playlist public này vừa bị xóa.",
            canView: false,
            variant: "destructive",
        };
    }
    if (notification.action === "made_private") {
        return {
            title: "Playlist đã chuyển riêng tư",
            description: "Playlist này không còn public.",
            canView: false,
            variant: "destructive",
        };
    }
    return {
        title: "Playlist đã thay đổi",
        description: "Trạng thái playlist public vừa được cập nhật.",
        canView: false,
        variant: "default",
    };
}

function NavbarLink({ to, label, children }) {
    return (
        <Tooltip>
            <TooltipTrigger asChild>
                <Button
                    asChild
                    variant="ghost"
                    size="icon-lg"
                    className="group text-chart-2 hover:text-chart-3 focus-visible:ring-chart-1/30 focus-visible:ring-2"
                >
                    <Link to={to} aria-label={label}>
                        {children}
                    </Link>
                </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom" sideOffset={6}>
                {label}
            </TooltipContent>
        </Tooltip>
    );
}

function AccountDropdown({ user, onLogout }) {
    const navigate = useNavigate();
    const [notifications, setNotifications] = useState([]);
    const [showNotifications, setShowNotifications] = useState(false);

    const unreadCount = useMemo(
        () => notifications.filter((notification) => notification.isUnread).length,
        [notifications]
    );

    const visibleUnreadCount = useMemo(
        () => (unreadCount > 99 ? "99+" : String(unreadCount)),
        [unreadCount]
    );

    useEffect(() => {
        if (!config.apiUrl) {
            return;
        }

        const source = new EventSource(`${config.apiUrl}/playlists/public/new`);

        source.onmessage = (event) => {
            try {
                const payload = JSON.parse(event.data);

                if (payload.type !== "public_playlist_new" || !payload.playlist) {
                    return;
                }

                const notification = {
                    id: `${payload.action}-${payload.playlist.id}-${Date.now()}`,
                    action: payload.action,
                    playlist: payload.playlist,
                    createdAt: new Date().toISOString(),
                    isUnread: true,
                };

                window.dispatchEvent(new Event(PLAYLISTS_CHANGED_EVENT));
                setNotifications((currentNotifications) => [
                    notification,
                    ...currentNotifications,
                ]);
            } catch {
                // Ignore malformed SSE payloads
            }
        };

        return () => {
            source.close();
        };
    }, []);

    const handleLogout = async () => {
        await onLogout();
        navigate("/");
    };

    function handleShowNotifications(event) {
        event.preventDefault();
        setShowNotifications((currentValue) => !currentValue);
        setNotifications((currentNotifications) =>
            currentNotifications.map((notification) => ({
                ...notification,
                isUnread: false,
            }))
        );
    }

    function handleViewPlaylist(playlistId) {
        window.dispatchEvent(new Event(PLAYLISTS_CHANGED_EVENT));
        navigate(`/songs?playlist=${playlistId}`);
    }

    function handleClearNotifications() {
        setNotifications([]);
    }

    function handleDeleteNotification(notificationId) {
        setNotifications((currentNotifications) =>
            currentNotifications.filter(
                (notification) => notification.id !== notificationId
            )
        );
    }

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="outline" className="relative rounded-full p-2">
                    <Avatar className="size-8">
                        <AvatarImage src={user.avatarUrl} alt={user.full_name} />
                        <AvatarFallback>
                            {user.full_name
                                .split(" ")
                                .map((p) => p[0])
                                .join("")
                                .slice(0, 5)}
                        </AvatarFallback>
                    </Avatar>
                    <span className="hidden text-sm font-medium sm:inline">
                        {user.full_name}
                    </span>
                    {unreadCount > 0 ? (
                        <Badge className="absolute -top-1 -right-1 h-5 min-w-5 px-1">
                            {visibleUnreadCount}
                        </Badge>
                    ) : null}
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80 [&_*[data-radix-collection-item]]:cursor-pointer">
                <DropdownMenuLabel>
                    <div className="flex flex-col gap-0.5">
                        <span className="text-sm font-medium">{user.full_name}</span>
                        <span className="text-xs text-muted-foreground">{user.email}</span>
                    </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => navigate("/profile")}>
                    Profile
                </DropdownMenuItem>
                <DropdownMenuItem onSelect={handleShowNotifications}>
                    <span className="flex-1">Xem thông báo</span>
                    {unreadCount > 0 ? (
                        <Badge variant="secondary">{visibleUnreadCount}</Badge>
                    ) : null}
                </DropdownMenuItem>

                {showNotifications ? (
                    <>
                        <DropdownMenuSeparator />
                        <div className="max-h-80 space-y-2 overflow-y-auto p-1">
                            <div className="flex items-center justify-between gap-2 px-1">
                                <span className="text-xs font-medium text-muted-foreground">
                                    Thông báo
                                </span>
                                <Button
                                    type="button"
                                    size="xs"
                                    variant="ghost"
                                    disabled={notifications.length === 0}
                                    onClick={handleClearNotifications}
                                >
                                    <Icons.clear />
                                    Clear
                                </Button>
                            </div>
                            {notifications.length === 0 ? (
                                <Alert>
                                    <AlertTitle>Chưa có thông báo</AlertTitle>
                                    <AlertDescription>
                                        Các thay đổi playlist public sẽ xuất hiện ở đây.
                                    </AlertDescription>
                                </Alert>
                            ) : (
                                notifications.map((notification) => {
                                    const notificationMeta = getPlaylistNotificationMeta(notification);
                                    return (
                                        <Alert
                                            key={notification.id}
                                            variant={notificationMeta.variant}
                                            className="pr-24"
                                        >
                                            <AlertTitle>
                                                {notificationMeta.title}: {notification.playlist.name}
                                            </AlertTitle>
                                            <AlertDescription>
                                                {notificationMeta.description}
                                            </AlertDescription>
                                            <AlertAction className="flex gap-1">
                                                {notificationMeta.canView ? (
                                                    <Button
                                                        type="button"
                                                        size="icon-xs"
                                                        variant="outline"
                                                        aria-label="Xem mục tiêu"
                                                        onClick={() => handleViewPlaylist(notification.playlist.id)}
                                                    >
                                                        <Icons.view />
                                                        <span className="sr-only">Xem mục tiêu</span>
                                                    </Button>
                                                ) : null}
                                                <Button
                                                    type="button"
                                                    size="icon-xs"
                                                    variant="destructive"
                                                    aria-label="Xóa thông báo"
                                                    onClick={() => handleDeleteNotification(notification.id)}
                                                >
                                                    <Icons.trash />
                                                    <span className="sr-only">Xóa thông báo</span>
                                                </Button>
                                            </AlertAction>
                                        </Alert>
                                    );
                                })
                            )}
                        </div>
                    </>
                ) : null}
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="text-destructive">
                    Log out
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}

export default function Navbar() {
    const [searchParams, setSearchParams] = useSearchParams();
    const [searchTerm, setSearchTerm] = useState("");
    const location = useLocation();
    const { user, isAuthenticated, logout } = useAuth();
    const navigate = useNavigate();
    function handleSearchBlur(e) {
        const query = e.target.value; 
        setSearchTerm(query);
        if (location.pathname === "/songs") {

            const nextParams = new URLSearchParams(searchParams);
            nextParams.set("q", query);
            setSearchParams(nextParams);
        }
    }
    function handleSearch(event) {
        event.preventDefault();
        const formData = new FormData(event.currentTarget);
        const query = formData.get("search");

        setSearchTerm(query);
        if (location.pathname === "/songs") {
            const nextParams = new URLSearchParams(searchParams);
            nextParams.set("q", query);
            setSearchParams(nextParams);
        }
    }

    return (
        <div className="mt-3">
            <nav className="rounded-xl border border-slate-200 bg-slate-100 shadow-sm">
                <div className="flex flex-col gap-3 p-4 md:flex-row md:items-center md:justify-between">
                    <TooltipProvider>
                        <div className="flex items-center gap-2">
                            <NavbarLink to="/" label="Home">
                                <Icons.home className="size-10 rounded p-1 transition group-hover:ring-2 group-hover:ring-chart-1/30" />
                            </NavbarLink>
                            <NavbarLink to="/songs" label="Songs">
                                <Icons.songs className="size-10 rounded p-1 transition group-hover:ring-2 group-hover:ring-chart-1/30" />
                            </NavbarLink>
                        </div>
                    </TooltipProvider>

                    <form onSubmit={handleSearch}>
                    <Field orientation="horizontal" className="w-auto">
                        <ButtonGroup>
                            <Input
                                type="search"
                                placeholder="Search..."
                                name="search"
                                value={searchTerm}
                                onChange={(event) => setSearchTerm(event.target.value)}
                                onBlur={(e) => handleSearchBlur(e)}
                                className="w-100 bg-white border-green-600 focus-visible:ring-2 focus-visible:ring-green-200 focus-visible:shadow-sm"
                            />
                            <Button
                                variant="outline"
                                size="icon"
                                className="text-green-600 border-green-600 hover:bg-green-600/10 focus-visible:ring-green-200 focus-visible:shadow-sm"
                            >
                                <Icons.search className="size-5" />
                            </Button>
                        </ButtonGroup>
                    </Field>
                    </form>

                    <div className="flex items-center gap-2">
                        {!isAuthenticated ? (
                            <Button
                                variant="outline"
                                className="rounded-full p-2"
                                onClick={() => navigate("/login")}
                            >
                                Login
                            </Button>
                        ) : (
                            <AccountDropdown user={user} onLogout={logout} />
                        )}
                    </div>
                </div>
            </nav>
        </div>
    );
}