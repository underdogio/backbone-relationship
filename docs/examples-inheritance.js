// Extend Backbone and add our bindings
var BackboneRelationship = require('../');
var Backbone = BackboneRelationship.mixin(require('backbone'), require('underscore'));

// Define our models/collections
var LocationModel = Backbone.Model.extend({
  inheritedOptions: ['config'],
  initialize: function (attrs, options) {
    // Save the config for later
    this._config = options.config;

    // Call the default constructor
    return Backbone.Model.prototype.initialize.call(this, attrs, options);
  }
});
var UserModel = Backbone.Model.extend({
  inheritedOptions: ['config'],
  initialize: function (attrs, options) {
    this._config = options.config;
    return Backbone.Model.prototype.initialize.call(this, attrs, options);
  },
  relationships: {
    location: LocationModel
  }
});
var UserCollection = Backbone.Collection.extend({
  initialize: function (models, options) {
    this._config = options.config;
    return Backbone.Collection.prototype.initialize.call(this, models, options);
  },
  inheritedOptions: ['config'],
  model: UserModel
});

// Create a collection with a config
var users = new UserCollection([{
  name: 'Bark Ruffalo',
  location: {
    name: 'New York City'
  }
}], {config: {baseUrl: 'https://underdog.io/'}});

// Verify we have `config` saved on each collection/model
console.log(users._config); // {baseUrl: 'https://underdog.io/'}
var user = users.at(0); // new UserModel({name: 'Bark Ruffalo', location: ...}, {config: ...})
console.log(user._config); // {baseUrl: 'https://underdog.io/'}
var location = user.get('location'); // new LocationModel({name: 'New York City'}, {config: ...})
console.log(location._config); // {baseUrl: 'https://underdog.io/'}
