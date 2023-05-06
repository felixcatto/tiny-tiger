import { CodegenConfig } from '@graphql-codegen/cli';

const config: CodegenConfig = {
  schema: 'http://localhost:3000/graphql',
  ignoreNoDocuments: true,
  generates: {
    './client/gqlTypes/': {
      preset: 'client',
      presetConfig: { fragmentMasking: false },
    },
  },
};

export default config;
