define(['term', 'xdate'], function(Term, XDate) {
    return Backbone.Collection.extend({
        initialize: function(models, options) {
          if (options && options.nToKeep) {
            this.nToKeep = options.nToKeep;
            this.memory = new Backbone.Collection;

            var nToKeep = this.nToKeep;
            this.memory.on('add', function() {
              while(this.length > nToKeep) {
                this.shift();
              }
            });
          }
        },
        _getSecondRange: function(args) {
          var start = new XDate();
          return _.range(0, args.toSeconds, args.stepSeconds).map(function(i) {
            return {
                start: start.clone().addSeconds(-i),
                stop: start.clone().addSeconds(-i+args.stepSeconds)
            };
          }).reverse();
        },
        _getTweetsFromRange: function(r) {
          return this.filter(function(t) {
            var d = new XDate(t.get('timestamp'));
            return (r.start <= d) && (d <= r.stop);
          });
        },
        aggregate: function(args) {
          return this._getSecondRange(args).map(_.bind(function(range) {
            return this._getTweetsFromRange(range);
          }, this));
        },
        model: Term,
        add: function(models, options) {
          options = options || {};
          var newOptions = _.extend({ silent: true }, options);
          var res = Backbone.Collection.prototype.add.call(this, models, newOptions)

          res = _.isArray(res) ? res : [res];
          this.memory && this.memory.add(res);

          if (!options.silent) {
            var model;
            for (i = 0, l = res.length; i < l; i++) {
              (model = res[i]).trigger('add', model, this, options);
            }
          }
        },
        comparator: function(m) {
            return m.getAccuracy();
        }
    });
});
