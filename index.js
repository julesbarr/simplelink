#!/usr/bin/env node
const exec = require('child_process').exec;
const fs = require('fs');
const program = require('commander');
const chalk = require('chalk');
const rimraf = require('rimraf');
const path = require('path');
let packageName;

program
  .arguments('<package>')
  .option('-p, --path [route]', 'Specifies a path where the packages should be storage')
  .option('-b, --bower', 'Autolink the package in bower_components')
  .option('-n, --npm', 'Autolink the package in node_modules')
  .action((package) => {
    packageName = package;
  })
  .parse(process.argv);

if (program.bower && program.npm) {
  onError('Can\'t Autolink both Npm and Bower at the same time');
}

// Overwrite config file in case a path is provided.
if (program.path && program.path.length) {
  let config = { path : program.path };
  fs.writeFile(path.resolve(__dirname, 'config.json'), JSON.stringify(config), (err) => {
    if (!err) {
      console.log( chalk.green(`Path changed to: ${program.path}`) );
    }
    process.exit(0);
  });
}

/**
 * Run a command in the console
 * @param { String } command - command to be runned
 * @param { String } runtimeArgs - arguments of that command
 * @returns { Promise }
 */
const command = (command) => {
  console.log(chalk.blue(command));
  let p = new Promise((resolve, reject) => {
    let s = exec(command, (err, stdout, stderr) => {
      if (err) {
        reject(err);
      }
      resolve(stdout);
    });
  });
  return p;
};

/**
 * Notify the user that an error has ocurred and exit the process
 * @apram { String } msg - message to be shown.
 */
function onError(msg) {
  console.log( chalk.red(msg) );
  process.exit(1);
}

/**
 * Returns the proper dictionary, with lazy evaluation strings
 * @param { String } type - type of dictionary
 * @returns { Function }
 */
function commandsDictionary(type) {
  let dictionaries = {
    'commons': {
      changeDirectory: (path) => `cd ${path}`,
      cloneRepo: (url) => `git clone ${url}`
    },
    'bower': {
      directory: () => '/bower_components/',
      getRepoUrl: (packageName) => `bower lookup ${packageName}`,
      firstLink: () => 'bower link',
      secondLink: (packageName) => `bower link ${packageName}`
    },
    'npm': {
      directory: () => '/node_modules/',
      getRepoUrl: (packageName) => `npm view ${packageName} repository.url`,
      firstLink: () => 'npm link',
      secondLink: (packageName) => `npm link ${packageName}`
    }
  };
  return dictionaries[type];
}

/**
 * Initialization function
 * @param { String } type - type of autolink (npm / bower)
 * @param { Object } config - config Object
 */
function init(type, config) {
  let cwd = process.cwd();
  let dictionary = commandsDictionary(type);
  let commons = commandsDictionary('commons');
  let url;

  command(dictionary.getRepoUrl(packageName))
    .then((data) => {
      // By default clone in the current directory.
      url = data.replace(/git\+/, '');
      let path = config.path || cwd;
      console.log( chalk.green(' Deleting existing directory...') );
      rimraf( '.' + dictionary.directory + packageName, function(err) {
        if (err) {
          onError('Error deleting existing node_modules package\'s directory ');
        }
      });
      // Position on specific path
      return command( commons.changeDirectory(path) );
    })
    .then(() => {
      // Clone the repo
      return command( commons.cloneRepo(url) ).then( () => command( commons.changeDirectory('./' + packageName) ) );
    })
    .then(() => {
      // First step link
      return command( dictionary.firstLink() ).then( () => command( commons.changeDirectory(cwd) ) );
    })
    .then(() => {
      // Second step link
      return command( dictionary.secondLink(packageName) );
    })
    .catch((e) => {
      onError(e);
    })
}

let type = program.bower ? 'bower' : 'npm';

fs.readFile(path.resolve(__dirname, 'config.json'), (err, data) => {
  if (err) {
    onError('Can\'t open config file, you must specify a path before using autolink');
  } else {
    init(type, data);
  }
});