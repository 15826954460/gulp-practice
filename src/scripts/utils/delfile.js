/**
* @author baiyunsong
* @date 2023-11-03 11:06:53
* @description 删除旧文件
*/
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
