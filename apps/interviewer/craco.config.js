const path = require(`path`);

module.exports = {
  webpack: {
    alias: {
      "@behaviours": path.resolve(__dirname, "src/behaviours/"),
      "@components": path.resolve(__dirname, "src/components"),
      "@containers": path.resolve(__dirname, "src/containers"),
      "@contexts": path.resolve(__dirname, "src/contexts"),
      "@ducks": path.resolve(__dirname, "src/ducks"),
      "@hooks": path.resolve(__dirname, "src/hooks"),
      "@images": path.resolve(__dirname, "src/images"),
      "@interfaces": path.resolve(__dirname, "src/components/interfaces"),
      "@routes": path.resolve(__dirname, "src/routes"),
      "@selectors": path.resolve(__dirname, "src/selectors"),
      "@styles": path.resolve(__dirname, "src/styles"),
      "@utils": path.resolve(__dirname, "src/utils"),
    },
    configure: {
      experiments: {
        topLevelAwait: true
      },
    },
  },
  jest: {
    configure: {
      moduleNameMapper: {
        // "This forces Jest/jest-environment-jsdom to use a Node+CommonJS version of uuid, not a Browser+ESM one",
        // "See https://github.com/uuidjs/uuid/pull/616",
        // "WARNING: if your dependency tree has multiple paths leading to uuid, this will force all of them to resolve to",
        // "whichever one happens to be hoisted to your root node_modules folder. This makes it much more dangerous",
        // "to consume future uuid upgrades. Consider using a custom resolver instead of moduleNameMapper.",
        "^uuid$": "<rootDir>/node_modules/uuid/dist/index.js",
      },
    },
  },
};