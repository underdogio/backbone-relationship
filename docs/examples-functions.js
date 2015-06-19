// Extend Backbone and add our bindings
var BackboneRelationship = require('../');
var Backbone = BackboneRelationship.mixin(require('backbone'), require('underscore'));

// Define a model with a Date
var ItemModel = Backbone.Model.extend({
  relationships: {
    created_at: Date
  }
});
var item = new ItemModel({created_at: '2014-01-01'});
console.log(item.get('created_at')); // Date('2014-01-01'); Wed Jan 01 2014 00:00:00 GMT

// Define a model with a custom function
var ItemModel = Backbone.Model.extend({
  relationships: {
    tags: function (tags) {
      // Split up a CSV by commas
      return tags.split(/,/g);
    }
  }
});
var item = new ItemModel({tags: 'green,medium'});
console.log(item.get('tags')); // ['green', 'medium']
