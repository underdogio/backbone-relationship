// Extend Backbone and add our bindings
var BackboneRelationship = require('../');
var Backbone = BackboneRelationship.mixin(require('backbone'), require('underscore'));

// Define a model with a model relationship
var LocationModel = Backbone.Model.extend({
  getFullName: function () {
    return this.get('city') + ', ' + this.get('state');
  }
});
var UserModel = Backbone.Model.extend({
  relationships: {
    location: LocationModel
  }
});

// Create a user model
var user = new UserModel({location: {city: 'San Francisco', state: 'CA'}});
var location = user.get('location'); // LocationModel({city: 'San Francisco', state: 'CA'})
console.log(location.get('city')); // San Francisco
console.log(location.getFullName()); // San Francisco, CA

// Define a model with a collection relationship
var LocationCollection = Backbone.Collection.extend({model: LocationModel});
var UserModel = Backbone.Model.extend({
  relationships: {
    past_locations: LocationCollection
  }
});

// Create a user model
var user = new UserModel({
  past_locations: [{
    city: 'San Francisco', state: 'CA'
  }, {
    city: 'Los Angeles', state: 'CA'
  }]
});
var locations = user.get('past_locations'); // LocationCollection([{city: 'San Francisco', state: 'CA'}, ...])
locations.at(1); // LocationModel({city: 'Los Angeles', state: 'CA'})
console.log(locations.at(1).getFullName()); // Los Angeles, CA
