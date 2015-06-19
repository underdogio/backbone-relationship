# backbone-relationship [![Build status](https://travis-ci.org/underdogio/backbone-relationship.png?branch=master)](https://travis-ci.org/underdogio/backbone-relationship)

[Backbone][] plugin that coerces attributes to models and collections

[Backbone]: http://backbonejs.org/

This library was built to solve handling relationships in a non-complex manner. We were frustrated at the excess amount of code in existing Backbone relationship libraries. This library focuses on one thing well, **"converting objects/arrays to models/collections"**.

## Getting Started
### npm
Install the module with: `npm install backbone-relationship`

```js
// Extend Backbone and add our bindings
var BackboneRelationship = require('backbone-relationship');
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
location.get('city'); // San Francisco
location.getFullName(); // San Francisco, CA

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
locations.at(1).getFullName(); // Los Angeles, CA
```

More examples can be found in the [Examples section](#examples).

### bower
Install the module with: `bower install backbone-relationship`

```html
<script src="bower_components/backbone-relationship/dist/backbone-relationship.min.js"></script>
<script>
  window.BackboneRelationship; // Use same as in `npm`
</script>
```

### Vanilla
Download the minified JS at:

https://raw.githubusercontent.com/underdogio/backbone-relationship/master/dist/backbone-relationship.min.js

```html
<script src="backbone-relationship.min.js"></script>
<script>
  window.BackboneRelationship; // Use same as in `npm`
</script>
```

## Documentation
`backbone-relationship` exposes the object `BackboneRelationship` as its `module.exports`.

### `BackboneRelationship.mixin(Backbone, _)`
Extend Backbone and return Backbone with updated `Model` and `Collection` classes.

This will not mutate Backbone's `Model` and `Collection` classes.

- Backbone `Object` - Backbone library to mix into
    - Model `Function` - Constructor for Backbone models to add new behavior to
    - Collection `Function` - Constructor for Backbone collections to add new behavior to
- _ `Object` - Underscore library used by Backbone

**Returns:**

- ExtendedBackbone `Object` - Extension of `Backbone` library passed in with extended `Backbone.Model` and `Backbone.Collection` classes

### `Model.prototype.relationships`
Any future models created from our extended Backbone will be allowed to coerce attributes from strings/objects into `Models`/`Collections`/any constructor.

- relationships `Object` - Container to which attributes to be coerced
    - * `Mixed` - Each key/value pair will be treated as a key to coerce from a model's `attributes` via its value (typically a constructor)
        - For example, a model with `relationships: {location: LocationModel}`
            - When we run `.set('location', {name: 'NYC'})`, we will generate a `LocationModel({name: 'NYC'})` and save it at `model.get('location')`
            - Under the hood, `.set` is run on initialize and any time an attribute is updated
        - An example with a non-Backbone constructor is a model with `relationships: {created_at: Date}`
            - When we run `.set('created_at', '2014-01-01')`, we will generate a `new Date('2014-01-01')` and save it at `model.get('created_at')`

For more examples, please see the [Examples section](#functionsconstructors).

### `Model/Collection.prototype.inheritedOptions`
Any future models/collections created from our extended Backbone will be allowed to pass options to their children.

- inheritedOptions `Array` - Names of options to pass on from parent to child relationship
    - * `String` - Name of option to pass on
        - For example, a model with `inheritedOptions: ['config'], relationships: {location: LocationModel}`
            - We will initialize our model via `new UserModel({location: {name: 'NYC}}, {config: 'hello', query: true})`
            - When we run `.set('location', {name: 'NYC'})`, we will generate a `LocationModel({name: 'NYC'}, {conifg: 'hello'})`. This means we will create a new set of options based off of the parent's options to pass through (i.e. `{config: 'hello'}`)
        - An example with a collection is `inheritedOptions: ['config'], model: UserModel`
            - We will initialize our collection via `new UserCollection([{location: {name: 'NYC}}], {config: 'hello', query: true})`
            - Each of our models in this collection will be initialized via `UserModel(attrs, {conifg: 'hello'})` (e.g. `UserModel({location: {name: 'NYC'}}, {conifg: 'hello'})`)

For more examples, please see the [Examples section](#inheritance).

## Examples
### Functions/Constructors
In order to make type coercion easy for some properties (e.g. `Date`), we support invoking any `function` as if it were a constructor (e.g. `Date`, `RegExp`). This example provides a few scenarios:

```js
// Extend Backbone and add our bindings
var BackboneRelationship = require('backbone-relationship');
var Backbone = BackboneRelationship.mixin(require('backbone'), require('underscore'));

// Define a model with a Date
var ItemModel = Backbone.Model.extend({
  relationships: {
    created_at: Date
  }
});
var item = new ItemModel({created_at: '2014-01-01'});
item.get('created_at'); // Date('2014-01-01'); Wed Jan 01 2014 00:00:00 GMT

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
item.get('tags'); // ['green', 'medium']
```

### Inheritance
When using Backbone on the server, it is critical to pass around specific information between inherited models (e.g. external URL for server; `underdog.io`). In this example, we will pass through an inherited option from a collection to a model to a submodel to demonstrate the depth of inheritance.

```js
// Extend Backbone and add our bindings
var BackboneRelationship = require('backbone-relationship');
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
users._config; // {baseUrl: 'https://underdog.io/'}
var user = users.at(0); // new UserModel({name: 'Bark Ruffalo', location: ...}, {config: ...})
user._config; // {baseUrl: 'https://underdog.io/'}
var location = user.get('location'); // new LocationModel({name: 'New York City'}, {config: ...})
location._config; // {baseUrl: 'https://underdog.io/'}
```

## Contributing
In lieu of a formal styleguide, take care to maintain the existing coding style. Add unit tests for any new or changed functionality. Lint via `npm run lint` and test via `npm test`.

## License
Copyright (c) 2015 Underdog.io

Licensed under the MIT license.
