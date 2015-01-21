/* global network, extend, session, notify */
/* exported ListSelect */
var ListSelect = function ListSelect(options) {

  //global vars
  var listSelect = {};
  listSelect.options = {
    targetEl: $('.container'),
    variables: [],
    heading: "This is a default heading",
    subheading: "And this is a default subheading"
  };

  extend(listSelect.options, options);

  var itemClickHandler = function() {
    var properties = {};
    var nodeid = $(this).data('nodeid');

    if ($(this).data('selected') === true) {
      $(this).data('selected', false);
      $(this).css({'border':'2px solid #eee','background':'#eee'});

      // remove values
      $.each(listSelect.options.variables, function(index,value) {
        properties[value.value] = undefined;
      });
      network.updateNode(network.getNodes({type_t0:'Ego'})[0].id, properties);

    } else {
      $(this).data('selected', true);
      $(this).css({'border':'2px solid red','background':'#E8C0C0'});

      // update values

      $.each(listSelect.options.variables, function(index,value) {
        if (value.value === nodeid) {
          properties[value.value] = 1;
        } else {
        //   console.log(nodeid);
        }

      });

      network.updateNode(network.getNodes({type_t0:'Ego'})[0].id, properties);

    }

  };

  var stageChangeHandler = function() {
    listSelect.destroy();
  };

  var processSubmitHandler = function() {
    session.nextStage();

  };

  listSelect.destroy = function() {
    // Event Listeners
    notify("Destroying listSelect.",0);
    $(document).off('click', '.item', itemClickHandler);
    $(document).off('click', '.continue', processSubmitHandler);
    window.removeEventListener('changeStageStart', stageChangeHandler, false);

  };

  listSelect.init = function() {
    // Add header and subheader
    listSelect.options.targetEl.append('<h1 class="text-center">'+listSelect.options.heading+'</h1>');
    listSelect.options.targetEl.append('<p class="lead text-center">'+listSelect.options.subheading+'</p>');
    listSelect.options.targetEl.append('<div class="form-group list-container"></div>');

    $.each(listSelect.options.variables, function(index,value) {
      var el = $('<div class="item" data-nodeid="'+value.value+'"><h3>'+value.label+'</h3></div>');
      var properties = {
        type_t0: "Ego"
      };

      properties[value.value] = 1;
      if (network.getNodes(properties).length>0) {
        el.data('selected', true);
        el.css({'border':'2px solid red','background':'#E8C0C0'});
      }
      $('.list-container').append(el);
    });


    // Event Listeners
    $(document).on('click', '.item', itemClickHandler);
    $(document).on('click', '.continue', processSubmitHandler);
    window.addEventListener('changeStageStart', stageChangeHandler, false);


  };

  listSelect.init();

  return listSelect;
};
