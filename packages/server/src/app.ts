import express, { type Request, type Response } from 'express';

const app = express();

app.get('/', (_req: Request, res: Response) => {
  res.send('Welcome to express');
});

export default app;
