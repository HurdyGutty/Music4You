import express from 'express';
import { validate } from '../middlewares/validate-mw.js';
import * as playlistController from '../controllers/playlist-c.js'
import { checkPlaylistOwnership, checkPlaylistPublic, protect } from '../middlewares/auth-mw.js';
import { addSongToPlaylistSchema, createPlaylistSchema, removeSongFromPlaylistSchema, updatePlaylistSchema } from '../validators/playlist-schema.js';

const router = express.Router();

router.get('/public/new', playlistController.streamNewPublicPlaylists);

router.get('/public', playlistController.getPublicPlaylists);
router.get('/:id', checkPlaylistPublic, playlistController.getPlaylistById);

router.get('/:id/songs', checkPlaylistPublic, playlistController.getSongsInPlaylist);

router.use(protect);
router.get('/', playlistController.getPlaylists);
router.post('/', validate(createPlaylistSchema), playlistController.createPlaylist);

router.put('/:id', checkPlaylistOwnership, validate(updatePlaylistSchema), playlistController.updatePlaylist);
router.delete('/:id', checkPlaylistOwnership, playlistController.deletePlaylist);

router.post('/:id/songs', checkPlaylistOwnership, validate(addSongToPlaylistSchema), playlistController.addSongToPlaylist);
router.delete('/:id/songs/:songId', checkPlaylistOwnership, validate(removeSongFromPlaylistSchema, 'params'), playlistController.removeSongFromPlaylist);

export default router;