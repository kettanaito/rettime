import { defineConfig } from 'tsup'

export default defineConfig({
  entry: ['src/**/*.ts'],
  format: 'esm',
  outDir: './build',
  clean: true,
  minify: true,
  bundle: false,
  dts: true,
})
