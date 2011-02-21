dojo.provide('routeFinder._base');

dojo.require('routeFinder.topics');
dojo.require('dojo.parser');
dojo.require('dijit.InlineEditBox');
dojo.require('dijit.form.Button');
dojo.require('dojo.dnd.Source');

// for the widget declaration
dojo.require('dijit._Widget');
dojo.require('dijit._Templated');

// for the string substitution
dojo.require('dojo.string');

// for the jsonp calls
dojo.require('dojo.io.script');

// to support the animation chaining of the flash method
dojo.require('dojo.fx');

dojo.require('dijit.form.TextBox');


dojo.mixin(routeFinder, {
  init: function(){
  
    dojo.subscribe(routeFinder.topics.onAddressAdded, function(address){
      var widget = new routeFinder.Location({
        unformattedAddress: address,
        title: address
      });
      
      // make the widget draggable
      dojo.addClass(widget.domNode, 'dojoDndItem');
      
      widget.placeAt('locationHolder', 'last');
    });
    
    
    // create some drag and drop behavior
    
    if (typeof(startLocationHolderWidget) != 'undefined') {
      startLocationHolderWidget.checkAcceptance = dojo.hitch(startLocationHolderWidget, function(source, nodes){
        var nodeCount = this.getAllNodes().length;
        return 0 === nodeCount;
      });
      
      dojo.connect(startLocationHolderWidget, 'onDndDrop', function(source, nodes, copy, target){
        routeFinder._togglePrompt(startLocationHolderWidget);
      });
      dojo.connect(locationHolderWidget, 'onDndDrop', function(){
        routeFinder._togglePrompt(startLocationHolderWidget);
      });
      
      
      var addressesNode = dojo.byId('addressInput');
      
      dojo.connect(dojo.byId('addressInput'), 'onkeyup', function(evt){
        if (evt.keyCode === dojo.keys.ENTER) {
          routeFinder.locate(addressesNode);
        }
      });
      
      dojo.connect(dojo.byId('addAddressButton'), 'click', function(evt){
        routeFinder.locate(addressesNode);
      });
    }
  },
  
  _togglePrompt: function(source){
    if (0 === source.getAllNodes().length) {
      dojo.style('startLocationPromptMessage', 'display', 'inline');
    }
    else {
      dojo.style('startLocationPromptMessage', 'display', 'none');
    }
    
  },
  
  locate: function locateAddresses(textAreaNode){
    lines = textAreaNode.value.split(/\r\n|\r|\n/);
    dojo.forEach(lines, function(singleLine){
      if (0 !== singleLine.length) {
        dojo.publish(routeFinder.topics.onAddressAdded, [singleLine]);
      }
    });
    textAreaNode.value = '';
    textAreaNode.focus();
  }
  
});

dojo.addOnLoad(routeFinder, 'init');




/*
dojo.declare('routeFinder.Router', null, {
  startLocation: undefined,
  
  constructor: function(args){
    dojo.safeMixin(this, args);
  },
  
  _orderLocationsInternal: function(remainingLocations, orderedLocations, originalCallback){
    if (0 === remainingLocations.length) {
      originalCallback({
        orderedLocations: orderedLocations
      });
      return;
    }
    
    var deferreds = [];
    
    dojo.forEach(remainingLocations, function(location){
      var jsonpDeferred = dojo.io.script.get({
        url: "http://dev.virtualearth.net/REST/v1/Routes",
        content: {
          "wayPoint.1": dojo.string.substitute('${lat},${lon}', orderedLocations[orderedLocations.length - 1]),
          "wayPoint.2": dojo.string.substitute('${lat},${lon}', location),
          distanceUnit: "mi",
          key: "AizyhoiLfqzBSi2yjcHvfb9VZNX4Jc0iN44rx36ux0gt5km-1oPxFdtZL0gZl7dv",
          jsonso: location.widgetId
        },
        jsonp: "jsonp"
      });
      deferreds.push(jsonpDeferred);
    });
    
    var deferredList = new dojo.DeferredList(deferreds);
    
    var minDistanceLocation;
    
    deferredList.addCallback(dojo.hitch(this, function(resultArray){
      dojo.forEach(resultArray, function(item, index, array){
        var succeeded = item[0];
        var response = item[1];
        var distance = response.resourceSets[0].resources[0].travelDistance;
        
        if (!minDistanceLocation || distance < minDistanceLocation.distance) {
          minDistanceLocation = remainingLocations[index];
        }
      });
      
      remainingLocations.splice(remainingLocations.indexOf(minDistanceLocation), 1);
      orderedLocations.push(minDistanceLocation);
      
      if (0 < remainingLocations.length) {
        this._orderLocationsInternal(remainingLocations, orderedLocations, originalCallback);
      }
      else {
        originalCallback({
          orderedLocations: orderedLocations
        });
      }
      
    }));
    
  },
  
  orderLocations: function(locations,  startLocation,  callback){
    if (locations instanceof dijit.WidgetSet) {
      locations = locations.toArray();
    }
    
    startLocation.distance = 0;
    locations.splice(locations.indexOf(startingNode), 1);
    
    var orderedLocations = [startingNode];
    
    this._orderLocationsInternal(locations, orderedLocations, callback);
    
    
    // for each location, get the distance between last element of orderedLocations.
    // When all the calls have returned, then call getNextOrderedLocation
    // push the return onto orderedLocations, repeat
  
    // once the locations array is empty, reorder the locations, and call the service to get the map,
  
    // var counter = locations.length;
    // for (var i = 0; i < counter; i++) {
    //   var nextLocation = getNextOrderedLocation(locations);
    //   locations.splice(locations.indexOf(nextLocation), 1);
    //   orderedLocations.push(nextLocation);
  
    // reset the locations' distances:
  }
});
*/



