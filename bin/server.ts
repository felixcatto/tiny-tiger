import getApp from '../main/index.js';
import * as dotenv from 'dotenv';

dotenv.config({ path: `.env.development` });

const app = getApp();
app.listen({ port: 3000, host: 'localhost' }, (err, address) => {
  if (err) {
    console.log(err);
  } else {
    console.log(`server listening on ${address}`);
  }
});
