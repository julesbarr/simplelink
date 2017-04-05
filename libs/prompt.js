const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

/**
* This function will prompt the user to manually enter the URL of the repo.
*/
function promptURLManually() {
  // Prompt for the url in case the get repo command fails.
  return new Promise((resolve, reject) => {
    rl.question('The URL for that package couldn\'t be found, please enter it manually: ', (u) => {
      rl.close();
      resolve(u);
    });
  });
};

module.exports = promptURLManually;