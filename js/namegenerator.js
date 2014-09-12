/* global network, extend */
/* exported Namegenerator */
var Namegenerator = function Namegenerator(options) {

  //global vars
  var namegenerator = {};
  namegenerator.options = {
    targetEl: $('.container'),
    variables: [],
    heading: "This is a default heading",
    subheading: "And this is a default subheading"
  };

  extend(namegenerator.options, options);

  var nodeBoxOpen = false;

  var keyPressHandler = function(e) {
    if (e.keyCode === 13 && !$(e.target).is("td")) {
      if (!nodeBoxOpen) {
        namegenerator.openNodeBox();
      } else {
        $("#step2").submit();
      }
    }

    if (e.keyCode === 27) {
      namegenerator.closeNodeBox();
    }

    // Prevent accidental backspace navigation
    if (e.keyCode === 8 && !$(e.target).is("input, textarea, div")) {
      e.preventDefault();
    }

  };

  var inputKeypressHandler = function(e) {
    if (e.keyCode !== 13) {
      var lname = $('#fname_t0').val()+" "+$('#lname_t0').val().charAt(0);
      if ($('#lname_t0').val().length > 0 ) {
        lname +=".";
      }
      $('#nname_t0').val(lname);  
    }
  };

  var cancelBtnHandler = function() {
    namegenerator.closeNodeBox();
  };

  var newNodeHandler = function(e) {
    console.log(e);

  };

  namegenerator.openNodeBox = function() {
    $("#ngForm input:text").first().focus();
    $('.newNodeBox').transition({scale:1,opacity:1},300);
    nodeBoxOpen = true;
    $('#firstName').focus();
  };

  namegenerator.closeNodeBox = function() {
    $('.newNodeBox').transition({scale:0.1,opacity:0},500);
    nodeBoxOpen = false;
    $('#ngForm').trigger("reset");    
  };

  namegenerator.init = function() {

    // create elements
    var title = $('<h1 class="text-center"></h1>').html(namegenerator.options.heading);
    namegenerator.options.targetEl.append(title);
    var subtitle = $('<p class="lead"></p>').html(namegenerator.options.subheading);
    namegenerator.options.targetEl.append(subtitle);


    // create node box
    var newNodeBox = $('<div class="newNodeBox"><form role="form" id="ngForm" class="form"></form></div>');
    namegenerator.options.targetEl.append(newNodeBox);
    $.each(namegenerator.options.variables, function(index, value) {
      if(value.private !== true) {
        var formItem = $('<div class="col-sm-12"><div class="form-group"><label class="sr-only" for="'+value.variable+'">'+value.label+'</label><input type="text" class="form-control '+value.variable+'" id="'+value.variable+'" placeholder="'+value.label+'" required></div></div>');
        $('.newNodeBox .form').append(formItem);        
      }

    });

    var buttons = $('<div class="col-sm-12"><button type="submit" class="btn btn-primary submit-1">Add</button>&nbsp;<span class="btn btn-danger cancel">Cancel</span></div>');
    $('.newNodeBox .form').append(buttons);
   

    // create table
    var table = $('<table class="table nameList"><thead><tr></tr></thead><tbody></tbody></table>');
    namegenerator.options.targetEl.append(table);

    // table header
    $.each(namegenerator.options.variables, function(index,value) {
      if(value.private!== true) {
        var thItem = $('<th></th>').html(value.label);
        $('.nameList thead tr').append(thItem);        
      }

    });

    // Event listeners
    $(document).on("keyup", keyPressHandler);
    window.addEventListener('nodeAdded', newNodeHandler, false);
    $('.cancel').on('click', cancelBtnHandler);
    $("#fname_t0, #lname_t0").keyup(inputKeypressHandler);

    $('#ngForm').submit(function() {
      event.preventDefault();

      var newEdgeProperties = {};
      var newNodeProperties = {};

      $.each(namegenerator.options.variables, function(index,value) {

        if(value.target === 'edge') {
          if (value.private === true) {
            newEdgeProperties[value.variable] =  value.value;
          } else {
            newEdgeProperties[value.variable] =  $('#'+value.variable).val();  
          }
          
        } else if (value.target === 'node') {
          if (value.private === true) {
            newNodeProperties[value.variable] =  value.value;
          } else {
            newNodeProperties[value.variable] =  $('#'+value.variable).val();  
          }
        }
      });

      console.log('new');
      console.log(newEdgeProperties);
      console.log(newNodeProperties);

      var nodeProperties = {
         
      };
      extend(nodeProperties, newNodeProperties);
      var newNode = network.addNode(nodeProperties);

      var edgeProperties = {
        type: 'Dyad',
        from: network.getNodes({type_t0:'Ego'})[0].id,
        to: newNode,
        k_or_p_t0: 'known',
      };

      extend(edgeProperties,newEdgeProperties);
      network.addEdge(edgeProperties);
      namegenerator.addToList();
      $('#ngForm').trigger("reset");
      namegenerator.closeNodeBox();

    });

  };

  namegenerator.addToList = function(properties) {
    // var index = $(this).data('index');
    var newRow;

    var newItem;
    
    if (!properties) {
          newRow = $('<tr></tr>');
          $('.nameList tbody').append(newRow);
      $.each(namegenerator.options.variables, function(index,value) {
        if(value.private !== true) {
          newItem = $('<td contenteditable class="'+value.variable+'">'+$('#'+value.variable).val()+'</td>');
          $('.nameList tbody tr').last().append(newItem);
        }
      });
    } else {
      newRow = $('<tr data-index="'+properties.edgeID+'"></tr>');
      $('.nameList tbody').append(newRow);
      $.each(namegenerator.options.variables, function(index,value) {
        if(value.private !== true) {
          newItem = $('<td contenteditable class="'+value.variable+'">'+properties[value.variable]+'</td>');
          $('.nameList tbody tr').last().append(newItem);
        }
      });     
    }

  };

  namegenerator.update = function() {

  };

  // namegenerator.remove = function() {

  // };


  namegenerator.init();

  return namegenerator;
};