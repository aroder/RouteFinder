dojo.provide('routeFinder.routing');


dojo.declare('routeFinder.Router', null, {
  startLocation: undefined,
  
  constructor: function(/*Object*/args){
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
  
  orderLocations: function(/*Array*/locations, /*Object*/ startLocation, /*Function*/ callback){
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


