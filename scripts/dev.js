//这个文件会帮我们打包 package下的文件,最终打包出js文件

// node dev.js ( 要打包的名字 -f 打包的格式 ) === argv.slice(2)

import minimist from "minimist";
import { createRequire } from "module";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";
import esbuild from "esbuild";
// pnpm install vue -w 安装到更目录下
// node 中的命令行参数通过process 来获取 process.argv
//esm 使用commonjs 变量
const args = minimist(process.argv.slice(2));
const __fileName = fileURLToPath(import.meta.url); //获取文件的绝对路径 file:// ->/usr
const __dirname = dirname(__fileName);
const require = createRequire(import.meta.url);
const target = args._[0] || "reactivity"; //打包哪个项目
const format = args.f || "iife"; //打包后的模块化规范
console.log(target, format);
//入口文件
const entry = resolve(__dirname, `../packages/${target}/src/index.ts`);
const pkg = require(`../packages/${target}/package.json`);
esbuild
  .context({
    entryPoints: [entry], //入口
    outfile: resolve(__dirname, `../packages/${target}/dist/${target}.js`), //出口
    bundle: true, //reactivity ->shared 会打包到一起
    platform: "browser", //打包后给浏览器使用
    sourcemap: true, //可以调试源代码
    format, // cjs esm iife
    globalName: pkg.buildOptions?.name,
  })
  .then((ctx) => {
    console.log("start dev ");
    return ctx.watch(); //监控入口文件持续进行打包
  });
