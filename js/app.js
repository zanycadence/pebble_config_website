window.onload = function(){
  var pebbleDtid = 'dt4fa6172d62884752b20e6baac3eb9e78';
  var options = {};
  var uid = '';

  //function to get parameters from url passed from ARTIK
  var queryparams = function(){
      var param_obj = {};
      var query_string = {};
      var query = window.location.hash.substring(1);
      var vars = query.split('&');
      for (var i = 0; i< vars.length; i++){
        var pair = vars[i].split('=');
        param_obj[pair[0]] = pair[1];
      }
      return param_obj;
  };

  options = queryparams();
  Artik.access_token = options.access_token;

  var userId = '';
  var devices = {};

  var devicesProcessed = 0;

  var pebbleConfig = {
    items: [],
    pebble: {}
  };

  function allDevicesGot(){
    //after retrieving all of the devices and their tokens/fields
    //check to see if a pebble geolocate device exists - if not create and
    //update device list.

    var numDevices = Object.keys(devices).length;
    var deviceCount = 0;

    var pebbleExists = false;

    $.each(devices, function(key, value){
      if (value.dtid === pebbleDtid){
        pebbleExists = true;
        pebbleConfig.pebble = {"id": value.did, "token" : value.token};
      }
      deviceCount++;
      if (deviceCount === numDevices){
        if (pebbleExists){
          buildDeviceList(devices);

        } else {
          Artik.createDevice(uid, pebbleDtid, "pebble", generateToken);
        }
      }
    });
  }

  function generateToken(response) {
    deviceId = response.data.id;
    Artik.generateDeviceToken(deviceId, function(deviceId, responseText){
      pebbleInfo = JSON.parse(responseText).data;
      pebbleConfig.pebble = {"id": pebbleInfo.did, "token" : pebbleInfo.accessToken};
      Artik.getDevice(pebbleInfo.did, function(did, responseText){
          var pebbleData = JSON.parse(responseText).data;
          devices[pebbleData.id] = {token: pebbleInfo.accessToken, name: pebbleData.name, dtid: pebbleData.dtid, did: pebbleData.id};
          Artik.getDeviceManifest(pebbleData.dtid, pebbleData.name, function(dtid, sdid, responseText){
            var fields = JSON.parse(responseText).data.properties.fields;
            devices[pebbleData.id].fields = fields;
            allDevicesGot();
          });
      });
    });
  }



//function to grab list of all devices, their ids, names, tokens. if token is not generated, generate it
  function getAllDevices(){

    Artik.getUsersSelf(function(responseText){
        var userInformation = JSON.parse(responseText);
        uid = userInformation.data.id;
        Artik.getUsersDevices(userInformation.data.id, function(responseText){
          var userDevices = JSON.parse(responseText).data.devices;
          for (let device of userDevices){
            Artik.getDeviceToken(device.id, function(deviceId, responseText){
              if (responseText === false){
                var token ='';
              } else {
                var token = JSON.parse(responseText).data.accessToken;
              }
              if(token != '')
                {
                  devices[device.id] = {token: token, name: device.name, dtid: device.dtid, did: device.id};
                  Artik.getDeviceManifest(device.dtid, device.name, function(dtid, sdid, responseText){
                    var fields = JSON.parse(responseText).data.properties.fields;
                    devices[device.id].fields = fields;
                    devicesProcessed++;
                    if (devicesProcessed == userDevices.length)
                      allDevicesGot();
                  });
                } else {
                  Artik.generateDeviceToken(deviceId, function(deviceId, responseText){
                    var token = JSON.parse(responseText).data.accessToken;
                    devices[device.id] = {token: token, name: device.name, dtid: device.dtid, did: device.id};
                    Artik.getDeviceManifest(device.dtid, device.name, function(dtid, sdid, responseText){
                      var fields = JSON.parse(responseText).data.properties.fields;
                      devices[device.id].fields = fields;
                      devicesProcessed++;
                      if (devicesProcessed == userDevices.length)
                        allDevicesGot();
                    });
                  });
                }
            });
            }

        });
    });
}

function buildDeviceList(deviceList){
  $('#interstitial').hide();
  $('#device_config').show();
  $('#form_submit').show();

  $.each(deviceList, function(id, value){
    $.each(value, function(val, attr){
      if (val === 'name') {
      $('#device_config').append($('<div>').attr("id", id).addClass("col-sm-12"));
      $('#device_config').find("#"+id).append($('<h4>').text(attr));
    } else if (val === 'fields') {
      $('#'+id).append($('<div>').addClass("checkbox col-sm-6 col-sm-offset-1"));
      $.each(attr, function(name, desc){
        $('#' + id).find('div').append($('<label>').attr("id", name).addClass("checkbox").addClass('input-lg'));
        $('#' + id).find('div').find('#' + name).append($('<input>').attr("id", id).attr("value", name).attr('type', 'checkbox').text(name));
        $('#' + id).find('div').find('#' + name).append(name);

      });
    }

    });
  });
}

$('#submit_button').click(function(){

  var checkboxArr = $('input:checkbox');
  var checkboxCount = 0;
  checkboxArr.each(function(){
    checkboxCount++;
    var checkbox = $(this);
    if (checkbox.is(":checked")){
      pebbleConfig.items.push({"id": checkbox.attr("id"), "token": devices[checkbox.attr("id")].token, "field":checkbox.attr("value")});
    }
    if (checkboxCount === checkboxArr.length){
      document.location = 'pebblejs://close#' + encodeURIComponent(JSON.stringify(pebbleConfig));
    }
  });
});

  getAllDevices();


}
