import path from 'path';
import crypto from 'crypto';
import { fileURLToPath } from 'url';

export const dirname = url => fileURLToPath(path.dirname(url));

export const generateScopedName = (localName, resourcePath) => {
  const getHash = value => crypto.createHash('sha256').update(value).digest('hex');
  const hash = getHash(`${resourcePath}${localName}`).slice(0, 4);
  return `${localName}--${hash}`;
};
