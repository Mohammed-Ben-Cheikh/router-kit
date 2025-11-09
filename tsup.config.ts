import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts"],
  format: ["cjs", "esm"], // CommonJS and ES Modules
  dts: true, // Generate declaration files
  splitting: false,
  sourcemap: false, // Disable sourcemaps for production
  clean: true,
  minify: true, // Minify output - makes it unreadable
  treeshake: true, // Remove unused code
  outDir: "dist",
  external: ["react", "react-dom"], // Don't bundle peer dependencies
  esbuildOptions(options) {
    options.mangleProps = /^_/; // Obfuscate private properties
  },
});
