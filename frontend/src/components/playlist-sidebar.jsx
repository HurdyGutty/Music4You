import { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarMenuSkeleton } from "./ui/sidebar.jsx";
import Icons from "./icons.jsx";
import PlaylistEditDialog from "./dialogs/playlist-edit-dialog.jsx";
import { useAuth } from "@/contexts/auth.jsx";
import { getPublicPlaylists, getUserPlaylists } from "@/services/music.jsx";
import PlaylistCreateDialog from "./dialogs/playlist-create-dialog.jsx";

const PLAYLISTS_CHANGED_EVENT = "playlists:changed";

function getPlaylistPath(playlist) {
    return `/songs?playlist=${playlist.id}`;
}

function upsertPlaylist(playlists, nextPlaylist) {
    const hasPlaylist = playlists.some(
        (playlist) => String(playlist.id) === String(nextPlaylist.id)
    );

    if (!hasPlaylist) {
        return [...playlists, nextPlaylist];
    }

    return playlists.map((playlist) =>
        String(playlist.id) === String(nextPlaylist.id) ? nextPlaylist : playlist
    );
}

function PlaylistMenuItem({
    playlist,
    isActive,
    editablePlaylist,
    onDeleted,
    onUpdated,
}) {
    return (
        <SidebarMenuItem>
            <SidebarMenuButton asChild isActive={isActive}>
                <Link to={getPlaylistPath(playlist)}>
                    <Icons.listMusic />
                    <span>{playlist.name}</span>
                </Link>
            </SidebarMenuButton>
            {editablePlaylist ? (
                <PlaylistEditDialog
                    playlist={editablePlaylist}
                    onDeleted={onDeleted}
                    onUpdated={onUpdated}
                />
            ) : null}
        </SidebarMenuItem>
    );
}

