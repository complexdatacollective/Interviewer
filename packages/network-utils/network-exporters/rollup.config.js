import { nodeResolve } from "@rollup/plugin-node-resolve";
import pkg from "./package.json";

const input = ["src/index.js"];

export default [
  {
    // UMD
    input,
    plugins: [
      nodeResolve(),
    ],
    output: {
      file: `dist/${pkg.name}.min.js`,
      format: "umd",
      name: "network-exporters", // this is the name of the global object
      esModule: false,
      exports: "named",
      sourcemap: true,
    },
  },// ESM and CJS
  {
    input,
    plugins: [nodeResolve()],
    output: [
      {
        dir: "dist/esm",
        format: "esm",
        exports: "named",
        sourcemap: true,
      },
      {
        dir: "dist/cjs",
        format: "cjs",
        exports: "named",
        sourcemap: true,
      },
    ],
  },
];
