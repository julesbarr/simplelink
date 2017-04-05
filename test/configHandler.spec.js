const configHandler = require('../libs/configHandler.js');
const assert = require('assert');
const path = require('path');

describe('configHandler module', () => {
    let random = Math.floor( Math.random() * 100 );
    let config = { magicNumber: random };
    it('should write and read the config file', (done) => {
        configHandler.write(config);
        configHandler.read(function(data) {
            assert.deepEqual(config,  data);
            done();
        });
    });
});