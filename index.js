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
const commandsDictionary = reuqire('./libs/commands');
const url = require('url');
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
  onError('Can\'t Autolink both npm and bower at the same time');
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
* Initialization function
* @param { Object } config - config Object
*/
function init(config) {
  let cwd = process.cwd();
  let type = program.bower ? 'bower' : 'npm';
  let dictionary = commandsDictionary(type);
  let commons = commandsDictionary('commons');
  let clonePath = config.path || cwd;
  let packagePath;
  let packageUrl;
  let folderName;
  
  command(dictionary.getRepoUrl(packageName))
  .then((data) => {
    if (data.indexOf('Package not found.') > -1 || data === 'null' || data === 'undefined' || !data) {
      throw new Error('Package not found.');
    }
    return Promise.resolve(data);
  })
  .catch(function() {
    return lookInfile(cwd, dictionary.filename, packageName);
  })
  .catch(promptURLManually)
  .then((u) => {
    packageUrl = u.trim().replace(/\/$/, '').replace(/\.git$/,'');
    let prefix = /.*(git|http|https|ssh):\/\//.exec(packageUrl);
    prefix = prefix && prefix[1];
    if (prefix) {
      // Clean up the prefix.
      packageUrl = packageUrl.replace(/.*(git|http|https|ssh):\/\//, `${prefix}://`);
    }
    /**
     * Picks the phrase after the last backslash, ex: http://github.net/test will pick test
     * Removes any versioning from the folderName
     */
    folderName = /(?!\/)[^/]*$/.exec(packageUrl)[0].replace(/#.*$/, '');
    packagePath = path.resolve(clonePath, folderName);
  })
  .then(() => {
    console.log( chalk.green(' Deleting existing directory...') );
    rimraf( path.resolve(cwd, dictionary.directory(), packageName), function(err) {
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
          command(commons.cloneRepo(packageUrl)).then(resolve, reject);
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

if (!program.path) {
  configHandler.read(init);
}