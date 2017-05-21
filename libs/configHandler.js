const fs = require('fs');
const path = require('path');
const chalk = require('chalk');
const os = require('os');

const moduleInterface = {
  write,
  read
};

function write(config) {
  fs.writeFile(path.resolve(os.homedir(), 'simplelink.rc'), JSON.stringify(config), (err) => {
    if (!err) {
      console.log( chalk.green(`Path changed to: ${config.path}`) );
    }
    process.exit(0);
  });
}

function read(init) {
  fs.readFile(path.resolve(os.homedir(), 'simplelink.rc'), (err, data) => {
    if (err) {
      console.log( chalk.red('Can\'t open config file, you must specify a path before using autolink'));
      process.exit(1);
    } else {
      init(JSON.parse(data.toString()));
    }
  });
}

module.exports = moduleInterface;