import express from 'express';
import { validate } from '../middlewares/validate-mw.js';
import { getSongsSchema } from '../validators/song-schema.js';
import * as songController from '../controllers/song-c.js'



const router = express.Router();
router.get('/', validate(getSongsSchema, 'query'), songController.getSongs);
router.get('/:id', songController.getSongById);

export default router;