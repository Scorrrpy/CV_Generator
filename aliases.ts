import { fileURLToPath, URL } from 'node:url';

/**
 * Inside the monorepo the packages are consumed from source, so nothing has to be built
 * before `npm run dev` or `npm test`. Published builds resolve them from `node_modules`.
 */
export const workspaceAliases = {
  '@scorrrpy/cv-engine': fileURLToPath(new URL('./packages/engine/src/index.ts', import.meta.url)),
  '@scorrrpy/cv-studio': fileURLToPath(new URL('./packages/studio/src/index.ts', import.meta.url)),
};
