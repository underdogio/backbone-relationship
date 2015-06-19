// Load in dependencies
var assert = require('assert');
var BackboneRelationship = require('../');
var Backbone = BackboneRelationship.mixin(require('backbone'), require('underscore'));

// Start our tests
// Basic tests
describe('A relationship that is a model', function () {
  var LocationModel = Backbone.Model.extend({});
  var UserModel = Backbone.Model.extend({
    relationships: {
      location: LocationModel
    }
  });

  describe('when constructed with an object', function () {
    it('has a model as a property', function () {
      var userModel = new UserModel({
        location: {name: 'NYC'}
      });
      assert.strictEqual(userModel instanceof UserModel, true);
      assert.strictEqual(userModel.get('location') instanceof LocationModel, true);
      assert.strictEqual(userModel.get('location').get('name'), 'NYC');
    });
  });

  describe('when constructed with a model', function () {
    it('doesn\'t reinitialize the model', function () {
      // Initialize our model and set a special property
      var locationModel = new LocationModel({
        name: 'SF'
      });
      locationModel.hello = 'world';

      // Create our parent model and verify attributes
      var userModel = new UserModel({
        location: locationModel
      });
      assert.strictEqual(userModel instanceof UserModel, true);
      assert.strictEqual(userModel.get('location') instanceof LocationModel, true);
      assert.strictEqual(userModel.get('location').get('name'), 'SF');
      assert.strictEqual(userModel.get('location').hello, 'world');
    });
  });
});

describe('A relationship that is a collection', function () {
  var LocationCollection = Backbone.Collection.extend({});
  var UserModel = Backbone.Model.extend({
    relationships: {
      locations: LocationCollection
    }
  });

  describe('when constructed an array', function () {
    it('has a collection as a property', function () {
      var userModel = new UserModel({
        locations: [{name: 'NYC'}]
      });
      assert.strictEqual(userModel instanceof UserModel, true);
      assert.strictEqual(userModel.get('locations') instanceof LocationCollection, true);
      assert.strictEqual(userModel.get('locations').length, 1);
      assert.strictEqual(userModel.get('locations').at(0).get('name'), 'NYC');
    });
  });

  describe('when constructed an collection', function () {
    it('doesn\'t reinitialize the collection', function () {
      // Initialize our collection and set a special property
      var locationCollection = new LocationCollection([{
        name: 'SF'
      }]);
      locationCollection.hello = 'world';

      // Create our parent model and verify attributes
      var userModel = new UserModel({
        locations: locationCollection
      });
      assert.strictEqual(userModel instanceof UserModel, true);
      assert.strictEqual(userModel.get('locations') instanceof LocationCollection, true);
      assert.strictEqual(userModel.get('locations').length, 1);
      assert.strictEqual(userModel.get('locations').at(0).get('name'), 'SF');
      assert.strictEqual(userModel.get('locations').hello, 'world');
    });
  });
});

describe('A relationship that is a Date', function () {
  var UserModel = Backbone.Model.extend({
    relationships: {
      created_at: Date
    }
  });

  describe('when constructed a string', function () {
    it('has a Date as a property', function () {
      var userModel = new UserModel({
        created_at: '2014-01-01'
      });
      assert.strictEqual(userModel instanceof UserModel, true);
      assert.strictEqual(userModel.get('created_at') instanceof Date, true);
      assert.strictEqual(userModel.get('created_at').toUTCString(), 'Wed, 01 Jan 2014 00:00:00 GMT');
    });
  });

  describe('when constructed with a Date', function () {
    it('doesn\'t reinitialize the date', function () {
      // Initialize our date and set a special property
      var createdAt = new Date('2014-06-01');
      createdAt.hello = 'world';

      // Create our parent model and verify attributes
      var userModel = new UserModel({
        created_at: createdAt
      });
      assert.strictEqual(userModel instanceof UserModel, true);
      assert.strictEqual(userModel.get('created_at') instanceof Date, true);
      assert.strictEqual(userModel.get('created_at').toUTCString(), 'Sun, 01 Jun 2014 00:00:00 GMT');
      assert.strictEqual(userModel.get('created_at').hello, 'world');
    });
  });
});

// Inheritance tests
// Define common initialize function to save `config` from `options`
function getSaveConfig(klass) {
  var _initialize = klass.prototype.initialize;
  return function getSaveConfigFn (attrs, options) {
    this._config = (options || {}).config;
    return _initialize.call(this, attrs, options);
  };
}
describe('A relationship that is a model', function () {
  var UserModel = Backbone.Model.extend({
    inheritedOptions: ['config'],
    initialize: getSaveConfig(Backbone.Model),
    relationships: {
      location: Backbone.Model.extend({
        initialize: getSaveConfig(Backbone.Model)
      })
    }
  });

  describe('when constructed with an object', function () {
    it('passes through inherited options', function () {
      var userModel = new UserModel({
        location: {name: 'NYC'}
      }, {
        config: {hello: 'world'}
      });
      assert.deepEqual(userModel.get('location')._config, {hello: 'world'});
    });
  });
});

describe('A relationship that is a collection', function () {
  var LocationCollection = Backbone.Collection.extend({
    inheritedOptions: ['config'],
    initialize: getSaveConfig(Backbone.Collection),
    model: Backbone.Model.extend({
      initialize: getSaveConfig(Backbone.Model)
    })
  });

  describe('when constructed an array', function () {
    it('passes through inherited options', function () {
      var locationCollection = new LocationCollection([{
        name: 'NYC'
      }], {
        config: {hello: 'world'}
      });
      assert.deepEqual(locationCollection.at(0)._config, {hello: 'world'});
    });
  });
});

// Edge cases
describe('A relationship that is a model with a collection relationship', function () {
  var UserCollection = Backbone.Collection.extend({
    inheritedOptions: ['config'],
    initialize: getSaveConfig(Backbone.Collection),
    model: Backbone.Model.extend({
      inheritedOptions: ['config'],
      initialize: getSaveConfig(Backbone.Model),
      relationships: {
        locations: Backbone.Collection.extend({
          initialize: getSaveConfig(Backbone.Collection)
        })
      }
    })
  });

  describe('when constructed an array', function () {
    it('passes through inherited options', function () {
      var userCollection = new UserCollection([{
        locations: [{
          name: 'NYC'
        }]
      }], {
        config: {hello: 'world'}
      });
      assert.deepEqual(userCollection._config, {hello: 'world'});
      assert.deepEqual(userCollection.at(0)._config, {hello: 'world'});
      assert.deepEqual(userCollection.at(0).get('locations')._config, {hello: 'world'});
    });
  });
});
