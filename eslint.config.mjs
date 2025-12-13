import { nextLint } from "eslint-config-next";

export default [
  ...nextLint(),
  {
    ignores: ["**/node_modules/**", "**/.next/**"],
  },
];
