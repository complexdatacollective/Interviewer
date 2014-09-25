/* global network, extend, notify */
/* exported Namegenerator */
var Namegenerator = function Namegenerator(options) {

  //global vars
  var namegenerator = {};
  namegenerator.options = {
  	nodeType:'Alter',
  	edgeType:'Dyad',
  	targetEl: $('.container'),
  	variables: [],
  	heading: "This is a default heading",
  	subheading: "And this is a default subheading"
  };

  extend(namegenerator.options, options);

  var nodeBoxOpen = false;
  var editing = false;

  var alterCount = network.getNodes({type_t0: 'Alter'}).length;

  var roles = {
  	'Friend': ['Best Friend','Friend','Ex-friend','Other type'],
  	'Family / Relative': ['Parent/Guardian','Brother/Sister','Grandparent','Other Family','Chosen Family'],
  	'Romantic / Sexual Partner': ['Boyfriend/Girlfriend','Ex-Boyfriend/Ex-Girlfriend','Booty Call/Fuck Buddy/Hook Up','One Night Stand','Other type of Partner'],
  	'Acquaintaince / Associate': ['Coworker-Colleague','Classmate','Roommate','Friend of a Friend','Neighbor','Other'],
  	'Other Support / Source of Advice': ['Teacher/Professor','Counselor/Therapist','Community Agency Staff','Religious Leader','Mentor','Coach','Other'],
  	'Drug Use': ['Someone you use drugs with','Someone you buy drugs from'],
  	'Other': []
  };

  	var keyPressHandler = function(e) {
	  	if (e.keyCode === 13) {
	  		e.preventDefault();
	  		if (nodeBoxOpen === false) {
	  			namegenerator.openNodeBox();
	  		} else if (nodeBoxOpen === true) {
	  			$(".submit-1").click();
	  		}
	  	}

	  	if (e.keyCode === 27) {
	  		namegenerator.closeNodeBox();
	  	}

		// Prevent accidental backspace navigation
		if (e.keyCode === 8 && !$(e.target).is("input, textarea")) {
			e.preventDefault();
		}

	};

  var roleClickHandler = function() {

    if ($(this).data('selected') === true) {
      $(this).data('selected', false);
      $(this).removeClass('selected');

    } else {
      $(this).data('selected', true);
      $(this).addClass('selected');
    }
    
  };

	var inputKeypressHandler = function(e) {
		if (nodeBoxOpen === true) {
			if (e.keyCode !== 13) {
				if($('#fname_t0').val().length > 0 && $('#fname_t0').val().length > 0) {

					var lname = $('#fname_t0').val()+" "+$('#lname_t0').val().charAt(0);
					if ($('#lname_t0').val().length > 0 ) {
						lname +=".";
					}

					var updateName = function() {
						$('#nname_t0').val(lname);
					};

					setTimeout(updateName,0);  

				}
			}      
		}

	};

	var stageChangeHandler = function() {
		namegenerator.destroy();
	};

	var cardClickHandler = function() {
		var index = $(this).data('index');
		var edge = network.getEdges({from:network.getNodes({type_t0:'Ego'})[0].id, to: index, type:'Dyad'})[0];

		// Set the value of editing to the node id of the current person
		editing = index;

		// Update role count
		var roleCount = network.getEdges({from:network.getNodes({type_t0:'Ego'})[0].id, to: editing, type:'Role'}).length;
		$('.relationship-button').html(roleCount+' roles selected.');		

		// Populate the form with this nodes data.
		$.each(namegenerator.options.variables, function(index, value) {
			if(value.private === false) {
				if (value.type === 'relationship') {
					$("select[name='"+value.variable+"']").val(edge[value.variable]);
				// } else if (value.type === 'subrelationship') {
				// 	$("select[name='reltype_sub_t0']").children().remove();
				// 	$("select[name='reltype_sub_t0']").append('<option value="">Choose a specific relationship</option>');

				// 	$.each(roles[$("select[name='reltype_main_t0']").val()], function(index,value) {
				// 		$("select[name='reltype_sub_t0']").append('<option value="'+value+'">'+value+'</option>');
				// 	});

				// 	$("select[name='"+value.variable+"']").val(edge[value.variable]);
				// 	$("select[name='reltype_sub_t0']").prop( "disabled", false );

				// 	if(edge.reltype_oth_t0 !== undefined && edge.reltype_oth_t0 !== "") {
				// 		$('.reltype_oth_t0').val(edge.reltype_oth_t0);
				// 		$('.reltype_oth_t0').show();
				// 	}
				}else {
					$('#'+value.variable).val(edge[value.variable]);    
				}
				$('.delete-button').show();
				namegenerator.openNodeBox();
			}

		});

	};

	var cancelBtnHandler = function() {
		$('.delete-button').hide();
		namegenerator.closeNodeBox();
	};

	var selectChangeHandler = function() {
		if ($("select[name='reltype_main_t0']").val() === "") {
			$("select[name='reltype_sub_t0']").prop( "disabled", true);
			return false;
		} 
		$("select[name='reltype_sub_t0']").prop( "disabled", false );
		$("select[name='reltype_sub_t0']").children().remove();
		$("select[name='reltype_sub_t0']").append('<option value="">Choose a specific relationship</option>');
		$.each(roles[$("select[name='reltype_main_t0']").val()], function(index,value) {
			$("select[name='reltype_sub_t0']").append('<option value="'+value+'">'+value+'</option>');
		});
	
	};

	var selectSubChangeHandler = function() {
		if ($("select[name='reltype_sub_t0']").val() === "Other") {
			$('.reltype_oth_t0').show();
		} else {
			$('.reltype_oth_t0').val("");
			$('.reltype_oth_t0').hide();
		}
	};

	var submitFormHandler = function(e) {
			e.preventDefault();

      		var newEdgeProperties = {};
	      	var newNodeProperties = {};
	      	$('.delete-button').hide();
			$.each(namegenerator.options.variables, function(index,value) {

				if(value.target === 'edge') {
					if (value.private === true) {
						newEdgeProperties[value.variable] =  value.value;
					} else {
						if(value.type === 'relationship' || value.type === 'subrelationship') {
							newEdgeProperties[value.variable] =  $("select[name='"+value.variable+"']").val(); 
						} else {
							newEdgeProperties[value.variable] =  $('#'+value.variable).val();    
						} 
					}

				} else if (value.target === 'node') {
					if (value.private === true) {
						newNodeProperties[value.variable] =  value.value;
					} else {
						if(value.type === 'relationship' || value.type === 'subrelationship') {
							newNodeProperties[value.variable] =  $("select[name='"+value.variable+"']").val(); 
						} else {
							newNodeProperties[value.variable] =  $('#'+value.variable).val();    
						}

					}
				}
			});

			var nodeProperties = {};
			var edgeProperties = {};

			if (editing === false) {
				// We are submitting a new node
				extend(nodeProperties, newNodeProperties);
				var newNode = network.addNode(nodeProperties);
				var id;

				$.each(namegenerator.options.edgeTypes, function(index,value) {
					var currentEdgeProperties = {};
					var currentEdge = value;
					$.each(namegenerator.options.variables, function(index, value) {
						if (value.target === 'edge' && value.edge === currentEdge) {
							if (value.private === true) {
								currentEdgeProperties[value.variable] =  value.value;
							} else {
								if(value.type === 'relationship' || value.type === 'subrelationship') {
									currentEdgeProperties[value.variable] =  $("select[name='"+value.variable+"']").val(); 
								} else {
									currentEdgeProperties[value.variable] =  $('#'+value.variable).val();    
								} 
							}
						}
					});
					edgeProperties = {
						from: network.getNodes({type_t0:'Ego'})[0].id,
						to: newNode,
						type:currentEdge
					};

					extend(edgeProperties,currentEdgeProperties);
					id = network.addEdge(edgeProperties);
				});

				// Add role edges

				// Iterate through selected items and create a new role edge for each.
				$.each($('.relationship.selected'), function() {		
			      	edgeProperties = {
			            type: 'Role',
			            from:network.getNodes({type_t0:'Ego'})[0].id, 
			            to: newNode,
			            reltype_main_t0: $(this).parent('.relationship-type').data('main-relationship'),
			            reltype_sub_t0: $(this).data('sub-relationship')
			      	};
				    network.addEdge(edgeProperties);
				});


				// Main edge
				var edge = network.getEdges({to:newNode, type:"Dyad"})[0];
				namegenerator.addToList(edge);
				alterCount++;
				$('.alter-count-box').html(alterCount);


			} else {
				// We are updating a node

				var color = function() {
					var el = $('div[data-index='+editing+']');
					el.stop().transition({background:'rgba(51, 160, 117, 1)'}, 400, 'ease');
					setTimeout(function(){
						el.stop().transition({ background:'rgba(238,238,238, 1)'}, 800, 'ease');
					}, 1500);
				};	
				
				var nodeID = editing;
				// var nodeID = network.getEdge(editing).to;
				$.each(namegenerator.options.edgeTypes, function(index,value) {
					var currentEdge = value;
					var currentEdgeProperties = {};
					$.each(namegenerator.options.variables, function(index, value) {
						if (value.target === 'edge' && value.edge === currentEdge) {
							if (value.private === true) {
								currentEdgeProperties[value.variable] =  value.value;
							} else {
								if(value.type === 'relationship' || value.type === 'subrelationship') {
									currentEdgeProperties[value.variable] =  $("select[name='"+value.variable+"']").val(); 
								} else {
									currentEdgeProperties[value.variable] =  $('#'+value.variable).val();    
								} 
							}
						}
					});

					var edges = network.getEdges({from:network.getNodes({type_t0:'Ego'})[0].id,to:editing,type:value});
					$.each(edges, function(index,value) {
						network.updateEdge(value.id,currentEdgeProperties, color);		
					});
				});
				
				network.updateNode(nodeID, newNodeProperties);
				var properties = extend(newEdgeProperties,newNodeProperties);

				// update relationship roles

				// Remove existing edges
				network.removeEdges(network.getEdges({type:"Role", from: network.getNodes({type_t0:'Ego'})[0].id, to: editing}));


				$.each($('.relationship.selected'), function() {		
			      	edgeProperties = {
			            type: 'Role',
			            from:network.getNodes({type_t0:'Ego'})[0].id, 
			            to: editing,
			            reltype_main_t0: $(this).parent('.relationship-type').data('main-relationship'),
			            reltype_sub_t0: $(this).data('sub-relationship')
			      	};
				    network.addEdge(edgeProperties);
				});

				$('div[data-index='+editing+']').html("");
				$('div[data-index='+editing+']').append('<h4>'+properties.nname_t0+'</h4>');
				var list = $('<ul></ul>');

				$.each(namegenerator.options.variables, function(index, value) {
					if (value.private === false && properties[value.variable] !== undefined && properties[value.variable] !== "") {
						list.append('<li class="'+properties[value.variable]+'"><strong>'+value.label+'</strong>: '+properties[value.variable]+'</li>');      
					}

				});

				$('div[data-index='+editing+']').append(list);
			// var edge = network.getEdge(editing);;
			
			editing = false;

			} // end if editing

		  
		  namegenerator.closeNodeBox();

		
	};

	namegenerator.openNodeBox = function() {
		// $('.newNodeBox').show();
		$('.content').addClass('blurry');
		$('.newNodeBox').transition({scale:1,opacity:1},300);
		$("#ngForm input:text").first().focus();
		nodeBoxOpen = true;
	};

	namegenerator.closeNodeBox = function() {
		$('.content').removeClass('blurry');
		$('.newNodeBox').transition({scale:0.1,opacity:0},500);
		setTimeout(function() {

		});
		nodeBoxOpen = false;
		$('#ngForm').trigger("reset"); 
		$('.reltype_oth_t0').hide();
		editing = false;
		$('.relationship-button').html('Set Relationship Roles');
		$('.relationship').removeClass('selected');       
	};

	namegenerator.destroy = function() {
		notify('Destroying namegenerator.',0);
		// Event listeners
		$(document).off("keydown", keyPressHandler);
		$('.cancel').off('click', cancelBtnHandler);
		$("#fname_t0, #lname_t0").off('keyup', inputKeypressHandler);
		$(document).off("click", ".card", cardClickHandler);
		$('.add-button').off('click', namegenerator.openNodeBox);
		$('.delete-button').off('click', namegenerator.removeFromList);
		$("select[name='reltype_main_t0']").off('change', selectChangeHandler);
		$("select[name='reltype_sub_t0']").off('change', selectSubChangeHandler);    
		$('#ngForm').off('submit', submitFormHandler);
		window.removeEventListener('changeStageStart', stageChangeHandler, false);
		$('.newNodeBox').remove();
		$('.relationship-types-container').remove();
		$(document).off("click", '.relationship', roleClickHandler);
		$(document).off("click", '.relationship-button', namegenerator.toggleRelationshipBox);
		$(document).off("click", '.relationship-close-button', namegenerator.toggleRelationshipBox);
	};

	namegenerator.init = function() {
		// create elements
		var title = $('<h1 class="text-center"></h1>').html(namegenerator.options.heading);
		namegenerator.options.targetEl.append(title);
		var subtitle = $('<p class="lead text-center"></p>').html(namegenerator.options.subheading);
		namegenerator.options.targetEl.append(subtitle);
		var button = $('<span class="hi-icon hi-icon-user add-button">Add</span>');
		namegenerator.options.targetEl.append(button);
		var alterCountBox = $('<div class="alter-count-box"></div>');
		namegenerator.options.targetEl.append(alterCountBox);






		// create node box
		var newNodeBox = $('<div class="newNodeBox"><form role="form" id="ngForm" class="form"><div class="col-sm-6 left"><h2 style="margin-top:0">Adding a Node</h2><ul><li>Try to be as accurate as you can, but don\'t worry if you aren\'t sure.</li><li>We are interested in your perceptions, so there are no right answers!</li><li>You can use the tab key to quickly move between the fields.</li><li>You can use the enter key to submit the form.</li></ul><button type="button" class="btn btn-danger btn-block delete-button">Delete this Node</button></div><div class="col-sm-6 right"></div></form></div>');
		// namegenerator.options.targetEl.append(newNodeBox);
		$('body').append(newNodeBox);
		$.each(namegenerator.options.variables, function(index, value) {
			if(value.private !== true) {

				var formItem;

				switch(value.type) {
					case 'text':
					formItem = $('<div class="form-group '+value.variable+'"><label class="sr-only" for="'+value.variable+'">'+value.label+'</label><input type="text" class="form-control '+value.variable+'" id="'+value.variable+'" placeholder="'+value.label+'"></div></div>');
					break;

					case 'number':
					formItem = $('<div class="form-group '+value.variable+'"><label class="sr-only" for="'+value.variable+'">'+value.label+'</label><input type="number" class="form-control '+value.variable+'" id="'+value.variable+'" placeholder="'+value.label+'"></div></div>');
					break; 

					case 'relationship':
					formItem = $('<input type="hidden" class="form-control '+value.variable+'" id="'+value.variable+'" placeholder="'+value.label+'">');

					break;

					case 'subrelationship':
					formItem = $('<input type="hidden" class="form-control '+value.variable+'" id="'+value.variable+'" placeholder="'+value.label+'">');
					break;

				}
				$('.newNodeBox .form .right').append(formItem);
				if (value.required === true) {
					if (value.type === 'relationship') {
						$("select[name='"+value.variable+"']").prop("required", true);            
					} else {
						$('#'+value.variable).prop("required", true);            
					}

				}

			}

		});
	
	$('.newNodeBox .form .right').append('<div class="form-group"><button type="button" class="btn btn-primary btn-block relationship-button">Set Relationship Roles</div></div>');
	$("select[name='reltype_sub_t0']").prop( "disabled", true );
	var buttons = $('<div class="col-sm-6 text-center"><button type="submit" class="btn btn-success btn-block submit-1">Add</button></div><div class="col-sm-6"><span class="btn btn-danger btn-block cancel">Cancel</span></div>');
	$('.newNodeBox .form .right').append(buttons);
	$('.reltype_oth_t0').hide();


		// relationship types
		alterCountBox = $('<div class="relationship-types-container"><h1>Select this Individual\'s Relationship Roles from the List Below</h1><p class="lead">Tap each role to select as many as you think apply, then click the close button (above) to continue.</p><button class="btn btn-primary relationship-close-button">Close</button></div>');
		$('.newNodeBox').after(alterCountBox);
		var counter = 0;
		$.each(roles, function(index) {
			$('.relationship-types-container').append('<div class="relationship-type rel-'+counter+' c'+counter+'" data-main-relationship="'+counter+'"><h1>'+index+'</h1></div>');
			$.each(roles[index], function(relIndex, relValue) {
				$('.rel-'+counter).append('<div class="relationship" data-sub-relationship="'+relValue+'">'+relValue+'</div>');
			});
		counter++;
		});




		var nodeContainer = $('<div class="node-container"></div>');
		namegenerator.options.targetEl.append(nodeContainer);


		// create namelist container
		var nameList = $('<div class="table nameList"></div>');
		$('.node-container').append(nameList);

		// Event listeners
		window.addEventListener('changeStageStart', stageChangeHandler, false);
		$(document).on("keydown", keyPressHandler);
		$('.cancel').on('click', cancelBtnHandler);
		$('.add-button').on('click', namegenerator.openNodeBox);
		$('.delete-button').on('click', namegenerator.removeFromList);
		$("#fname_t0, #lname_t0").on('keyup', inputKeypressHandler);
		$(document).on("click", ".card", cardClickHandler);
		$("select[name='reltype_main_t0']").on('change', selectChangeHandler);
		$("select[name='reltype_sub_t0']").on('change', selectSubChangeHandler);    
		$('#ngForm').on('submit', submitFormHandler);
		$(document).on("click", '.relationship', roleClickHandler);
		$(document).on("click", '.relationship-button', namegenerator.toggleRelationshipBox);
		$(document).on("click", '.relationship-close-button', namegenerator.toggleRelationshipBox);

		// Set node count box
		$('.alter-count-box').html(alterCount);
	};

	namegenerator.toggleRelationshipBox = function() {
		if ($('.relationship-types-container').hasClass('open')) {
			//closing 

			if(editing) {
				var roleCount = $('.relationship.selected').length;
				$('.relationship-button').html(roleCount+' roles selected.');			
			}

			$.each($('.relationship-type'), function(index, value) {
				setTimeout(function() {
					$(value).transition({opacity:0,top:'-1000px'},400);
					$.each($(value).children('.relationship'), function(index, childvalue) {
						setTimeout(function() {
							$(childvalue).transition({opacity:0,top:'-200px'}, 200);
						}, 200+(index*100));
					});
				}, index*100);

			});

			setTimeout(function() {
				$('.newNodeBox').show();
				$('.relationship-types-container').removeClass('open');
			}, 1000);

		} else {
			// opening			
			if(editing) {
				var roleEdges = network.getEdges({from:network.getNodes({type_t0:'Ego'})[0].id, to: editing, type:'Role'});
				$.each(roleEdges, function(index, value) {
 					$('.rel-'+value.reltype_main_t0).find('div[data-sub-relationship="'+value.reltype_sub_t0+'"]').addClass('selected').data('selected', true);
				});				
			}


			$('.relationship-types-container').addClass('open');
			$('.relationship').css({position:'relative', opacity:0,top:'-200px'});
			$('.relationship-type').css({position:'relative', opacity:0,top:'-1000px'});
			$.each($('.relationship-type'), function(index, value) {
				setTimeout(function() {
					$(value).transition({opacity:1,top:'0px'},600);
					$.each($(value).children('.relationship'), function(index, childvalue) {
						setTimeout(function() {
							$(childvalue).transition({opacity:1,top:0}, 400);
						}, 300+(index*100));
					});
				}, index*100);

			});
			// $('.content').removeClass('blurry');
			$('.newNodeBox').hide();
		}
	};

	namegenerator.addToList = function(properties) {
		// var index = $(this).data('index');
		var card;
		
		card = $('<div class="card" data-index="'+properties.to+'"><h4>'+properties.nname_t0+'</h4></div>');
		var list = $('<ul></ul>');
		$.each(namegenerator.options.variables, function(index, value) {
			if (value.private === false && properties[value.variable] !== undefined && properties[value.variable] !== "") {
				list.append('<li class="'+properties[value.variable]+'"><strong>'+value.label+'</strong>: '+properties[value.variable]+'</li>');      
			}

		});
		card.append(list);
		$('.nameList').append(card);

	};

	namegenerator.removeFromList = function() {
		$('.delete-button').hide();
		
		var nodeID = editing;
		// var nodeID = network.getEdge(editing).to;

		// network.updateNode(nodeID, newNodeProperties);
		network.removeNode(nodeID);

		$('div[data-index='+editing+']').remove();
	
		editing = false;
		namegenerator.closeNodeBox();
	};


	  // namegenerator.remove = function() {

	  // };


	  namegenerator.init();

	  return namegenerator;
};