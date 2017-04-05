const lookInFile = require('../libs/fileSearch.js');
const assert = require('assert');
const path = require('path');

describe('Look in file helper', () => {
    it('should return the url of a given package', (done) => {
        lookInFile( path.resolve(process.cwd(), 'test'), 'test1.json', 'simplelink' )
        .then(function(url) {
            assert.equal("https://github.com/barriojules/simplelink", url);
            done();
        });
    });

    it('should reject the promise if the value isn\'t a url', (done) => {
        lookInFile( path.resolve(process.cwd(), 'test'), 'test2.json', 'simplelink' )
        .then(function(url) {
            //SHOULDN'T EXECUTE THIS CODE
        }, function() {
            done();
        });
    });
});