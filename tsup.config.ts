import { defineConfig } from 'tsup'

export default defineConfig({
  entry: ['src/**/*.ts'],
  format: 'esm',
  outDir: './build',
  clean: true,
  minify: false,
  sourcemap: true,
  bundle: false,
  dts: true,
})
