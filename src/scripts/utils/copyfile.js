/**
* @author baiyunsong
* @date 2023-11-03 11:06:34
* @description 复制文件夹
*/
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