import crypto from 'crypto';
import * as dotenv from 'dotenv';
import { existsSync } from 'node:fs';
import path from 'path';
import { fileURLToPath } from 'url';

export const dirname = url => fileURLToPath(path.dirname(url));

export const generateScopedName = (localName, resourcePath) => {
  const getHash = value => crypto.createHash('sha256').update(value).digest('hex');
  const hash = getHash(`${resourcePath}${localName}`).slice(0, 4);
  return `${localName}--${hash}`;
};

export const loadEnv = (opts = {}) => {
  const { useEnvConfig = null, isSilent = false } = opts;
  const mode = process.env.NODE_ENV || 'development';
  const __dirname = fileURLToPath(path.dirname(import.meta.url));

  const envLocalFilePath = path.resolve(__dirname, `./.env.local`);
  const envModeFilePath = path.resolve(__dirname, `./.env.${useEnvConfig || mode}`);
  const isEnvLocalFileExists = existsSync(envLocalFilePath);
  const isEnvModeFileExists = existsSync(envModeFilePath);

  if (isEnvLocalFileExists) {
    if (!isSilent) console.log(`Loaded env from ${envLocalFilePath}`);
    dotenv.config({ path: envLocalFilePath });
  }

  if (isEnvModeFileExists) {
    if (!isSilent) console.log(`Loaded env from ${envModeFilePath}`);
    dotenv.config({ path: envModeFilePath });
  }

  if (!isEnvLocalFileExists && !isEnvModeFileExists) {
    if (!isSilent) console.log(`No env files found :(`);
  }
};
