#!/usr/bin/env node
const exec = require('child_process').exec;
const fs = require('fs');
const program = require('commander');
const chalk = require('chalk');
const rimraf = require('rimraf');
const path = require('path');
const lookInfile = require('./libs/fileSearch');
const configHandler = require('./libs/configHandler');
const promptURLManually = require('./libs/prompt');
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
  configHandler.write( config );
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
      cloneRepo: (url) => `git clone ${url}`
    },
    'bower': {
      filename: 'bower.json',
      directory: () => '/bower_components/',
      getRepoUrl: (packageName) => `bower lookup ${packageName}`,
      firstLink: () => 'bower link',
      secondLink: (packageName) => `bower link ${packageName}`
    },
    'npm': {
      filename: 'package.json',
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
* @param { Object } config - config Object
*/
function init(config) {
  let cwd = process.cwd();
  let type = program.bower ? 'bower' : 'npm';
  let dictionary = commandsDictionary(type);
  let commons = commandsDictionary('commons');
  let clonePath = config.path || cwd;
  let packagePath = path.resolve( clonePath, packageName );
  let url;
  
  command(dictionary.getRepoUrl(packageName))
  .then((data) => {
    let url;
    if (data.indexOf('Package not found.') > -1 || data === 'null' || data === 'undefined' || !data) {
      throw new Error('Package not found.');
    }
    
    let prefix = /.*(git|http|https):\/\//.exec(data)[1];
    url = data.replace(/.*(git|http|https):\/\//, `${prefix}://`);
    return Promise.resolve(url);
  })
  .catch(function() {
    return lookInfile(cwd, dictionary.filename, packageName);
  })
  .catch(promptURLManually)
  .then((u) => {
    url = u;
  })
  .then(() => {
    console.log( chalk.green(' Deleting existing directory...') );
    rimraf( '.' + dictionary.directory() + packageName, function(err) {
      if (err) {
        onError('Error deleting existing package\'s directory ');
      }
    });
  })
  .then(() => {
    return new Promise(function(resolve, reject) {
      fs.access(packagePath, function(err) {
        if (err) {
          console.log( chalk.blue('DIRECTORY DOESN\'T EXISTS, CLONING THE REPO...') );
          process.chdir(clonePath);
          command(commons.cloneRepo(url)).then(resolve, reject);
        } else {
          console.log( chalk.blue('DIRECTORY EXISTS, USING EXISTING ONE... ') );
          resolve();
        }
      });
    });
  })
  .then(() => {
    // First step link
    process.chdir( packagePath );
    return command( dictionary.firstLink() );
  })
  .then(() => {
    // Second step link
    process.chdir(cwd);
    return command( dictionary.secondLink(packageName) );
  })
  .then(() => {
    console.log( chalk.green('PACKAGE LINKED!') );
    process.exit(0);
  })
  .catch(onError)
}

configHandler.read(init);