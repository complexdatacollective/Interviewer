/* exported IOInterface */

var IOInterface = function IOInterface() {

  // this could be a remote host
  var provider = 'http://localhost:3000';
  var collection = 'netCanvas';
  var id;

  var interface = {};

  interface.init = function() {
    return true;
  };

  interface.save = function(userData) {

    $.ajax({
      url: provider+'/collections/users',
      type: 'POST',
      contentType: 'application/json',
      dataType: 'json',
      data: JSON.stringify(userData),
      success: function(data) {
        console.log(data);
        id = data[0]._id;
      },
      error: function (data) {
        console.log(data);
      }
    });
    $.each(userData, function(key,value) {
      localStorage.setObject(key, value);  
    });
    


  };

  interface.update = function(userData,id) {
    $.ajax({
      url: provider+'/collections/'+collection+'/'+id,
      type: 'PUT',
      contentType: 'application/json',
      dataType: 'json',
      data: JSON.stringify(userData),
      success: function(data) {
        console.log(data);
      },
      error: function (data) {
        console.log(data);
      }
    });

  };

  interface.load = function(id) {

    $.getJSON(
      provider+'/collections/'+collection+'/'+id,
      function(data) {
        console.log(data);
      }
    );

  };

  return interface;
};