import { apiFetch } from "@/auth/api.js";


async function readApiResponse(response, fallbackMessage) {
    let payload;
    try {
        payload = await response.json();
    } catch {
        payload = {};
    }

    if (!response.ok)
        throw new Error(payload?.error?.message || payload?.message || fallbackMessage);

    return payload;
}

export async function getSongs({q = "", page = 1, limit = 100 } = {}) {
    const params = new URLSearchParams({
        q,
        page: String(page),
        limit: String(limit),
    });
    const response = await apiFetch(`/songs?${params.toString()}`);
    const payload = await readApiResponse(response, "Không thể tải bài hát");

    return {
        songs: Array.isArray(payload.data) ? payload.data : [],
        meta: payload.meta || {},
    };
}

export async function getPlaylist(playlistId) {
    const response = await apiFetch(`/playlists/${playlistId}`);
    const payload = await readApiResponse(response, "Không thể tải playlist");

    return payload.data?.playlist || null;
}

export async function getPlaylistSongs(playlistId) {
    const response = await apiFetch(`/playlists/${playlistId}/songs`);
    const payload = await readApiResponse(
        response,
        "Không thể tải bài hát trong playlist"
    );

    return Array.isArray(payload.data?.songs) ? payload.data.songs : [];
}

export async function getPublicPlaylists() {
    const response = await apiFetch("/playlists/public");
    const payload = await readApiResponse(
        response,
        "Không thể tải playlist public"
    );

    return Array.isArray(payload.data?.playlists) ? payload.data.playlists : [];
}

export async function getUserPlaylists() {
    const response = await apiFetch("/playlists");
    const payload = await readApiResponse(
        response,
        "Không thể tải playlist của bạn"
    );

    return Array.isArray(payload.data?.playlists) ? payload.data.playlists : [];
}

export async function createPlaylist({ name, description = "", is_public = false }) {
    const response = await apiFetch("/playlists", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ name, description, is_public }),
    });
    const payload = await readApiResponse(response, "Không thể tạo playlist");

    return payload.data?.playlist || null;
}

export async function updatePlaylist(
    playlistId,
    { name, description = "", is_public = false }
) {
    const response = await apiFetch(`/playlists/${playlistId}`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ name, description, is_public }),
    });
    const payload = await readApiResponse(response, "Không thể cập nhật playlist");

    return payload.data?.playlist || null;
}

export async function deletePlaylist(playlistId) {
    const response = await apiFetch(`/playlists/${playlistId}`, {
        method: "DELETE",
    });
    const payload = await readApiResponse(response, "Không thể xóa playlist");

    return payload.data?.message || true;
}

export async function addSongToPlaylist(playlistId, songId, sortOrder = 1) {
    const response = await apiFetch(`/playlists/${playlistId}/songs`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            song_id: Number(songId),
            sort_order: sortOrder,
        }),
    });
    const payload = await readApiResponse(
        response,
        "Không thể thêm bài hát vào playlist"
    );

    return Array.isArray(payload.data?.songs) ? payload.data.songs : [];
}

export async function removeSongFromPlaylist(playlistId, songId) {
    const response = await apiFetch(`/playlists/${playlistId}/songs/${songId}`, {
        method: "DELETE",
    });
    const payload = await readApiResponse(
        response,
        "Không thể xóa bài hát khỏi playlist"
    );

    return Array.isArray(payload.data?.songs) ? payload.data.songs : [];
}