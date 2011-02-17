dojo.provide('routeFinder._base');

dojo.require('routeFinder.topics');
dojo.require('routeFinder.Location');
dojo.require('dojo.parser');
dojo.require('dijit.InlineEditBox');
dojo.require('dijit.form.Button');

dojo.mixin(routeFinder, {
  init: function(){
    dojo.subscribe(routeFinder.topics.onAddressAdded, function(address){
      new routeFinder.LocationWidget({
        //id: 'id_' + address.split(' ')[0],
        unformattedAddress: address,
        title: address
      }).placeAt('locationHolder', 'last');
    });
    
    // create some drag and drop behavior
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
