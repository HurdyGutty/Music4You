import { useState } from "react";
import Icons from "@/components/icons";
import { createPlaylist } from "@/services/music";
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
import { SidebarMenuButton } from "@/components/ui/sidebar";

const PLAYLISTS_CHANGED_EVENT = "playlists:changed";

export default function PlaylistCreateDialog({ onCreated }) {
    const [isOpen, setIsOpen] = useState(false);
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [isPublic, setIsPublic] = useState(false);
    const [isCreating, setIsCreating] = useState(false);
    const [error, setError] = useState("");

    function resetForm() {
        setName("");
        setDescription("");
        setIsPublic(false);
        setError("");
    }

    function handleOpenChange(nextOpen) {
        if (nextOpen) {
            resetForm();
        }

        setIsOpen(nextOpen);
    }

    async function handleSubmit(event) {
        event.preventDefault();

        const nextName = name.trim();

        if (nextName.length < 2) {
            setError("Tên playlist cần có ít nhất 2 ký tự.");
            return;
        }

        try {
            setIsCreating(true);
            setError("");

            const playlist = await createPlaylist({
                name: nextName,
                description: description.trim(),
                is_public: isPublic,
            });

            if (!playlist) {
                throw new Error("Không thể tạo playlist.");
            }

            onCreated?.(playlist);
            window.dispatchEvent(new Event(PLAYLISTS_CHANGED_EVENT));
            setIsOpen(false);
        } catch (error) {
            setError(error.message);
        } finally {
            setIsCreating(false);
        }
    }

    return (
        <Dialog open={isOpen} onOpenChange={handleOpenChange}>
            <DialogTrigger asChild>
                <SidebarMenuButton type="button">
                    <Icons.heartPlus />
                    <span>Tạo mới Playlist</span>
                </SidebarMenuButton>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Tạo playlist</DialogTitle>
                    <DialogDescription>
                        Thêm playlist mới vào thư viện của bạn.
                    </DialogDescription>
                </DialogHeader>

                <form className="space-y-4" onSubmit={handleSubmit}>
                    <div className="space-y-2">
                        <Label htmlFor="create-playlist-name">Tên playlist</Label>
                        <Input
                            id="create-playlist-name"
                            value={name}
                            onChange={(event) => setName(event.target.value)}
                            placeholder="Playlist mới"
                            disabled={isCreating}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="create-playlist-description">Mô tả</Label>
                        <Input
                            id="create-playlist-description"
                            value={description}
                            onChange={(event) => setDescription(event.target.value)}
                            placeholder="Mô tả ngắn"
                            disabled={isCreating}
                        />
                    </div>
                    <label className="flex cursor-pointer items-center gap-2 text-sm">
                        <Checkbox
                            checked={isPublic}
                            onCheckedChange={(checked) => setIsPublic(checked === true)}
                            disabled={isCreating}
                        />
                        Public
                    </label>
                    {error ? <p className="text-sm text-destructive">{error}</p> : null}

                    <DialogFooter>
                        <Button
                            type="button"
                            variant="ghost"
                            disabled={isCreating}
                            onClick={() => setIsOpen(false)}
                        >
                            Hủy
                        </Button>
                        <Button type="submit" disabled={isCreating}>
                            {isCreating ? "Đang tạo..." : "Tạo"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}