// Define helpers for later on
function isNonstrictSubclass(subclass, klass) {
  return subclass === klass || subclass.prototype instanceof klass;
}

// Define our mixin binding
function BackboneRelationship(Backbone, _) {
  // Define helper for defining on both Model and Collection
  function extendBackboneClass(klass) {
    // Save original methods locally
    var _constructor = klass.prototype.constructor;
    var __prepareModel = klass.prototype._prepareModel;
    var _set = klass.prototype.set;

    // Add on our model and collections mixins
    var mixins = {
      // DEV: We must define config inheritance in `constructor` since `initialize` is called **after** set
      //   https://github.com/jashkenas/backbone/blob/1.1.2/backbone.js#L256-L258
      constructor: function (attrs, options) {
        // If we have inherited options, save it for later on inheritance
        if (this.inheritedOptions !== undefined) {
          this._options = options;
        }

        // Call our normal constructor
        return _constructor.call(this, attrs, options);
      },
      _createRelationshipObject: function (Constructor, val) {
        // If we are building a model/collection, then pass in inherited options
        if (isNonstrictSubclass(Constructor, Backbone.Model) || isNonstrictSubclass(Constructor, Backbone.Collection)) {
          return new Constructor(val, this._getInheritedOptions());
        // Otherwise, construct as per usual
        } else {
          return new Constructor(val);
        }
      },
      _getInheritedOptions: function () {
        return _.pick(this._options, this.inheritedOptions);
      }
    };

    // If this is a model, add in a `set` override
    if (klass === Backbone.Model) {
      // https://github.com/jashkenas/backbone/blob/1.1.2/backbone.js#L305-L374
      mixins.set = function (key, val, options) {
        // If we don't have a key, do nothing
        if (key === null || key === undefined) {
          return this;
        }

        // If we have an object
        var Constructor;
        if (typeof key === 'object') {
          // Copy it to prevent mutation by key
          var attrs = key = _.clone(key);

          // For each of the keys in our relationships
          if (this.relationships) {
            for (var relKey in this.relationships) {
              // If the attribute has that key and it's not yet constructed, then build it
              if (this.relationships.hasOwnProperty(relKey) &&
                  attrs.hasOwnProperty(relKey) &&
                  !(attrs[relKey] instanceof this.relationships[relKey])) {
                Constructor = this.relationships[relKey];
                attrs[relKey] = this._createRelationshipObject(Constructor, attrs[relKey]);
              }
            }
          }
        // Otherwise, if the key exists in our relationships and it's not yet constructed, then build it
        } else if (this.relationships &&
            this.relationships.hasOwnProperty(key) &&
            !(val instanceof this.relationships[key])) {
          Constructor = this.relationships[key];
          val = this._createRelationshipObject(Constructor, val);
        }

        // Call our original function
        return _set.call(this, key, val, options);
      };
    // Otherwise, if this is a collection, add in a `prepareModel` override
    } else if (klass === Backbone.Collection) {
      // https://github.com/jashkenas/backbone/blob/1.1.2/backbone.js#L909-L919
      mixins._prepareModel = function (attrs, options) {
        // Add on inherited options to options and run normal _prepareModel
        if (this.inheritedOptions !== undefined) {
          options = _.defaults({}, options, this._getInheritedOptions());
        }
        return __prepareModel.call(this, attrs, options);
      };
    }

    // Return our extended class
    // DEV: Even if we wanted, we cannot perform extension because we require `constructor` support.
    //   Overriding `Backbone.Model's` constructor with a proxy wrapper would likely break `instanceof`
    //   (e.g. `x instanceof Backbone.Model` would break)
    return klass.extend(mixins);
  }

  // Extend and return Backbone
  return _.defaults({
    Collection: extendBackboneClass(Backbone.Collection),
    Model: extendBackboneClass(Backbone.Model)
  }, Backbone);
}

// Export our function
exports.mixin = BackboneRelationship;
