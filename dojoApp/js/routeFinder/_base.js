dojo.provide('routeFinder._base');

dojo.require('routeFinder.topics');
dojo.require('routeFinder.Location');
dojo.require('dojo.parser');
dojo.require('dijit.InlineEditBox');
dojo.require('dijit.form.Button');

dojo.mixin(routeFinder, {
  init: function(){
    dojo.subscribe(routeFinder.topics.onAddressAdded, function(address){
      var locationHolder = dojo.byId('locationHolder');
      new routeFinder.LocationWidget({
        //id: 'id_' + address.split(' ')[0],
        unformattedAddress: address,
        title: address
      }).placeAt(locationHolder, 'last');
 
 		// sync so the dnd will work
      //locationHolderWidget.sync();
      
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
