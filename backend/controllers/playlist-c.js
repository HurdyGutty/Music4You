import * as playlistService from "../services/playlist-s.js";
import { addClient, removeClient, sendInitialEvent } from "../services/sse-s.js";


export async function getPlaylistById(req, res) {
    try {
        const playlistId = req.params.id;
        const playlist = await playlistService.getPlaylistById(playlistId);
        return res.ok({playlist});
    } catch (error) {
        return res.error(error);
    }
}
export async function getPlaylists(req, res) {
    try {
        const playlists = await playlistService.getPlaylistsByUserId(req.user.id);
        return res.ok({playlists});
    } catch (error) {
        return res.error(error);
    }
}
export async function getPublicPlaylists(req, res) {
    try {
        const playlists = await playlistService.getPublicPlaylists();
        return res.ok({playlists});
    } catch (error) {
        return res.error(error);
    }
}

export function streamNewPublicPlaylists(req, res) {
    try {
        res.setHeader("Content-Type", "text/event-stream");
        res.setHeader("Cache-Control", "no-cache");
        res.setHeader("Connection", "keep-alive");
        res.flushHeaders?.();

        const client = addClient(res);
        sendInitialEvent(res, {
            type: "connected",
            message: "Connected to new public playlist events",
        })

        req.on("close", () => {
            removeClient(client.id);
        });
    } catch (error) {
        return res.error(error);
    }
}

export async function createPlaylist(req, res) {
    try {
        const playlistData = req.validated.body;
        const newPlaylist = await playlistService.createPlaylist(req.user.id, playlistData);
        return res.ok({ playlist: newPlaylist });
    } catch (error) {
        
        return res.error(error);
    }
}

export async function getSongsInPlaylist(req, res) {
    try {
        const playlistId = req.params.id;
        const songs = await playlistService.getSongsInPlaylist(playlistId);
        return res.ok({ songs });
    } catch (error) {
        return res.error(error);
    }
}

export async function addSongToPlaylist(req, res) {
    try {
        const playlistId = req.params.id;
        const { song_id, sort_order } = req.validated.body;
        await playlistService.addSongToPlaylist(playlistId, song_id, sort_order);
        const songs = await playlistService.getSongsInPlaylist(playlistId);
        return res.ok({ songs });
    } catch (error) {
        
        return res.error(error);
    }
}
export async function removeSongFromPlaylist(req, res) {
    try {
        const playlistId = req.params.id;
        const songId = req.params.songId;
        await playlistService.removeSongFromPlaylist(playlistId, songId);
        const songs = await playlistService.getSongsInPlaylist(playlistId);
        return res.ok({ songs });
    } catch (error) {
        
        return res.error(error);
    }
}

export async function updatePlaylist(req, res) {
    try {
        const playlistId = req.params.id;
        const playlistData = req.validated.body;
        const updatedPlaylist = await playlistService.updatePlaylist(playlistId, playlistData);
        return res.ok({ playlist: updatedPlaylist });
    } catch (error) {
        return res.error(error);
    }
}
export async function deletePlaylist(req, res) {
    try {
        const playlistId = req.params.id;
        await playlistService.deletePlaylist(playlistId);
        return res.ok({ message: "Playlist deleted successfully" });
    } catch (error) {
        return res.error(error);
    }
}