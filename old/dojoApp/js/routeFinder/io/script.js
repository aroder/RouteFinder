dojo.provide('routefinder.io.script');

// overrides some default behavior for the Bing Maps REST API, which does not support periods in the callback parameter name
// namespaces its generated callback parameter name

dojo.require('dojo.io.script');

function myBingHandler(object, id){
  routefinder.io.script.bingDeferreds[id].ioArgs.json = object;
}

dojo.mixin(routefinder.io.script, {
  bingDeferreds: [],
  bingRE: /^http[s]?:\/\/dev\.virtualearth\.net\/REST/,
  oldMSD: dojo.io.script._makeScriptDeferred,
  oldRemove: dojo.io.script.remove
});


dojo.io.script._makeScriptDeferred = function(args){
  var jsonp = args.callbackParamName || args.jsonp;
  
  if (!routefinder.io.script.bingRE.test(args.url) && !jsonp) {
    routefinder.io.script.oldMSD.call(this, args);
  }
  
  var dfd = dojo._ioSetArgs(args, this._deferredCancel, this._deferredOk, this._deferredError);
  
  var ioArgs = dfd.ioArgs;
  ioArgs.id = dojo._scopeName + "IoScript" + (this._counter++);
  ioArgs.canDelete = false;
  
  //Special setup for jsonp case
  ioArgs.jsonp = jsonp;
  if (ioArgs.jsonp) {
    //Add the jsonp parameter.
    ioArgs.query = ioArgs.query || "";
    if (ioArgs.query.length > 0) {
      ioArgs.query += "&";
    }
    ioArgs.query += ioArgs.jsonp + "=myBingHandler&jsonso=" + ioArgs.id;
    
    ioArgs.frameDoc = args.frameDoc;
    
    //Setup the Deferred to have the jsonp callback.
    ioArgs.canDelete = true;
    dfd._jsonpCallback = this._jsonpCallback;
    routefinder.io.script.bingDeferreds[ioArgs.id] = this["jsonp_" + ioArgs.id] = dfd;
  }
  return dfd; // dojo.Deferred
};


dojo.io.script.remove = function(id, frameDocument){
  routefinder.io.script.oldRemove.call(this, id, frameDocument);
  //Remove the deferred object on my.bingDeferreds, if it exists.
  if (routefinder.io.script.bingDeferreds[id]) {
    delete routefinder.io.script.bingDeferreds[id];
  }
};


