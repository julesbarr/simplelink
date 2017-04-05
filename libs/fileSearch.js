const fs = require('fs');
const path = require('path');

function lookInfile(cwd, filename, packageName) {
  return new Promise((resolve, reject) => {
    
    fs.readFile(path.resolve(cwd, filename), (err, data) => { 
      if (err) {
        reject(err);
      }
      let content = data.toString();
      let regex = new RegExp(`(\\W?)${packageName}\\1:.*(?=,?)`);
      let result = regex.exec(content);
      let packageLine = result && result[0];
      if (!packageLine) {
        reject();
        return;
      }
      let url = packageLine.replace(/(.+?:\s?)/, '').replace(/"|'/g, '').trim();
      let valid = /:\/\//.test(url);
      if (valid) {
        resolve(url);
      } else {
        reject();
      }
    });
  });
}

module.exports = lookInfile;