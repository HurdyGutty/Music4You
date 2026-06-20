import * as songService from '../services/song-s.js';

export async function getSongById(req, res) {
    try {
        const songId = req.params.id;
        const song = await songService.getSongById(songId);
        return res.ok({ song }); 
    } catch (error) {
        return res.error(error);
    }
}


export async function getSongs(req, res) {
    try {
        const result = await songService.listSongs({ query: req.validated.query });
        return res.list(result.items, result.meta); 
    } catch (error) {
        return res.error(error);
    }
}