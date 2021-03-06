define(['marionette'], function() {
    return Backbone.Model.extend({
        constructor: function(args) {
            this.vent = args.vent;
            this.host = args.host;
            this.vent.on('streamer:sendMessage', this.sendMessage, this);
            this._ws = this._getWebSocket(this.host);
            this._ws.then(_.bind(function(ws) {
                this.vent.trigger('streamer:ready');
                ws.onmessage = _.bind(this.onMessageReceived, this);
            }, this));
        },
        onMessageReceived: function(msg) {
            var data = JSON.parse(msg.data);
            this.vent.trigger('streamer:newMessage:' + data.message, data);
        },
        sendMessage: function(msg) {
            this._ws.then(function(ws) {
                ws.send(JSON.stringify(msg));
            });
        },
        _getWebSocket: function(host) {
            var def = $.Deferred();
            var ws = new WebSocket(host);
            ws.onopen = function(event) {
                def.resolve(ws);
            }
            return def.promise();
        }
    });
});

