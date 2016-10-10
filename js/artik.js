var Artik = {
  artikCloud : 'https://api.artik.cloud/v1.1/',
  access_token : '',
  getUsersSelf : function (callback) {
    var xhr = new XMLHttpRequest();
    xhr.onload = function(){
      callback(this.responseText);
    };
    xhr.open('GET', this.artikCloud + 'users/self');
    xhr.setRequestHeader('Authorization', 'Bearer ' + this.access_token);
    xhr.send();
  },
  getUsersDevices : function(userId, callback) {
    var xhr = new XMLHttpRequest();
    xhr.onload = function(){
      callback(this.responseText);
    };
    xhr.open('GET', this.artikCloud + 'users/' + userId + '/devices');
    xhr.setRequestHeader('Authorization', 'Bearer ' + this.access_token);
    xhr.send();
  },
  getDeviceToken : function(deviceId, callback) {
    var xhr = new XMLHttpRequest();
    xhr.onload = function(){
      if (xhr.status === 200){
      callback(deviceId, this.responseText);
    } else if (xhr.status === 404) {
      callback(deviceId, false);
      };
    };
    xhr.open('GET', this.artikCloud + 'devices/' + deviceId + '/tokens');
    xhr.setRequestHeader('Authorization', 'Bearer ' + this.access_token);
    xhr.send();
  },
  getDeviceSnap : function(deviceId, deviceToken, callback){
    var xhr = new XMLHttpRequest();
    xhr.onload = function(){
      callback(deviceId, this.responseText);
    };
    xhr.open('GET', this.artikCloud + 'messages/snapshot?sdid=' + deviceId);
    xhr.setRequestHeader('Authorization', 'Bearer ' + deviceToken);
    xhr.send();
  },
  getDeviceManifest : function(deviceTypeId, name, callback){
    var xhr = new XMLHttpRequest();
    xhr.onload = function(){
      callback(deviceTypeId, name, this.responseText);
    };
    xhr.open('GET', this.artikCloud + 'devicetypes/' + deviceTypeId + '/manifests/latest/properties');
    xhr.setRequestHeader('Authorization', 'Bearer ' + this.access_token);
    xhr.send();
  },
  generateDeviceToken : function(deviceId, callback){
    var xhr = new XMLHttpRequest();
    xhr.onload = function(){
      callback(deviceId, this.responseText);
    };
    xhr.open('PUT', this.artikCloud + 'devices/' + deviceId + '/tokens');
    xhr.setRequestHeader('Authorization', 'Bearer ' + this.access_token);
    xhr.send();
  },
  createDevice : function(uid, dtid, name, callback){
    var data = {
      "uid": uid,
      "dtid": dtid,
      "name": name,
    };
    $.ajax({
      type: 'POST',
      url: this.artikCloud + 'devices',
      headers : {
        "Authorization" : "Bearer " + this.access_token,
        "content-type": "application/json"
      },
      data: JSON.stringify(data),
      success : function(response){
        callback(response);
      },
      error: function(XMLHttpRequest, text, error){
        console.log(error);
      }
    });
  },
  getDevice : function(did, callback){
    var xhr = new XMLHttpRequest();
    xhr.onload = function(){
      callback(did, this.responseText);
    };
    xhr.open('GET', this.artikCloud + 'devices/' + did);
    xhr.setRequestHeader('Authorization', 'Bearer ' + this.access_token);
    xhr.send();
  }
}
