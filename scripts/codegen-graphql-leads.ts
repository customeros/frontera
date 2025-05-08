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
      [`${process.env.LEADS_API_PATH}/query`]: {
        headers: {
          'X-OPENLINE-API-KEY': process.env.LEADS_API_KEY as string,
          'Content-Type': 'application/json',
          'X-OPENLINE-USERNAME': 'customerostestuser@gmail.com',
        },
      },
    },
  ],
  documents: ['./src/infra/repositories/leads/**/*.graphql'],
  generates: {
    'src/routes/src/types/__generated__/graphqlLeads.types.ts': {
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
          'src/routes/src/types/__generated__/graphqlLeads.types.ts',
      },
      plugins: ['typescript-operations'],
    },
  },
  hooks: {
    afterOneFileWrite: ['prettier --write', 'echo'],
  },
};
export default config;
