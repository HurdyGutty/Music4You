import { useMemo, useState } from "react";
import Icons from "@/components/icons";
import { deletePlaylist, updatePlaylist } from "@/services/music";
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
import { SidebarMenuAction } from "@/components/ui/sidebar";

const PLAYLISTS_CHANGED_EVENT = "playlists:changed";

export default function PlaylistEditDialog({ playlist, onDeleted, onUpdated }) {
    const [isOpen, setIsOpen] = useState(false);
    const [name, setName] = useState(playlist.name || "");
    const [description, setDescription] = useState(playlist.description || "");
    const [isPublic, setIsPublic] = useState(Boolean(playlist.is_public));
    const [isSaving, setIsSaving] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [isDeleteConfirming, setIsDeleteConfirming] = useState(false);
    const [error, setError] = useState("");
    const isMutating = isSaving || isDeleting;

    const hasChanges = useMemo(
        () =>
            name.trim() !== (playlist.name || "").trim() ||
            description.trim() !== (playlist.description || "").trim() ||
            isPublic !== Boolean(playlist.is_public),
        [description, isPublic, name, playlist]
    );

    function resetForm() {
        setName(playlist.name || "");
        setDescription(playlist.description || "");
        setIsPublic(Boolean(playlist.is_public));
        setIsDeleteConfirming(false);
        setError("");
    }

    function handleOpenChange(nextOpen) {
        if (nextOpen) {
            resetForm();
        }

        setIsOpen(nextOpen);
    }

    async function handleDelete() {
        if (!isDeleteConfirming) {
            setError("");
            setIsDeleteConfirming(true);
            return;
        }

        try {
            setIsDeleting(true);
            setError("");

            await deletePlaylist(playlist.id);
            onDeleted?.(playlist.id);
            window.dispatchEvent(new Event(PLAYLISTS_CHANGED_EVENT));
            setIsOpen(false);
        } catch (error) {
            setError(error.message);
        } finally {
            setIsDeleting(false);
        }
    }

    async function handleSubmit(event) {
        event.preventDefault();

        const nextName = name.trim();

        if (nextName.length < 2) {
            setError("Tên playlist cần có ít nhất 2 ký tự.");
            return;
        }

        try {
            setIsSaving(true);
            setError("");

            const updatedPlaylist = await updatePlaylist(playlist.id, {
                name: nextName,
                description: description.trim(),
                is_public: isPublic,
            });

            if (!updatedPlaylist) {
                throw new Error("Không thể cập nhật playlist.");
            }

            onUpdated?.(updatedPlaylist);
            window.dispatchEvent(new Event(PLAYLISTS_CHANGED_EVENT));
            setIsOpen(false);
        } catch (error) {
            setError(error.message);
        } finally {
            setIsSaving(false);
        }
    }

    return (
        <Dialog open={isOpen} onOpenChange={handleOpenChange}>
            <DialogTrigger asChild>
                <SidebarMenuAction
                    type="button"
                    title="Sửa playlist"
                    aria-label={`Sửa playlist ${playlist.name}`}
                >
                    <Icons.edit />
                    <span className="sr-only">Sửa playlist</span>
                </SidebarMenuAction>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Sửa playlist</DialogTitle>
                    <DialogDescription>{playlist.name}</DialogDescription>
                </DialogHeader>

                <form className="space-y-4" onSubmit={handleSubmit}>
                    <div className="space-y-2">
                        <Label htmlFor={`edit-playlist-name-${playlist.id}`}>
                            Tên playlist
                        </Label>
                        <Input
                            id={`edit-playlist-name-${playlist.id}`}
                            value={name}
                            onChange={(event) => setName(event.target.value)}
                            disabled={isMutating}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor={`edit-playlist-description-${playlist.id}`}>
                            Mô tả
                        </Label>
                        <Input
                            id={`edit-playlist-description-${playlist.id}`}
                            value={description}
                            onChange={(event) => setDescription(event.target.value)}
                            disabled={isMutating}
                        />
                    </div>
                    <label className="flex cursor-pointer items-center gap-2 text-sm">
                        <Checkbox
                            checked={isPublic}
                            onCheckedChange={(checked) => setIsPublic(checked === true)}
                            disabled={isMutating}
                        />
                        Public
                    </label>
                    {error ? <p className="text-sm text-destructive">{error}</p> : null}

                    <div className="flex flex-col gap-3 border-t pt-4 sm:flex-row sm:items-center sm:justify-between">
                        <p className="text-sm text-muted-foreground">
                            {isDeleteConfirming
                                ? "Xác nhận xóa playlist này."
                                : "Xóa playlist"}
                        </p>
                        <div className="flex justify-end gap-2">
                            {isDeleteConfirming ? (
                                <Button
                                    type="button"
                                    variant="ghost"
                                    disabled={isMutating}
                                    onClick={() => setIsDeleteConfirming(false)}
                                >
                                    Hủy xóa
                                </Button>
                            ) : null}
                            <Button
                                type="button"
                                variant="destructive"
                                disabled={isMutating}
                                onClick={handleDelete}
                            >
                                {isDeleting
                                    ? "Đang xóa..."
                                    : isDeleteConfirming
                                    ? "Xác nhận xóa"
                                    : "Xóa"}
                            </Button>
                        </div>
                    </div>

                    <DialogFooter>
                        <Button
                            type="button"
                            variant="ghost"
                            disabled={isMutating}
                            onClick={() => setIsOpen(false)}
                        >
                            Hủy
                        </Button>
                        <Button type="submit" disabled={isMutating || !hasChanges}>
                            {isSaving ? "Đang lưu..." : "Lưu"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}