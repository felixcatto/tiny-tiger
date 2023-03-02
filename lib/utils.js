import path from 'path';
import { fileURLToPath } from 'url';

export const dirname = url => fileURLToPath(path.dirname(url));
