define(['tweetView', 'text!templates/tweetFrameView.html'], function(TweetView, tpl) {
  return Backbone.Marionette.View.extend({
    template: _.template(tpl),
    ui: {
      "children": ".children"
    },
    initialize: function() {
      this.views = [];
      this.listenTo(this.options.queue, 'add', this.newElementAdded, this);
    },
    render: function() {
      this.$el.html(this.template());
      this.bindUIElements();

      var opts = this.options
      var poppedElements = _.range(0, opts['numChilds']).map(function() {
        return opts.queue.pop();
      });
      _.compact(poppedElements).forEach(_.bind(function(m) {
        var el = this.addNewChild();
      }, this));
      return this;
    },
    addNewChild: function() {
      var tv = new TweetView({ doesExpire: true });
      this.listenTo(tv, 'hasExpired', this.tryReplacingExpiredViews, this);
      this.views.push(tv);
      this.addChildToDOM(tv);
      return tv;
    },
    tryReplacingExpiredViews: function() {
      this.getExpiredViews().forEach(_.bind(function(e) {
        var poppedTerm = this.options.queue.pop();
        if (poppedTerm) {
          e.swap(poppedTerm);
        }
      }, this));
    },
    newElementAdded: function() {
      if (this.views.length < this.options.numChilds) {
        var el = this.addNewChild();
        el.swap(this.options.queue.pop());
      } else {
        this.tryReplacingExpiredViews();
      }
    },
    getExpiredViews: function() {
      return _.filter(this.views, function(v) {
        return v.hasExpired();
      });
    },
    addChildToDOM: function(child) {
      if (this.ui.children) {
        this.ui.children.append(child.render().el);
      }
    }
  });
});

