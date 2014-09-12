/* global notify, session */
/* exported IOInterface */


/*

This module should provide a transparent interface for any part of the application to store data.

It functions as a key/value store.

  - The requesting module first requests a data slot, or recieves a pointer to an existing one. If a data slot 
    with the specified key already exists, the pointer is returned, else a new pointer is generated along with 
    the slot.
  - The ioInterface instance decides when the key store should be synced with the external data store vs. the
    local backup (localStorage API), but this syncing can be triggered manually.
  - Only keys that have been modified should be synced to avoid large data transfer.

*/

var IOInterface = function IOInterface() {

  // this could be a remote host
  var externalStoreRestUrl = 'http://localhost:3000';
  var collection = 'netCanvas'; // Hard coded name of this collection.
  var id;
  // var data = {};

  var interface = {};

  interface.init = function(existingID) {
    notify('ioInterface initialising.', 1);
    // If we don't have an existing ID, create a blank entry in mongodb and return its ID
    if (!existingID) {
      $.ajax({
        url: externalStoreRestUrl+'/collections/'+collection+'/',
        type: 'POST',
        contentType: 'application/json',
        dataType: 'json',
        data: '',
        success: function(data) {
          id = data[0]._id;
          notify("id from last transaction: "+id, 3);
          session.registerData('session');
          localStorage.setObject('activeSession', id);
          session.addData('session', {sessionID: id});
          return id;
        },
        error: function () {
          return false;
        }
      });
    } else {
      // If we do have an existing ID, set it for future quries, and return.
      id = existingID;
      return id;
    }

  };


  interface.save = function(userData) {
    delete session.userData._id;
    notify('IOInterface being asked to synchronise with data store:',2);
    notify('Data to be saved: ', 1);
    notify(userData, 1);
    $.each(userData, function(key,value) {
      localStorage.setObject(key, value);  
    });

    $.ajax({
      url: externalStoreRestUrl+'/collections/'+collection+'/'+id,
      type: 'PUT',
      contentType: 'application/json',
      dataType: 'json',
      data: JSON.stringify(userData),
      success: function(data) {
        notify('Result of saving was: ', 2);
        notify(data, 2);
      }, 
      error: function(data) {
        notify('Saving failed! '+data, 100000);
      }
    });
    
  };

  interface.update = function(key, userData,id) {
    $.ajax({
      url: externalStoreRestUrl+'/collections/'+collection+'/'+id,
      type: 'PUT',
      contentType: 'application/json',
      dataType: 'json',
      data: JSON.stringify(userData),
      success: function() {
        return true;
      },
      error: function () {
        return false;
      }
    });

  };

  interface.load = function(callback) {
    notify("ioInterface being asked to load data.", 2);
    $.getJSON(
      externalStoreRestUrl+'/collections/'+collection+'/'+id,
      function(data) {
        delete data._id;
        notify("ioInterface returning data.",2);
        notify(data, 1);
        callback(data);
      }
    );

  };

  return interface;
};