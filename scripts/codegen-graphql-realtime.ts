import type { CodegenConfig } from '@graphql-codegen/cli';

import path from 'path';
import dotenv from 'dotenv';

dotenv.config({
  path: path.join(__dirname, '../', '.env'),
});

const config: CodegenConfig = {
  overwrite: true,
  schema: [
    {
      [`${process.env.REALTIME_API_PATH}/graphql`]: {
        headers: {
          'X-Tenant': 'randomtenant',
          'X-Username': 'randomusername',
        },
      },
    },
  ],
  documents: ['./src/infra/repositories/realtime/**/*.graphql'],
  generates: {
    'src/routes/src/types/__generated__/graphqlRealtime.types.ts': {
      plugins: ['typescript'],
    },
    './': {
      preset: 'near-operation-file',
      config: {
        namingConvention: {
          transformUnderscore: true,
        },
        exposeDocument: true,
      },
      presetConfig: {
        baseTypesPath:
          'src/routes/src/types/__generated__/graphqlRealtime.types.ts',
      },
      plugins: ['typescript-operations'],
    },
  },
  hooks: {
    afterOneFileWrite: ['prettier --write', 'echo'],
  },
};
export default config;
