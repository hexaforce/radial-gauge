import { terser } from 'rollup-plugin-terser'

export default {
  input: 'src/radial-gauge.js',
  output: {
    file: 'dist/radial-gauge.js',
    format: 'es',
    name: 'StarCompass',
    exports: 'default',
  },
  plugins: [terser()],
}
