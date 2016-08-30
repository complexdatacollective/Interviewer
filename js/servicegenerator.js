/* global $, window, Odometer, document, note  */
/* exported ServiceGenerator */
module.exports = function ServiceGenerator() {
    'use strict';
    //global vars
    var serviceGenerator = {};
    serviceGenerator.options = {
        nodeType:'HIVService',
        edgeType:'HIVService',
        targetEl: $('.container'),
        variables: [],
        heading: 'This is a default heading',
        subheading: 'And this is a default subheading',
        panels: [],
    };

    var nodeBoxOpen = false;
    var editing = false;
    var newNodePanel;
    var venueCounter;

    var venueCount = window.network.getEdges({type: 'HIVService', visited: true}).length;

    var keyPressHandler = function(e) {
        if (e.keyCode === 13) {
            e.preventDefault();
            if (nodeBoxOpen === false) {
                serviceGenerator.openNodeBox();
            } else if (nodeBoxOpen === true) {
                $('.submit-1').click();
            }
        }

        if (e.keyCode === 27) {
            serviceGenerator.closeNodeBox();
        }

        // Prevent accidental backspace navigation
        if (e.keyCode === 8 && !$(e.target).is('input, textarea')) {
            e.preventDefault();
        }

    };

    var stageChangeHandler = function() {
        serviceGenerator.destroy();
    };

    var cardClickHandler = function() {
        // Handles what happens when a card is clicked

        // Get the ID of the node corresponding to this card, stored in the data-index property.
        var index = $(this).data('index');

        // Get the dyad edge for this node
        var edge = window.network.getEdges({from:window.network.getEgo().id, to: index, type:'HIVService'})[0];
        var node = window.network.getNode(edge.to);

        // Set the value of editing to the node id of the current person
        editing = index;

        // Populate the form with this nodes data.
        $.each(serviceGenerator.options.variables, function(index, value) {
            if(value.private === false) {
                if (value.type === 'dropdown') {
                    $('.selectpicker').selectpicker('val', edge[value.variable]);
                } else if (value.type === 'scale') {
                    $('input:radio[name="'+value.variable+'"][value="'+edge[value.variable]+'"]').prop('checked', true).trigger('change');
                } else {
                    if (value.target === 'node') {
                        $('#'+value.variable).val(node[value.variable]);
                    } else {
                        $('#'+value.variable).val(edge[value.variable]);
                    }

                }

                $('.delete-button').show();

                if (edge.elicited_previously === true) {
                    $('input#age_p_t0').prop( 'disabled', true);
                } else {
                    $('input#age_p_t0').prop( 'disabled', false);
                }
                serviceGenerator.openNodeBox();
            }

        });

    };

    var cancelBtnHandler = function() {
        $('.delete-button').hide();
        serviceGenerator.closeNodeBox();
    };

    var submitFormHandler = function(e) {
        note.info('submitFormHandler()');

        e.preventDefault();

        var data = $(this).serializeArray();
          var cleanData = {};
          for (var i = 0; i < data.length; i++) {

            // To handle checkboxes, we check if the key already exists first. If it
            // does, we append new values to an array. This keeps compatibility with
            // single form fields, but might need revising.

            // Handle checkbox values
            if (data[i].value === 'on') { data[i].value = 1; }

            // This code takes the serialised output and puts it in the structured required to store within noded/edges.
            if (typeof cleanData[data[i].name] !== 'undefined' && typeof cleanData[data[i].name] !== 'object') {
              // if it isn't an object, its a string. Create an empty array and store by itself.
              cleanData[data[i].name] = [cleanData[data[i].name]];
              cleanData[data[i].name].push(data[i].value);
            } else if (typeof cleanData[data[i].name] !== 'undefined' && typeof cleanData[data[i].name] === 'object'){
              // Its already an object, so append our new item
              cleanData[data[i].name].push(data[i].value);
            } else {
              // This is for regular text fields. Simple store the key value pair.
              cleanData[data[i].name] = data[i].value;
            }

          }


        var newEdgeProperties = {};
        var newNodeProperties = {};
        $('.delete-button').hide();
        $.each(serviceGenerator.options.variables, function(index,value) {

            if(value.target === 'edge') {
                if (value.private === true) {
                    newEdgeProperties[value.variable] = value.value;
                } else {
                    newEdgeProperties[value.variable] = cleanData[value.variable];
                }

            } else if (value.target === 'node') {
                if (value.private === true) {
                    newNodeProperties[value.variable] = value.value;
                } else {
                    newNodeProperties[value.variable] = cleanData[value.variable];
                }
            }
        });

        if (editing === false) {
            note.info('// We are submitting a new node');
            var newNode = window.network.addNode(newNodeProperties);

            var edgeProperties = {
                from: window.network.getEgo().id,
                to: newNode,
                type:serviceGenerator.options.edgeTypes[0]
            };

            window.tools.extend(edgeProperties,newEdgeProperties);
            window.network.addEdge(edgeProperties);
            serviceGenerator.addToList(edgeProperties);
            venueCount++;
            venueCounter.update(venueCount);

        } else {
            note.info('// We are updating a node');

            var color = function() {
                var el = $('div[data-index='+editing+']');
                var current = el.css('background-color');
                el.stop().transition({background:'#1ECD97'}, 400, 'ease');
                setTimeout(function(){
                    el.stop().transition({ background: current}, 800, 'ease');
                }, 700);
            };

            var nodeID = editing;

            var edges = window.network.getEdges({from:window.network.getEgo().id,to:nodeID,type:serviceGenerator.options.edgeTypes[0]});
            $.each(edges, function(index,value) {
                window.network.updateEdge(value.id,newEdgeProperties, color);
            });

            window.network.updateNode(nodeID, newNodeProperties);

            // update relationship roles

            $('div[data-index='+editing+']').html('');
            var node = window.network.getNode(nodeID);
            $('div[data-index='+editing+']').append('<h4>'+node.name+'</h4>');

            venueCount = window.network.getEdges({type: 'HIVService', visited: true}).length;
            venueCounter.update(venueCount);
            editing = false;

        }

        serviceGenerator.closeNodeBox();

    };

    serviceGenerator.openNodeBox = function() {
        $('.newVenueBox').height($('.newVenueBox').height());
        $('.newVenueBox').addClass('open');
        $('.black-overlay').css({'display':'block'});
        setTimeout(function() {
            $('.black-overlay').addClass('show');
        }, 50);
        setTimeout(function() {
            $('#ngForm input:text').first().focus();
        }, 1000);

        nodeBoxOpen = true;
    };

    serviceGenerator.closeNodeBox = function() {
        $('input#age_p_t0').prop( 'disabled', false);
        $('.black-overlay').removeClass('show');
        $('.newVenueBox').removeClass('open');
        setTimeout(function() { // for some reason this doenst work without an empty setTimeout
            $('.black-overlay').css({'display':'none'});
        }, 300);
        nodeBoxOpen = false;
        $('#ngForm').trigger('reset');
        editing = false;
    };

    serviceGenerator.destroy = function() {
        note.debug('Destroying serviceGenerator.');
        // Event listeners
        $(window.document).off('keydown', keyPressHandler);
        $(window.document).off('click', '.cancel', cancelBtnHandler);
        $(window.document).off('click', '.add-button', serviceGenerator.openNodeBox);
        $(window.document).off('click', '.delete-button', serviceGenerator.removeFromList);
        $(window.document).off('click', '.inner-card', cardClickHandler);
        $(window.document).off('submit', '#ngForm', submitFormHandler);
        window.removeEventListener('changeStageStart', stageChangeHandler, false);
        $('.newVenueBox').remove();

    };

    serviceGenerator.init = function(options) {
        window.tools.extend(serviceGenerator.options, options);
        // $.extend(true, serviceGenerator.options, options);
        // create elements
        var button = $('<span class="fa fa-4x fa-map-pin add-button"></span>');
        serviceGenerator.options.targetEl.append(button);
        var venueCountBox = $('<div class="alter-count-box"></div>');
        serviceGenerator.options.targetEl.append(venueCountBox);

        // create node box
        var newVenueBox = $('<div class="newVenueBox overlay"><form role="form" id="ngForm" class="form"><div class="col-sm-12"><h2 style="margin-top:0;margin-bottom:30px;"><span class="fa fa-map-pin"></span> Adding a Service Provider</h2></div><div class="col-sm-12 fields"></div></form></div>');

        // serviceGenerator.options.targetEl.append(newVenueBox);
        $('body').append(newVenueBox);
        $.each(serviceGenerator.options.variables, function(index, value) {
            if(value.private !== true) {

                var formItem;

                switch(value.type) {
                    case 'text':
                    formItem = $('<div class="form-group '+value.variable+'"><label class="sr-only" for="'+value.variable+'">'+value.label+'</label><input type="text" class="form-control '+value.variable+'" id="'+value.variable+'" name="'+value.variable+'" placeholder="'+value.label+'"></div></div>');
                    break;

                    case 'autocomplete':
                    formItem = $('<div class="form-group ui-widget '+value.variable+'"><label class="sr-only" for="'+value.variable+'">'+value.label+'</label><input type="text" class="form-control '+value.variable+'" id="'+value.variable+'" name="'+value.variable+'" placeholder="'+value.label+'"></div></div>');
                    break;

                    case 'dropdown':

                    formItem = $('<div class="form-group '+value.variable+'" style="position:relative; z-index:9"><label for="'+value.variable+'">'+value.label+'</label><br /></div>');
                    var select = $('<select class="selectpicker" name="'+value.variable+'" />');
                    $.each(value.options, function(optionIndex, optionValue) {
                        $('<option/>').val(optionValue.value).text(optionValue.label).appendTo(select);
                    });

                    select.appendTo(formItem);

                    break;

                    case 'scale':
                    formItem = $('<div class="form-group '+value.variable+'"><label for="'+value.variable+'">'+value.label+'</label><br /></div>');

                    $.each(value.options, function(optionIndex, optionValue) {
                        $('<div class="btn-group big-check" data-toggle="buttons"><label class="btn"><input type="radio" name="'+value.variable+'" value="'+optionValue.value+'"><i class="fa fa-circle-o fa-3x"></i><i class="fa fa-check-circle-o fa-3x"></i> <span class="check-number">'+optionValue.label+'</span></label></div>').appendTo(formItem);
                    });

                    break;

                }

                $('.newVenueBox .form .fields').append(formItem);
                if (value.required === true) {
                    $('#'+value.variable).prop('required', true);
                }

                $('.selectpicker').selectpicker({
                    style: 'btn-info',
                    size: 4
                });

                $('#name').autocomplete({
                    /*jshint -W109 */
                    source: [
                        "About My Health",
                        "Access - Anixter",
                        "Access - Ashland Family Health Center",
                        "Access - Auburn-Gresham Family Health Center",
                        "Access - Booker Family Health Center",
                        "Access - Brandon Family Health Center",
                        "Access - Cabrini Family Health Center",
                        "Access - Centro Medico San Rafael",
                        "Access - Centro Medico",
                        "Access - Doctors Medical Center",
                        "Access - Evanston-Rogers Park Family Health Center",
                        "Access - Gary Comer Youth Center",
                        "Access - Grand Boulevard",
                        "Access - Humboldt Park Family Health Center",
                        "Access - Illinois Eye Institute",
                        "Access - Kedzie Family Health Center",
                        "Access - La Villita",
                        "Access - Madison Family Health Center",
                        "Access - Perspectives Charter School - Calumet",
                        "Access - Pilsen Family Health Center",
                        "Access - Plaza Family Health Center",
                        "Access - Saint Francis",
                        "Access - Sinai",
                        "Access - Southwest Family Health Center",
                        "Access - Warren Family",
                        "Access - Westside Family Health Center",
                        "Advocate Bethany Hospital",
                        "Advocate Illinois Masonic Medical Center",
                        "Advocate Trinity Hospital",
                        "Advocate-Sykes Health Center",
                        "AIDS Foundation of Chicago",
                        "Alexian Brothers Housing and Health Alliance Bonaventure House",
                        "Alivio Medical Center - John Spry Community School",
                        "Alivio Medical Center - Jose Clemente Orozco Academy",
                        "Alivio Medical Center - Little Village Lawndale High School Campus",
                        "Alivio Medical Center - Morgan",
                        "Alivio Medical Center - Western",
                        "Alternatives, Inc.",
                        "American Indian Health Service",
                        "Asian Health Coalition",
                        "Asian Human Services Family Health Center",
                        "Asian Human Services",
                        "Austin Health Center",
                        "Austin People's Action Center",
                        "Austin STI Clinic (CDPH)",
                        "Beloved Community Family Wellness Center",
                        "Broadway Youth Center (BYC)",
                        "Brothers Health Collective - 59th St.",
                        "Brothers Health Collective - 63rd St.",
                        "Brothers Health Collective - Archer Ave.",
                        "CALOR - Anixter Center",
                        "Caritas Central Intake",
                        "Center on Halsted (COH)",
                        "Cermak Health Services",
                        "Chicago Black Gay Men's Caucus (CBGMC)",
                        "Chicago Family Health Center - Chicago Lawn",
                        "Chicago Family Health Center - East Side",
                        "Chicago Family Health Center - Pullman",
                        "Chicago Family Health Center - Roseland",
                        "Chicago Family Health Center - South Chicago",
                        "Chicago House and Social Services Agency",
                        "Chicago Lakeshore Hospital",
                        "Chicago Read Mental Health Center",
                        "Chicago Recovery Alliance",
                        "Chicago Womens AIDS Project - North Office",
                        "Chicago Womens AIDS Project - South Office",
                        "Chicago Women's Health Center (CWHC)",
                        "Childrens Place Association",
                        "Christian Community Health Center",
                        "Circle Family Healthcare Network - Parkside",
                        "Circle Family Healthcare Network - Division",
                        "Columbia College Film Row Cinema Building",
                        "Columbia College Health Center",
                        "Community Supportive Living Systems",
                        "CommunityHealth - Englewood",
                        "CommunityHealth - West Town",
                        "Cook County - Children’s Advocacy Center",
                        "Cook County - Englewood Health Center",
                        "Cook County - Fantus Health Center",
                        "Cook County - John Sengstacke Health Center",
                        "Cook County - Logan Square Health Center",
                        "Cook County - Near South Health Center",
                        "Cottage View Health Center",
                        "DePaul University Office of Health Promotion and Wellness",
                        "Dr. Jorge Prieto Family Health Center",
                        "El Rincon Community Clinic - Rafael Paloma Rios Center",
                        "Englewood HIV/STI Clinic (CDPH)",
                        "Erie - Division Street Health Center",
                        "Erie - Foster Avenue Health Center",
                        "Erie - Helping Hands Health Center",
                        "Erie - Humbolt Park Health Center",
                        "Erie - Johnson School",
                        "Erie - L Ward",
                        "Erie - Teen Health Center",
                        "Erie - West Town Health Center",
                        "Esperanza Health Center - California",
                        "Esperanza Health Center - Little Village",
                        "Esperanza Health Center - Marquette",
                        "FOLA Community Action Services",
                        "Franciscan Outreach Association",
                        "Friend Family Health Center - Ashland",
                        "Friend Family Health Center - Beethoven",
                        "Friend Family Health Center - Cottage Grove",
                        "Friend Family Health Center - Pulaski",
                        "Friend Family Health Center - Western",
                        "Gift House",
                        "Harold Washington College Wellness Center",
                        "Harry S Truman College Wellness Center",
                        "Hartgrove Hospital",
                        "Haymarket Center",
                        "Heartland - Health Care for the Homeless",
                        "Heartland - Human Care Services",
                        "Heartland - Vital Bridges Center on Chronic Care",
                        "Heartland Health Center - Hibbard Elementary School",
                        "Heartland Health Center - Lincoln Square",
                        "Heartland Health Center - Rogers Park",
                        "Heartland Health Center - Senn High School",
                        "Heartland Health Center - Wilson",
                        "Heartland Health Outreach - Refugee Health",
                        "Holy Cross Hospital",
                        "Howard Area Community Center",
                        "Howard Brown - 63rd Street",
                        "Howard Brown - Broadway",
                        "Howard Brown - Clark",
                        "Howard Brown - Halsted (Aris Health)",
                        "Howard Brown - Sheridan",
                        "IIT Wellness Center - Downtown Campus",
                        "IIT Wellness Center - Main Campus",
                        "IMAN Health Clinic",
                        "Interfaith House",
                        "Jackson Park Hospital",
                        "Jesse Brown Medical Center",
                        "Kennedy-King College Wellness Center",
                        "Kindred Hospital - Chicago Central",
                        "Kindred Hospital - Chicago Lakeshore",
                        "Kindred Hospital - Chicago North",
                        "Komed Holman Health Center",
                        "La Rabida Children's Hospital",
                        "Lakeview STI Clinic (CDPH)",
                        "Lawndale Christian Health Center - Archer Avenue",
                        "Lawndale Christian Health Center - Farragut Academy",
                        "Lawndale Christian Health Center - Homan Square",
                        "Lawndale Christian Health Center - Ogden Campus",
                        "Le Penseur Youth and Family Services",
                        "Loretto Hospital",
                        "Loyola Wellness Center Lakeshore Campus",
                        "Loyola Wellness Center Water Tower Campus",
                        "Lurie Center for Gender, Sexuality, & HIV Prevention",
                        "Lurie Pediatric and Adolescent HIV Program",
                        "Making A Daily Effort (MADE)",
                        "Malcolm X College Wellness Center",
                        "Mercy Hospital and Medical Center",
                        "Methodist Hospital of Chicago",
                        "Midwest Asian Health Association",
                        "Moody Bible Institute Health Service",
                        "Mount Sinai Hospital & Medical Center",
                        "Near North - Denny Community Health Center",
                        "Near North - Kostner Health Center",
                        "Near North - Louise Landau Health Center",
                        "Night Ministry",
                        "North Park University Health Services Office",
                        "Northeastern Illinois University Student Health Services (NEIU)",
                        "Northstar Medical Center",
                        "Northwestern Memorial Hospital",
                        "Northwestern University - Feinberg School of Medicine",
                        "Norwegian American Hospital",
                        "Olive-Harvey College Wellness Center",
                        "Our Lady of Resurrection Medical Center",
                        "PCC Austin Family Health Center",
                        "PCC Salud Family Health Center",
                        "PCC West Town Family Health Center",
                        "People Organizing Progress (POP) at The Village",
                        "Phoenix Medical Associates",
                        "Pilsen Wellness Center",
                        "Planned Parenthood - Austin",
                        "Planned Parenthood - Englewood",
                        "Planned Parenthood - Loop",
                        "Planned Parenthood - Near North",
                        "Planned Parenthood - Rogers Park",
                        "Planned Parenthood - Roseland",
                        "Planned Parenthood - Wicker Park",
                        "Port Ministries Free Clinic",
                        "PRCC - Generation L/L-Act Prevention Program",
                        "PRCC - Integrated PASEO - Garfield Center",
                        "PRCC - Integrated PASEO - UIC",
                        "PRCC - Vida/SIDA",
                        "PRCC - Women for PASEO",
                        "PrimeCare Ames",
                        "PrimeCare Fullerton",
                        "PrimeCare Northwest",
                        "PrimeCare Portage Park",
                        "PrimeCare West Town",
                        "Project Vida - 26th St.",
                        "Project Vida - Kedvale Ave.",
                        "Prologue",
                        "Provident Hospital of Cook County",
                        "Reavis School-Based Health Center",
                        "Rehabilitation Institute of Chicago",
                        "Resurrection Medical Center",
                        "Richard J. Daley College Wellness Center",
                        "Roseland Community Hospital",
                        "Roseland STI Clinic (CDPH)",
                        "Rush University Medical Center",
                        "Ruth M Rothstein CORE Center",
                        "Sacred Heart Hospital",
                        "Saint Xavier University Health Center (SXU)",
                        "School of the Art Institute of Chicago Health Services (SAIC)",
                        "Schwab Rehabilitation Hospital",
                        "Shriners Hospital for Children",
                        "South Shore Hospital HIV/AIDS Clinic",
                        "South Shore Hospital",
                        "South Side Help Center",
                        "Southeast Side Community Health Center (Aunt Martha's)",
                        "St. Anthony Hospital",
                        "St. Bernard Hospital",
                        "St. Joseph Hospital",
                        "St. Mary and Elizabeth Medical Center",
                        "Stroger Hospital",
                        "Swedish Covenant Hospital",
                        "Taskforce Prevention & Community Services",
                        "TCA Health, Inc",
                        "Test Positive Aware Network (TPAN)",
                        "Thorek Hospital and Medical Center",
                        "TransLife Center (TLC)",
                        "UIC COIP/UCCN - New Age Services (NAS)",
                        "UIC COIP/UCCN - Northside",
                        "UIC COIP/UCCN - Northwestside",
                        "UIC COIP/UCCN - Southeastside",
                        "UIC COIP/UCCN - Southside",
                        "UIC COIP/UCCN - Westside",
                        "UIC Family Medicine Center at University Village",
                        "UIC Mile Square Health Center - Back of the Yards",
                        "UIC Mile Square Health Center - Main Location",
                        "UIC Mile Square Health Center - North Clinic",
                        "UIC Mile Square Health Center - South Clinic - New City",
                        "UIC Mile Square Health Center - South Shore",
                        "Universal Family Connection",
                        "University of Chicago - Medical Center",
                        "University of Chicago Care2Prevent (C2P) - Hospital Location",
                        "University of Chicago Care2Prevent (C2P) - Youth Center",
                        "University of Chicago Center for HIV Elimination (CCHE)",
                        "University of Chicago Office of LGBTQ Student Life",
                        "University of Chicago Student Health Service",
                        "University of Illinois at Chicago (UIC) - College of Medicine",
                        "University of Illinois at Chicago (UIC) - Outpatient Care Center",
                        "University of Illinois at Chicago Student Wellness Center (UIC)",
                        "University of Illinois Hospital (U of I)",
                        "Uptown Community Health Center",
                        "Uptown HIV Clinic (CDPH)",
                        "Weiss Memorial Hospital",
                        "West Town STI Clinic (CDPH)",
                        "Wilbur Wright College Wellness Center",
                        "Winfield Moody Health Center",
                        "Woodlawn Health Center"
                    ]
                    /*jshint +W109 */
                });

            }

        });

        var buttons = $('<div class="row"><div class="col-sm-4"><button type="submit" class="btn btn-success btn-block submit-1"><span class="glyphicon glyphicon-plus-sign"></span> Add</button></div><div class="col-sm-4"><button type="button" class="btn btn-danger btn-block delete-button"><span class="glyphicon glyphicon-trash"></span> Delete</button></div><div class="col-sm-4"><span class="btn btn-warning btn-block cancel">Cancel</span></div></div>');
        $('.newVenueBox .form .fields').append(buttons);

        newNodePanel = $('.newVenueBox').html();

        var nodeContainer = $('<div class="question-container"></div><div class="node-container-bottom-bg"></div>');
        serviceGenerator.options.targetEl.append(nodeContainer);

        var title = $('<h1 class="text-center"></h1>').html(serviceGenerator.options.heading);
        $('.question-container').append(title);
        var subtitle = $('<p class="lead text-center"></p>').html(serviceGenerator.options.subheading);
        $('.question-container').append(subtitle);

        // create namelist container
        var nameList = $('<div class="node-container nameList"></div>');
        serviceGenerator.options.targetEl.append(nameList);

        // Event listeners
        window.addEventListener('changeStageStart', stageChangeHandler, false);
        $(window.document).on('keydown', keyPressHandler);
        $(window.document).on('click', '.cancel', cancelBtnHandler);
        $(window.document).on('click', '.add-button', serviceGenerator.openNodeBox);
        $(window.document).on('click', '.delete-button', serviceGenerator.removeFromList);
        $(window.document).on('click', '.inner-card', cardClickHandler);
        $(window.document).on('submit', '#ngForm', submitFormHandler);

        // Set node count box
        var el = document.querySelector('.alter-count-box');

        venueCounter = new Odometer({
            el: el,
            value: venueCount,
            format: 'dd',
            theme: 'default'
        });

        // add existing nodes
        var edges = window.network.getEdges({type: 'HIVService', from: window.network.getEgo().id, sg_t0:serviceGenerator.options.variables[0].value});
        $.each(edges, function(index,value) {

            serviceGenerator.addToList(value);
        });

        // Handle side panels
        if (serviceGenerator.options.panels.length > 0) {
            // Side container
            var sideContainer = $('<div class="side-container"></div>');

            // Current side panel shows alters already elicited
            if (serviceGenerator.options.panels.indexOf('current') !== -1) {
                // add custom node list
                sideContainer.append($('<div class="current-node-list node-lists"><h4>Service providers you already mentioned visiting:</h4></div>'));
                $('.nameList').addClass('alt');
                $.each(window.network.getEdges({type: 'HIVService', from: window.network.getEgo().id, visited: true}), function(index,value) {
                    if (!value.sg_t0) {
                        var node = window.network.getNode(value.to);
                        var el = $('<div class="node-list-item">'+node.name+'</div>');
                        sideContainer.children('.current-node-list').append(el);
                    }
                });
            }

            serviceGenerator.options.targetEl.append(sideContainer);

        } // end if panels
    };

    serviceGenerator.addToList = function(properties) {
        note.debug('serviceGenerator.addToList');
        note.trace(properties);
        // var index = $(this).data('index');
        var card;
        var node = window.network.getNode(properties.to);
        card = $('<div class="card"><div class="inner-card" data-index="'+properties.to+'"><h4>'+node.name+'</h4></div></div>');
        $('.nameList').append(card);

    };

    serviceGenerator.removeFromList = function() {
        $('.delete-button').hide();

        var nodeID = editing;

        window.network.removeNode(nodeID);

        $('div[data-index='+editing+']').addClass('delete');
        var tempEditing = editing;
        setTimeout(function() {
            $('div[data-index='+tempEditing+']').parent().remove();
        }, 700);

        editing = false;
        var venueCount = window.network.getEdges({type: 'HIVService', visited: true}).length;
        venueCounter.update(venueCount);

        serviceGenerator.closeNodeBox();
    };

    return serviceGenerator;
};
