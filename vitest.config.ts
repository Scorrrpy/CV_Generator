import { defineConfig } from 'vitest/config';
import { workspaceAliases } from './aliases.ts';

export default defineConfig({
  resolve: { alias: workspaceAliases },
  test: {
    projects: ['packages/engine', 'packages/studio', 'apps/web'],
  },
});
