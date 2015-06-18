// Load in dependencies
var assert = require('assert');
var backboneRelationship = require('../');

// Start our tests
describe('backbone-relationship', function () {
  it('returns awesome', function () {
    assert.strictEqual(backboneRelationship(), 'awesome');
  });
});
