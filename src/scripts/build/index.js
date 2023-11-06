/**
* @author baiyunsong
* @date 2023-11-03 11:06:14
* @description 打包构建
*/
const { series, parallel, src, dest } = require('gulp');
const minifyCSS = require('gulp-minify-css'); // 引入 css 压缩模块
const htmlmin = require('gulp-htmlmin') // 引入 html 压缩模块
const babel = require('gulp-babel'); // 引入 gulp-babel 模块
const uglify = require('gulp-uglify'); // 引入 gulp-uglify 模块

const { rootPath } = require('../utils/paths');
const { delPath } = require('../utils/delfile');
const { copyFolder } = require('../utils/copyfile');

// 样式打包压缩
const buildStyle = () => {
  const inputDir = `${rootPath}/src/assets/styles/*.css`;
  const outputDir = `${rootPath}/dist/assets/styles/`;
  return src(inputDir)
    .pipe(minifyCSS()) // 压缩
    .pipe(dest(outputDir)); // 输出到 dist 目录
};

// html 压缩
const buildHtml = () => {
  const inputDir = `${rootPath}/src/index.html`;
  const outputDir = `${rootPath}/dist`;
  return src(inputDir) // 打开读取文件
      .pipe(htmlmin({
        removeComments: true, // 清除HTML注释
        collapseWhitespace: true, // 压缩HTML
        collapseBooleanAttributes: true, // 省略布尔属性的值 <input checked="true"/> ==> <input checked />
        removeEmptyAttributes: true, // 删除所有空格作属性值 <input id="" /> ==> <input />
        removeScriptTypeAttributes: false, // 删除<script>的type="text/javascript"
        removeStyleLinkTypeAttributes: true, // 删除<style>和<link>的type="text/css"
        minifyJS: true, // 压缩页面JS
        minifyCSS: true // 压缩页面CSS
      })) // 管道流操作，压缩文件
      .pipe(dest(outputDir)) //指定压缩文件放置的目录
};

const buildJs = () => {
  const inputDir = `${rootPath}/src/scripts/index.js`;
  const outputDir = `${rootPath}/dist/scripts/`;
  return src(inputDir) // 指定要转换的JS文件路径  
    .pipe(babel({ presets: ['@babel/preset-env'] })) // 使用Babel进行转换
    .pipe(uglify()) // 压缩代码（可选）  
    .pipe(dest(outputDir)); // 指定转换后的文件输出路径
};

// 删除根目录下 dist 文件
const removeDist = () => {
  return delPath(`${rootPath}/dist`);
};

// 复制图片到 dist 目录
const copyFolderToDist = () => {
  const source = `${rootPath}/src/assets/images`;
  const destination = `${rootPath}/dist/assets/images`;
  copyFolder(source, destination);
};

exports.default = series(
  // 删除 dist 文件夹
  async () => removeDist(),
  // 并行打包 style、 html、 js 文件复制
  parallel(
    async () => buildStyle(),
    async () => buildHtml(),
    async () => buildJs(),
    async () => copyFolderToDist(),
  ),
);