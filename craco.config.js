const path = require(`path`);

module.exports = {
  webpack: {
    alias: {
      "@behaviours": path.resolve(__dirname, `src/behaviours/`),
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
  },
};