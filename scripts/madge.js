import fs from 'fs';
import madge from 'madge';

const makeProjectStructure = async () => {
  const result = await madge(['client/main/entry-client.tsx', 'server/main/index.ts'], {
    dependencyFilter: importedDependency => {
      const isTypeImport = importedDependency.match(/types\.ts$/);
      return !isTypeImport;
    },
  });
  const svg = await result.svg();
  fs.writeFileSync('server/public/img/project-structure.svg', svg);
};

makeProjectStructure();
