import resolve from 'rollup-plugin-node-resolve';
import babel from 'rollup-plugin-babel';
import commonjs from 'rollup-plugin-commonjs';
import serve from 'rollup-plugin-serve';

export default {
  input: './src/single-spa.js',
  output: {
    file: './lib/umd/single-spa.js',
    format: 'umd',
    name: 'singleSpa',
    sourcemap: true
  },
  plugins: [
    resolve(),
    commonjs(),
    babel({ exclude: 'node_modules/**' }),
    // 见下方的package.json文件script字段中的serve命令
    // 目的是只有执行serve命令时才启动这个插件
    serve({
      open: true,
      contentBase: '',
      openPage: '/toutrial/index.html',
      host: 'localhost',
      port: '10001'
    })
  ]
}