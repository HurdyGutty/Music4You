import { useEffect, useMemo, useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import {
    addSongToPlaylist,
    createPlaylist,
    getPlaylistSongs,
    getUserPlaylists,
    removeSongFromPlaylist,
} from "@/services/music";
import { useAuth } from "@/contexts/auth.jsx";

const PLAYLISTS_CHANGED_EVENT = "playlists:changed";

function hasSong(playlistSongs, targetSongId) {
    if (!targetSongId) return false;
    
    return playlistSongs.some(
        (playlistSong) => String(playlistSong.id) === String(targetSongId)
    );
}

function areSetsEqual(left, right) {
    if (left.size !== right.size) {
        return false;
    }

    for (const item of left) {
        if (!right.has(item)) {
            return false;
        }
    }

    return true;
}

export default function SongPlaylistDialog({ song, onSaved }) {
    const { isAuthenticated, isLoading: isAuthLoading } = useAuth();
    const [isOpen, setIsOpen] = useState(false);
    const [playlists, setPlaylists] = useState([]);
    const [selectedPlaylistIds, setSelectedPlaylistIds] = useState(new Set());
    const [initialPlaylistIds, setInitialPlaylistIds] = useState(new Set());
    const [songCounts, setSongCounts] = useState({});
    const [isLoading, setIsLoading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [isCreating, setIsCreating] = useState(false);
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [newPlaylistName, setNewPlaylistName] = useState("");
    const [newPlaylistDescription, setNewPlaylistDescription] = useState("");
    const [newPlaylistPublic, setNewPlaylistPublic] = useState(false);
    const [error, setError] = useState("");
    const [message, setMessage] = useState("");

    const hasChanges = useMemo(
        () => !areSetsEqual(selectedPlaylistIds, initialPlaylistIds),
        [selectedPlaylistIds, initialPlaylistIds]
    );

    useEffect(() => {
        if (!isOpen || !song || !song.id) {
            return;
        }

        let isMounted = true;

        async function loadPlaylists() {
            try {
                setIsLoading(true);
                setError("");
                setMessage("");

                const userPlaylists = await getUserPlaylists();
                const songsByPlaylist = await Promise.all(
                    userPlaylists.map(async (playlist) => {
                        try {
                            const playlistSongs = await getPlaylistSongs(playlist.id);
                            return [playlist.id, playlistSongs];
                        } catch {
                            return [playlist.id, []];
                        }
                    })
                );

                const nextSelectedIds = new Set();
                const nextSongCounts = {};

                songsByPlaylist.forEach(([playlistId, playlistSongs]) => {
                    nextSongCounts[playlistId] = playlistSongs.length;

                    if (song?.id && hasSong(playlistSongs, song.id)) {
                        nextSelectedIds.add(playlistId);
                    }
                });

                if (isMounted) {
                    setPlaylists(userPlaylists);
                    setSelectedPlaylistIds(nextSelectedIds);
                    setInitialPlaylistIds(new Set(nextSelectedIds));
                    setSongCounts(nextSongCounts);
                }
            } catch (error) {
                if (isMounted) {
                    setError(error.message);
                    setPlaylists([]);
                    setSelectedPlaylistIds(new Set());
                    setInitialPlaylistIds(new Set());
                    setSongCounts({});
                }
            } finally {
                if (isMounted) {
                    setIsLoading(false);
                }
            }
        }

        loadPlaylists();

        return () => {
            isMounted = false;
        };
    }, [isOpen, song]);

    function togglePlaylist(playlistId) {
        setMessage("");
        setSelectedPlaylistIds((currentIds) => {
            const nextIds = new Set(currentIds);

            if (nextIds.has(playlistId)) {
                nextIds.delete(playlistId);
            } else {
                nextIds.add(playlistId);
            }

            return nextIds;
        });
    }

    async function handleCreatePlaylist(event) {
        event.preventDefault();

        const name = newPlaylistName.trim();

        if (name.length < 2) {
            setError("Tên playlist cần có ít nhất 2 ký tự.");
            return;
        }

        try {
            setIsCreating(true);
            setError("");
            setMessage("");

            const playlist = await createPlaylist({
                name,
                description: newPlaylistDescription.trim(),
                is_public: newPlaylistPublic,
            });

            if (!playlist) {
                throw new Error("Không thể tạo playlist.");
            }

            setPlaylists((currentPlaylists) => [...currentPlaylists, playlist]);
            setSelectedPlaylistIds((currentIds) => new Set(currentIds).add(playlist.id));
            setSongCounts((currentCounts) => ({
                ...currentCounts,
                [playlist.id]: 0,
            }));
            setNewPlaylistName("");
            setNewPlaylistDescription("");
            setNewPlaylistPublic(false);
            setShowCreateForm(false);
            setMessage(`Đã tạo playlist "${playlist.name}".`);
            window.dispatchEvent(new Event(PLAYLISTS_CHANGED_EVENT));
        } catch (error) {
            setError(error.message);
        } finally {
            setIsCreating(false);
        }
    }

    async function handleSave() {
        const playlistIdsToAdd = playlists
            .filter(
                (playlist) =>
                    selectedPlaylistIds.has(playlist.id) &&
                    !initialPlaylistIds.has(playlist.id)
            )
            .map((playlist) => playlist.id);

        const playlistIdsToRemove = playlists
            .filter(
                (playlist) =>
                    initialPlaylistIds.has(playlist.id) &&
                    !selectedPlaylistIds.has(playlist.id)
            )
            .map((playlist) => playlist.id);

        if (!hasChanges) {
            setMessage("Không có thay đổi mới.");
            return;
        }

        try {
            setIsSaving(true);
            setError("");
            setMessage("");

            await Promise.all([
                ...playlistIdsToAdd.map((playlistId) =>
                    addSongToPlaylist(playlistId, song.id, (songCounts[playlistId] || 0) + 1)
                ),
                ...playlistIdsToRemove.map((playlistId) =>
                    removeSongFromPlaylist(playlistId, song.id)
                ),
            ]);

            setInitialPlaylistIds(new Set(selectedPlaylistIds));
            setMessage("Đã cập nhật playlist.");
            window.dispatchEvent(new Event(PLAYLISTS_CHANGED_EVENT));
            onSaved?.();
        } catch (error) {
            setError(error.message);
        } finally {
            setIsSaving(false);
        }
    }

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            {
                isAuthLoading || !isAuthenticated
                ? 
                    <DialogTrigger asChild disabled>
                        <Button size="sm" variant="outline" disabled>
                            Đăng nhập để thêm
                        </Button>
                    </DialogTrigger>
                :
                    <DialogTrigger asChild>
                        <Button size="sm" variant="outline">
                            Thêm vào Playlist
                        </Button>
                    </DialogTrigger>
            }
            <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                    <DialogTitle>Lưu vào playlist</DialogTitle>
                    <DialogDescription>
                        {song?.title} - {song?.artist}
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4">
                    <div className="max-h-64 space-y-2 overflow-y-auto rounded-lg border p-2">
                        {isLoading ? (
                            <>
                                <Skeleton className="h-10 w-full" />
                                <Skeleton className="h-10 w-full" />
                                <Skeleton className="h-10 w-full" />
                            </>
                        ) : null}
                        {!isLoading && playlists.length === 0 ? (
                            <p className="px-2 py-3 text-sm text-muted-foreground">
                                Bạn chưa có playlist nào.
                            </p>
                        ) : null}
                        {!isLoading ? (
                            playlists.map((playlist) => {
                                const inputId = `song-${song.id}-playlist-${playlist.id}`;
                                const isChecked = selectedPlaylistIds.has(playlist.id);
                                const alreadySaved = initialPlaylistIds.has(playlist.id);

                                return (
                                    <label
                                        key={playlist.id}
                                        htmlFor={inputId}
                                        className="flex cursor-pointer items-start gap-3 rounded-md px-2 py-2 hover:bg-muted"
                                    >
                                        <Checkbox
                                            id={inputId}
                                            checked={isChecked}
                                            onCheckedChange={() => togglePlaylist(playlist.id)}
                                            className="mt-1"
                                        />
                                        <span className="min-w-0 flex-1">
                                            <span className="block truncate text-sm font-medium">
                                                {playlist.name}
                                            </span>
                                            <span className="block truncate text-xs text-muted-foreground">
                                                {playlist.description ||
                                                    (playlist.is_public ? "Public" : "Only you")}
                                            </span>
                                        </span>
                                        {alreadySaved ? (
                                            <span className="rounded-md bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                                                Đã có
                                            </span>
                                        ) : null}
                                    </label>
                                );
                            })
                        ) : null}
                    </div>

                    <div className="rounded-lg border p-3">
                        {!showCreateForm ? (
                            <Button
                                type="button"
                                variant="ghost"
                                className="w-full justify-start"
                                onClick={() => {
                                    setError("");
                                    setMessage("");
                                    setShowCreateForm(true);
                                }}
                            >
                                <Plus className="size-4" />
                                Tạo playlist mới
                            </Button>
                        ) : (
                            <form className="space-y-3" onSubmit={handleCreatePlaylist}>
                                <div className="space-y-2">
                                    <Label htmlFor="new-playlist-name">Tên playlist</Label>
                                    <Input
                                        id="new-playlist-name"
                                        value={newPlaylistName}
                                        onChange={(event) => setNewPlaylistName(event.target.value)}
                                        placeholder="Playlist mới"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="new-playlist-description">Mô tả</Label>
                                    <Input
                                        id="new-playlist-description"
                                        value={newPlaylistDescription}
                                        onChange={(event) =>
                                            setNewPlaylistDescription(event.target.value)
                                        }
                                        placeholder="Mô tả ngắn"
                                    />
                                </div>
                                <label className="flex cursor-pointer items-center gap-2 text-sm">
                                    <Checkbox
                                        id="new-playlist-public"
                                        checked={newPlaylistPublic}
                                        onCheckedChange={(checked) =>
                                            setNewPlaylistPublic(Boolean(checked))
                                        }
                                    />
                                    Public
                                </label>
                                <div className="flex justify-end gap-2">
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        onClick={() => setShowCreateForm(false)}
                                    >
                                        Hủy
                                    </Button>
                                    <Button type="submit" disabled={isCreating}>
                                        {isCreating ? "Đang tạo..." : "Tạo"}
                                    </Button>
                                </div>
                            </form>
                        )}
                    </div>

                    {error ? <p className="text-sm text-destructive">{error}</p> : null}
                    {message ? (
                        <p className="text-sm text-muted-foreground">{message}</p>
                    ) : null}
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={() => setIsOpen(false)}>
                        Xong
                    </Button>
                    <Button onClick={handleSave} disabled={isSaving || !hasChanges}>
                        {isSaving ? "Đang lưu..." : "Lưu"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}