function PlaylistSidebar() {
    const { isAuthenticated, isLoading: isAuthLoading } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();
    const [playlistRefreshKey, setPlaylistRefreshKey] = useState(0);
    const [publicPlaylists, setPublicPlaylists] = useState([]);
    const [userPlaylists, setUserPlaylists] = useState([]);
    const [isPublicLoading, setIsPublicLoading] = useState(true);
    const [isUserLoading, setIsUserLoading] = useState(false);
    const [publicError, setPublicError] = useState("");
    const [userError, setUserError] = useState("");

    const privatePlaylists = useMemo(
        () => userPlaylists.filter((playlist) => !playlist.is_public),
        [userPlaylists]
    );

    const userPlaylistById = useMemo(
        () => new Map(userPlaylists.map((playlist) => [String(playlist.id), playlist])),
        [userPlaylists]
    );

    const currentPlaylistId = new URLSearchParams(location.search).get("playlist");
    const isAllSongsActive = location.pathname === "/songs" && !currentPlaylistId;

    useEffect(() => {
        function handlePlaylistsChanged() {
            setPlaylistRefreshKey((currentKey) => currentKey + 1);
        }
        window.addEventListener(PLAYLISTS_CHANGED_EVENT, handlePlaylistsChanged);
        return () => {
            window.removeEventListener(PLAYLISTS_CHANGED_EVENT, handlePlaylistsChanged);
        };
    }, []);

    useEffect(() => {
        let isMounted = true;
        async function loadPublicPlaylists() {
            try {
                setIsPublicLoading(true);
                const playlists = await getPublicPlaylists();
                if (isMounted) setPublicPlaylists(playlists);
                setPublicError("");
            } catch (error) {
                if (isMounted) setPublicError(error.message);
            } finally {
                if (isMounted) setIsPublicLoading(false);
            }
        }
        loadPublicPlaylists();
        return () => { isMounted = false; };
    }, [playlistRefreshKey]);

    useEffect(() => {
        let isMounted = true;
        async function loadUserPlaylists() {
            if (isAuthLoading) return;
            if (!isAuthenticated) {
                setUserPlaylists([]);
                setUserError("");
                setIsUserLoading(false);
                return;
            }
            try {
                setIsUserLoading(true);
                const playlists = await getUserPlaylists();
                if (isMounted) setUserPlaylists(playlists);
                setUserError("");
            } catch (error) {
                if (isMounted) setUserError(error.message);
            } finally {
                if (isMounted) setIsUserLoading(false);
            }
        }
        loadUserPlaylists();
        return () => { isMounted = false; };
    }, [isAuthenticated, isAuthLoading, playlistRefreshKey]);

    function handlePlaylistCreated(createdPlaylist) {
        setUserPlaylists((currentPlaylists) => upsertPlaylist(currentPlaylists, createdPlaylist));
        if (createdPlaylist.is_public) {
            setPublicPlaylists((currentPlaylists) => upsertPlaylist(currentPlaylists, createdPlaylist));
        }
        navigate(getPlaylistPath(createdPlaylist));
    }

    function handlePlaylistUpdated(updatedPlaylist) {
        setUserPlaylists((currentPlaylists) => upsertPlaylist(currentPlaylists, updatedPlaylist));
        setPublicPlaylists((currentPlaylists) => {
            if (!updatedPlaylist.is_public) {
                return currentPlaylists.filter((p) => String(p.id) !== String(updatedPlaylist.id));
            }
            return upsertPlaylist(currentPlaylists, updatedPlaylist);
        });
    }

    function handlePlaylistDeleted(deletedPlaylistId) {
        setUserPlaylists((currentPlaylists) =>
            currentPlaylists.filter((p) => String(p.id) !== String(deletedPlaylistId))
        );
        setPublicPlaylists((currentPlaylists) =>
            currentPlaylists.filter((p) => String(p.id) !== String(deletedPlaylistId))
        );
        if (currentPlaylistId === String(deletedPlaylistId)) {
            navigate("/songs");
        }
    }

    return (
        <Sidebar collapsible="none" className="h-full w-full rounded-xl border bg-background">
            <SidebarHeader>
                <div className="px-4 py-3">
                    <h2 className="text-base font-semibold">Playlists</h2>
                </div>
            </SidebarHeader>
            <SidebarContent>
                <SidebarGroup>
                    <SidebarGroupLabel>Public</SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            <SidebarMenuItem key="all-songs">
                                <SidebarMenuButton asChild isActive={isAllSongsActive}>
                                    <Link to="/songs">
                                        <Icons.listMusic />
                                        <span>Tất cả bài hát</span>
                                    </Link>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                            {isPublicLoading ? (
                                <>
                                    <SidebarMenuSkeleton showIcon />
                                    <SidebarMenuSkeleton showIcon />
                                </>
                            ) : (
                                publicPlaylists?.map((playlist) => {
                                const editablePlaylist = userPlaylistById.get(String(playlist.id));
                                return (
                                    <PlaylistMenuItem
                                        key={playlist.id}
                                        playlist={playlist}
                                        isActive={currentPlaylistId === String(playlist.id)}
                                        editablePlaylist={editablePlaylist}
                                        onDeleted={handlePlaylistDeleted}
                                        onUpdated={handlePlaylistUpdated}
                                    />
                                );
                                })
                            )}
                            {publicError ? (
                                <SidebarMenuItem>
                                    <p className="px-2 py-1 text-xs text-destructive">{publicError}</p>
                                </SidebarMenuItem>
                            ) : null}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
                <SidebarGroup>
                    <SidebarGroupLabel>Riêng tư</SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            {isUserLoading || isAuthLoading ? (
                                <>
                                    <SidebarMenuSkeleton showIcon />
                                    <SidebarMenuSkeleton showIcon />
                                </>
                            ) : (
                                isAuthenticated && privatePlaylists.length === 0 ? (
                                        <SidebarMenuItem>
                                            <p className="px-2 py-1 text-xs text-muted-foreground">Chưa có playlist riêng tư.</p>
                                        </SidebarMenuItem>
                                ) : (
                                        privatePlaylists?.map((playlist) => (
                                            <PlaylistMenuItem
                                                key={playlist.id}
                                                playlist={playlist}
                                                isActive={currentPlaylistId === String(playlist.id)}
                                                editablePlaylist={playlist}
                                                onDeleted={handlePlaylistDeleted}
                                                onUpdated={handlePlaylistUpdated}
                                            />
                                        ))
                                    )
                                )
                            }
                            {userError ? (
                                <SidebarMenuItem>
                                    <p className="px-2 py-1 text-xs text-destructive">{userError}</p>
                                </SidebarMenuItem>
                            ) : null}
                            {!isAuthLoading 
                                ? (!isAuthenticated ? 
                                    (<SidebarMenuItem>
                                        <p className="px-2 py-1 text-xs text-muted-foreground">Đăng nhập để xem playlist của bạn.</p>
                                    </SidebarMenuItem>)
                                    :
                                    (<SidebarMenuItem>
                                        <PlaylistCreateDialog onCreated={handlePlaylistCreated} />
                                    </SidebarMenuItem>)
                                )
                                : null
                            }
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
            </SidebarContent>
        </Sidebar>
    );
}

export default PlaylistSidebar;