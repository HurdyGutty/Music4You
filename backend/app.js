import express from 'express';
import cors from 'cors';
import errorMW from './middlewares/error-mw.js';
import responseMW from './middlewares/response-mw.js';
import path from 'path';
import { fileURLToPath } from 'url';
import { engine } from 'express-handlebars';
import authRouter from './routers/auth-r.js';
import userRouter from './routers/user-r.js';
import songRouter from './routers/song-r.js';
import playlistRouter from './routers/playlist-r.js';

const app = express();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.engine('hbs', engine({
    extname: '.hbs',
    defaultLayout: 'main',
    layoutsDirs: path.join(__dirname, "views", 'layouts'),
    partialsDirs: path.join(__dirname, "views", 'partials'),
}))
app.set('view engine', 'hbs');
app.set('views', path.join(__dirname, 'views'));

app.set('trust proxy', true);
app.use(cors());
app.use(express.json());
app.use(responseMW());

app.get('/favicon.ico', (req, res) => {
    return res.status(204).end();
});

app.use('/api/v1/auth', authRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/songs', songRouter);
app.use('/api/v1/playlists', playlistRouter);



app.get('/', (req, res) => {
    return res.redirect('/api-docs');
})


app.get('/api-docs', (req, res) => {
    return res.render('api-docs', {
        title: 'Media4Y API Docs',
        baseUrl: (process.env.BASE_URL || "https://localhost:3443") + '/api/v1',
    });
})

app.use((req, res, next) => {
    return res.error({ message: `Can't find ${req.originalUrl} on this server!`}, 404);
})

app.use(errorMW);
export default app;