# 前言

本文重点 ☞ 在于手把手教你流程化打包构建一个活动页，通过实战的方式**了解、学习、并使用** `Gulp4` 的一些 API 在实际工作中的应用。

# 正文

如果你对 gulp 相关的概念不是很熟悉，请通过其它方式进行了解。
本文对应 Demo GitHub 仓库地址：xxxxx

## 环境&依赖

*   Node 版本 18 (demo 的版本18.16.0) [node 官方地址](https://nodejs.org/en)
*   Git  [Git 官方下载地址](https://git-scm.com/)
*   Npm (demo 版本 9.5.1)
*   Pnpm (demo 当时依赖的版本 8.6.0) [pnpm 官方地址](https://pnpm.io/installation)

## 项目搭建

1.  项目初始化

    ```bash
     1. mkdir gulp-practile-demo
     2. cd gulp-practile-demo
     3. pnpm init
     4. mkdir src
     5. touch readme.md
     6. cd src
     7. mkdir assets
     8. cd assets
     9. mkdir images
     10 mkdir styles
    ```

    项目目录如下：

         ├── gulp-practile-demo
         │   └── src
         │       └── assets // 静态资源目录
         │           └── images
         │           └── styles 
         │   └── index.html
         │   └── package.json
         |   └── readme.md

2.  活动页面开发\
    活动页的 Code 在这里就不具体介绍了，可以自行写一个，或者直接从 Github Demo 里 clone

## Gulp 自动化构建部署

### 打包 html 文件

1.  **安装依赖**
    ```bash
     pnpm add gulp gulp-htmlmin -D
    ```
2.  **src/srcipts/utils 文件下新建 paths.js**  
    path.js 主要用来针对基本路径的维护，如果你对 `Vue、React` 相关框架比较熟，就类似于 alias 别名对路径的维护
    ```js
     const path = require('path');
     const rootPath = path.resolve(__dirname, '../../../'); // 项目根目录

     module.exports = {
       rootPath,
     };
    ```

3.  **src/srcipts/build 新建 index.js**  
    build/index.js 为 gulp 打包构建的入口目录

    ```js
     const { series, src, dest } = require('gulp');
     const htmlmin = require('gulp-htmlmin') // 引入 html 压缩模块

     const { rootPath } = require('../utils/paths');

     const buildHtml = () => {
       const inputDir = `${rootPath}/src/index.html`; // html 入口文件
       const outputDir = `${rootPath}/dist`; // 构建输出 目录
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
           .pipe(dest(outputDir)) // 指定压缩文件放置的目录
     };

     exports.default = series(buildHtml); // series 串联执行打包脚本
    ```

4.  **修改 package.json 打包命令**

    gulp -f 用来修改指定执行 gulp 脚本的文件

    ```json
     {
       "scripts": {
         + "build": "gulp -f ./src/scripts/build/index.js"
       }
     }
    ```

以上配置可以将 html 文件打包到 dist/index.html, 但是 css 的引用路径有问题，会导致 index.html 无法正常访问。接下来我们解决 css  的打包和路径引用问题

### 打包 css  

   css 打包之前，先将 css 复制到 dist/assets/styles 文件然后再进行打包
   > 复制 css 到 dist/assets/styles 目录下, 主要是为了保证目录结构相同，避免打包后还需要修改 html 中引入 css 文件路径

   index.html 样式引入是通过 link 外链的 如图
    <img src="https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/46ee58ecfcce4c1d880644e0d984e28e~tplv-k3u1fbpfcp-jj-mark:0:0:0:0:q75.image#?w=619&h=144&s=18208&e=png&b=1f1f1f" alt="link-css.png" width="100%" />
   
    
   *  **1. 复制文件 Js 脚本**  
      src/scripts/utils 文件下新建 copyfile.js

      ```js
         const fs = require('fs');  
         const path = require('path');
           
         const copyFolder = (source, destination) => {
         // 如果目标文件夹不存在，则创建
         if (!fs.existsSync(destination)) {
            fs.mkdirSync(destination, { recursive: true });
         }
         // 读取目录中的所有文件/目录
         const files = fs.readdirSync(source);

         console.log('files', files);
         
         files.forEach((file) => {
            const sourcePath = path.join(source, file);
            const destinationPath = path.join(destination, file);
         
            // 如果是文件夹则递归调用自身
            if (fs.lstatSync(sourcePath).isDirectory()) {
               copyFolder(sourcePath, destinationPath);
            } else {  
               fs.copyFileSync(sourcePath, destinationPath);
            }
         });
         };

         module.exports = { copyFolder };
      ```
      
   *  **2. css 文件复制**  
      src/scripts/build/index.js 修改打包代码

      ```js
         + const { copyFolder } = require('../utils/copyfile');

         // 复制图片到 dist 目录
         + const copyFolderToDist = () => {
         +   const source = `${rootPath}/src/assets/images`;
         +   const destination = `${rootPath}/dist/assets/images`;
         +   copyFolder(source, destination);
         + };
      ```

*  **3. css 打包压缩**  
   scr/scripts/build/index.js 修改打包代码
   ```js
      + const minifyCSS = require('gulp-minify-css');

      // 样式打包压缩
      + const buildStyle = () => {
      +   const inputDir = `${rootPath}/src/assets/styles/*.css`;
      +   const outputDir = `${rootPath}/dist/assets/styles/`;
      +   return src(inputDir)
      +     .pipe(minifyCSS()) // 压缩
      +     .pipe(dest(outputDir)); // 输出到 dist 目录
      + };

      - exports.default = series(buildHtml);

      + exports.default = series(
      +   // 并行执行打任务
      +   parallel(
      +      async () => buildHtml(),
      +      async () => copyFolderToDist(),
      +      async () => buildStyle()
      +   )
      + );
   ```

*  **4. 执行打包**

   ```bash
      npm run build
   ```
   打包之后的 html 文件如下  
   <img src="https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/7cc86146e6ab4c0991421c45340a3e59~tplv-k3u1fbpfcp-jj-mark:0:0:0:0:q75.image#?w=1013&h=319&s=88079&e=png&b=1d1d1d" alt="build-html.png" width="100%" />   

### 打包 js
   
   实际工作中，所有前端页面都不可能仅仅只是单纯的静态页面，接下来我们对 js 文件进行压缩打包

   1. **src/scripts 新建 index.js**
      ```js
         // 测试代码如下
         document.body.addEventListener('click', (e) => {
            console.log(e.target);
            console.log('Hello World!');
         });
      ```

   2. **src/index.html 引入**
      ```html
         + <script scr="./scripts/index.js"></script>
      ```
   
   3. 安转依赖
      ```bash
         pnpm add gulp-uglify -D
      ```

   4. **src/scripts/build/index.js 新增 Js 文件打包压缩脚本**
      ```js
         + const uglify = require('gulp-uglify'); // 引入 gulp-uglify 模块
         + const buildJs = () => {
         +   const inputDir = `${rootPath}/src/scripts/index.js`;
         +   const outputDir = `${rootPath}/dist/scripts/`;
         +
         +   return src(inputDir) // 指定要转换的JS文件路径  
         +    .pipe(babel({ presets: ['@babel/preset-env'] })) // 使用Babel进行转换
         +    .pipe(uglify()) // 压缩代码（可选）  
         +    .pipe(dest(outputDir)); // 指定转换后的文件输出路径
         + };

          exports.default = series(
            parallel(
               async () => buildHtml(),
               async () => buildStyle(),
         +     async () => buildJs(),
               async () => copyFolderToDist(),
            )
          );
      ```

### 规范打包流程
   > 项目的部署上线终究不是一锤子买卖，从 研发 =》 测试 =》 部署 =》 上线 =》迭代 我们每次打包都需要重新跟新代码，接下来我们补充一下删除 dist 文件夹的逻辑

   1. **src/scripts/utils 新增 defile.js **
   ```js
      const fs = require('fs');
      const { resolve } = require('path');
      const { rootPath } = require('./paths');

      // 需要保留的文件
      const stayFile = ['package.json', 'README.md'];

      // 定义删除文件的方法
      const delPath = async (path) => {
         let files = [];
         if (fs.existsSync(path)) {
            files = fs.readdirSync(path);
            files.forEach(async (file) => {
               let curPath = resolve(path, file);
               if (fs.statSync(curPath).isDirectory()) {
                  // recurse
                  if (file != 'node_modules') await delPath(curPath);
               } else {
                  // delete file
                  if (!stayFile.includes(file)) {
                     // delete file
                     fs.unlinkSync(curPath);
                  }
               }
            });
            // 删除给定路径下的目录
            if (path != `${rootPath}`) fs.rmdirSync(path);
         }
      };
      module.exports = { delPath };
   ```
   
   2. **src/scripts/build/index.js 新增 Js 删除文件夹脚本**
   ```js
      + const { delPath } = require('../utils/delfile');

      + // 删除根目录下 dist 文件
      + const removeDist = () => {
      +   return delPath(`${rootPath}/dist`);
      + };

      exports.default = series(
      +  // 删除 dist 文件夹
      +  async () => removeDist(),
         // 并行打包 style、 html、 js 文件复制
         parallel(
            async () => buildStyle(),
            async () => buildHtml(),
            async () => buildJs(),
            async () => copyFolderToDist(),
         ),
      );
   ```

## 写在最后
以上就是关于 Gulp 构建打包活动页的整个流程，整个学习过程中的完整 Demo 可参考 github 仓库地址 [demo 仓库地址]()

多页面使用 Gulp 进行流程化打包构建整主要解决各种文件之间的依赖，一些公用的部分也需要单独处理，单整体的思路同单个活动页打包保持一致，根据实际业务进行对应的调整和处理。

本期分享就到此为止，如果有问题**欢迎评论区进行交流讨论**，我会根据大家的意见相关博文的输出，下一篇计划输出 Rollup 在开发 npm 包中的实战。

如果该文章对你有所帮助，欢迎点赞、收藏、评论、转发，你的支持是我最大的动力。
