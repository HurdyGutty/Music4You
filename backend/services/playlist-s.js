import { sendEventToAllClients } from "./sse-s.js";
import AppError from '../utils/app-error.js';
import Playlist from '../models/playlist.js';

function notifyNewPublicPlaylist(playlist, action) {
    sendEventToAllClients({
        type: "public_playlist_new",
        action,
        playlist,
    });
}
export async function getPlaylistById(playlistId) {
    const playlist = await Playlist.findById(playlistId);
    if (!playlist) throw AppError.notFound('PLAYLIST_NOT_FOUND', 'Playlist not found');
    return playlist;
}

export const getPlaylistsByUserId = async (userId) => Playlist.findByUserId(userId);
export const getSongsInPlaylist = async (playlistId) => Playlist.getSongsInPlaylist(playlistId);
export const addSongToPlaylist = Playlist.addSongToPlaylist;
export const removeSongFromPlaylist = Playlist.removeSongFromPlaylist;

export async function createPlaylist(userId, playlistData) {
    const newPlaylist = await Playlist.create({...playlistData, user_id: userId});
    if (newPlaylist.is_public) {
        notifyNewPublicPlaylist(newPlaylist, 'created');
    }
    return newPlaylist;
}


export const getPublicPlaylists = async () => Playlist.findPublic();
export async function deletePlaylist(playlistId) {
    const currentPlaylist = getPlaylistById(playlistId);
    await Playlist.delete(playlistId);
    if (currentPlaylist.is_public) {
        notifyNewPublicPlaylist(currentPlaylist, 'deleted');
    }
} 
export async function updatePlaylist(playlistId, playlistData) {
    const currentPlaylist = await getPlaylistById(playlistId);
    const updatedPlaylist = await Playlist.update(playlistId, playlistData);
    if (updatedPlaylist.is_public && !currentPlaylist.is_public) {
        notifyNewPublicPlaylist(updatedPlaylist, 'made_public');
    }
    if (!updatedPlaylist.is_public && currentPlaylist.is_public) {
        notifyNewPublicPlaylist(updatedPlaylist, 'made_private');
    }
    return updatedPlaylist;
} 
