import crypto from 'crypto';
import path from 'path';
import { fileURLToPath } from 'url';
import * as dotenv from 'dotenv';
import { existsSync } from 'node:fs';

export const dirname = url => fileURLToPath(path.dirname(url));

export const generateScopedName = (localName, resourcePath) => {
  const getHash = value => crypto.createHash('sha256').update(value).digest('hex');
  const hash = getHash(`${resourcePath}${localName}`).slice(0, 4);
  return `${localName}--${hash}`;
};

export const loadEnv = () => {
  const mode = process.env.NODE_ENV || 'development';
  const __dirname = fileURLToPath(path.dirname(import.meta.url));
  const envLocalFilePath = path.resolve(__dirname, `../.env.local`);
  const envModeFilePath = path.resolve(__dirname, `../.env.${mode}`);
  const isEnvLocalFileExists = existsSync(envLocalFilePath);
  const isEnvModeFileExists = existsSync(envModeFilePath);

  if (isEnvLocalFileExists) {
    console.log(`Loaded env from ${envLocalFilePath}`);
    dotenv.config({ path: envLocalFilePath });
  }

  if (isEnvModeFileExists) {
    console.log(`Loaded env from ${envModeFilePath}`);
    dotenv.config({ path: envModeFilePath });
  }

  if (!isEnvLocalFileExists && !isEnvModeFileExists) {
    console.log(`No env files found :(`);
  }
};
