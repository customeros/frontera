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
      [`${process.env.MAILSTACK_API_PATH}/query`]: {
        headers: {
          'X-CUSTOMER-OS-API-KEY': process.env.MAILSTACK_API_KEY as string,
          'Content-Type': 'application/json',
          TENANT: 'test',
        },
      },
    },
  ],
  documents: ['./src/infra/repositories/mailstack/**/*.graphql'],
  generates: {
    'src/routes/src/types/__generated__/graphqlMailstack.types.ts': {
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
          'src/routes/src/types/__generated__/graphqlMailstack.types.ts',
      },
      plugins: ['typescript-operations'],
    },
  },
  hooks: {
    afterOneFileWrite: ['prettier --write', 'echo'],
  },
};
export default config;
