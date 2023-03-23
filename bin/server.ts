import getApp from '../main/index.js';
import * as dotenv from 'dotenv';

dotenv.config({ path: `.env.development` });

const host = process.env.NODE_ENV === 'production' ? '0.0.0.0' : 'localhost';
const port = Number(process.env.PORT);

const app = getApp();
app.listen({ port, host }, err => {
  if (err) {
    console.log(err);
  }
});
