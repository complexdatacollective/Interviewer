/* global $, window, alert */
/* exported EgoBuilder */

module.exports = function EgoBuilder() {
    'use strict';

    var egoBuilder = {};
    var form;
    egoBuilder.options = {
        targetEl: $('.container'),
        heading: 'This is a default heading',
        formTitle: 'Create a new case'
    };

    var moduleEvents = [];

    egoBuilder.init = function(options) {

        // Event listeners
        var events = [
            {
                event: 'stageChangeStart',
                handler: egoBuilder.destroy,
                targetEl:  'window.document',
                subTargetEl: ''
            }
        ];
        window.tools.Events.register(moduleEvents, events);

        $.extend(egoBuilder.options, options);

        egoBuilder.options.targetEl.append('<h1>'+egoBuilder.options.heading+'</h1>');

        // Build form
        form = new window.netCanvas.Modules.FormBuilder();

        form.build(egoBuilder.options.targetEl, {
        	'title':egoBuilder.options.formTitle,
            'fields': {
                'name': {
                    'type':'string',
                    'title':'Name',
                    'required':true,
        			'placeholder': 'Please enter your name.'
                },
                'case_number': {
                    'type':'number',
                    'title':'Case Number',
                    'required':true
                }
            },
            'options':{
                'attributes':{
                    'action':'http://httpbin.org/post',
                    'method':'post'
                },
        		onSubmit: function(data) {
                    var properties = {};
                    for (var i = 0; i < data.length; i++) {
                        properties[data[i].name] = data[i].value;
                    }
        			egoBuilder.updateEgo(properties);
        		},
                onLoad: function() {
                    egoBuilder.loadEgoData();
                },
                'buttons':{
                    'submit':{
        				label: 'Start',
        				id: 'submit-btn',
        				type: 'submit',
        				class: 'btn-primary'
        			}
                }
            }
        });
    };

    egoBuilder.updateEgo = function(data) {
        console.log('update ego');
        console.log(data);
        if (window.network.egoExists()) {
            window.network.updateNode(window.network.getEgo().id, data, function() {
                alert('updated');
            });
        } else {
            window.network.createEgo(data);
            alert('created');
        }

    };

    egoBuilder.loadEgoData = function() {

        if (window.network.egoExists()) {
            var ego = window.network.getEgo();
            form.addData(ego);
        }

    };

    egoBuilder.destroy = function() {
        window.tools.Events.unbind(moduleEvents);
    };

    return egoBuilder;
};
