import { defineConfig } from 'tsdown'

export default defineConfig({
  entry: ['src/**/*.ts'],
  format: 'esm',
  outDir: './build',
  minify: false,
  sourcemap: true,
  clean: true,
})
