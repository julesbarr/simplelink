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

module.exports = commandsDictionary;