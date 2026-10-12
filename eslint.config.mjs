import nextCoreWebVitals from 'eslint-config-next/core-web-vitals';
import nextTypescript from 'eslint-config-next/typescript';
import prettier from 'eslint-config-prettier';

/** eslint-config-next 16은 flat config를 직접 내보낸다 — FlatCompat이 필요 없다. */
const config = [
  ...nextCoreWebVitals,
  ...nextTypescript,
  prettier,
  { ignores: ['.next/**', 'node_modules/**', 'next-env.d.ts'] },
];

export default config;
