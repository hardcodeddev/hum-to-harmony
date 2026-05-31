import express, { NextFunction, Request, Response } from 'express';
import session from 'express-session';
import path from 'path';
import authRouter from './routes/auth';
import documentsRouter from './routes/documents';
import coursesRouter from './routes/courses';
import searchRouter from './routes/search';

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use(
  session({
    secret: process.env.SESSION_SECRET || 'hum-to-harmony-dev-secret-change-in-prod',
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    },
  })
);

app.use('/api/auth', authRouter);
app.use('/api/documents', documentsRouter);
app.use('/api/courses', coursesRouter);
app.use('/api/search', searchRouter);

if (process.env.NODE_ENV === 'production') {
  const staticPath = path.join(__dirname, '../dist/client');
  app.use(express.static(staticPath));
  app.get('*', (_req, res) => {
    res.sendFile(path.join(staticPath, 'index.html'));
  });
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  const status = err.status ?? err.statusCode ?? 500;
  const message = err.message || 'Internal server error';
  res.status(status).json({ error: message });
});

export default app;
