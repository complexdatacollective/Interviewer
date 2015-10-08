/* global $, window, jQuery, note */
/* exported FormBuilder */

module.exports = function FormBuilder(formName) {
    'use strict';

    var formBuilder = {};
    var thisForm;
    var html = '<form></form>';
    var moduleEvents = [];
    var deferredTasks = [];
    var formFields;
    var targetEl;
    var name = formName ? formName : 'Default';
    window.forms = window.forms || {};
    window.forms[name] = formBuilder;

    formBuilder.init = function() {

        note.info('FormBuilder initialised.');
        // Event listeners
        window.tools.Events.register(moduleEvents, [
            {
                event: 'stageChangeStart',
                handler: formBuilder.destroy,
                targetEl:  'window.document'
            }
        ]);
    };

    formBuilder.reset = function() {
        $(html).find('.alert').fadeOut();
        $(html)[0].reset();
    };

    formBuilder.showError = function(error) {
        $(html).find('.alert').fadeIn();
        $(html).find('.error').html(error);
    };

    formBuilder.addDeferred = function(item) {
        note.debug('FormBuilder ['+name+']: adding deferred form task.');
        deferredTasks.push(item);
    };

    formBuilder.runDeferred = function() {
        note.debug('FormBuilder ['+name+']: running deferred form initialisation actions.');
        for (var i = 0; i < deferredTasks.length; i++) {
            if (typeof deferredTasks[i].action === 'function') {
                deferredTasks[i].action();
            }
        }

        deferredTasks = [];
    };

    // show and hide methods
    formBuilder.show = function() {
        note.debug('FormBuilder ['+name+']: show.');
        console.log(targetEl);
        targetEl.addClass('show');
        $('.black-overlay').addClass('show');
        setTimeout(function() {
            $('#'+$(html).attr('id')+' :input:visible:enabled:first').focus();
        }, 500);

    };

    formBuilder.hide = function () {
        note.debug('FormBuilder ['+name+']: hide.');
        targetEl.removeClass('show');
        $('.black-overlay').removeClass('show');
        $(thisForm).trigger('reset');
    };


    formBuilder.build = function(element, form) {
        thisForm = form;
        targetEl = element;
        // Form options
        if (typeof form.heading !== 'undefined') {
            html = $(html).append('<div class="page-header"><h1>'+form.heading+'</h1></div>');
        }

        if (typeof form.title !== 'undefined') {
            html = $(html).append('<legend>'+form.title+'</legend><div class="alert alert-danger" role="alert" style="display: none;"><span class="glyphicon glyphicon-exclamation-sign" aria-hidden="true"></span> <span class="error"></span></div>');
        }



        // Form fields
        formFields = '<div class="form-fields"></div>';
        formBuilder.addFields(form.fields);
        html = $(html).append(formFields);

        // Buttons
        var buttonGroup = '<div class="text-right button-group"></div>';
        $.each(form.options.buttons, function(buttonIndex, buttonValue){
            buttonGroup = $(buttonGroup).append('<button id="'+buttonValue.id+'" type="'+buttonValue.type+'" class="btn '+buttonValue.class+'">'+buttonValue.label+'</button>&nbsp;');

        });
        html = $(html).append(buttonGroup);

        // Check if we are outputting html or writing to DOM
        if (element instanceof jQuery) {
            note.debug('Formbuilder ['+name+'] outputting to jQuery object.');
            // Write to DOM
            html = $(html).uniqueId();
            element.append(html);
            formBuilder.addEvents();
            // Data population
            if (typeof form.data !== 'undefined') {
                formBuilder.addData(form.data);
            }
            $(html).trigger('formLoaded');
        } else if (element === 'html') {
            note.debug('Formbuilder ['+name+'] outputting HTML.');
            // return the html for the form
            html = $(html).uniqueId();
            return html;
        } else {
            throw new Error('Formbuilder ['+name+'] didn\'t understand the intended output destination of the build method.');
        }

        formBuilder.runDeferred();

    };

    formBuilder.addFields = function(fields) {
        $.each(fields, function(formIndex, formValue) {
            if (!formBuilder.fieldExists(formIndex)) {
                var wrapper, variableComponent = '', variableLabel = '', checkLabel = '';
                var placeholder = formValue.placeholder? formValue.placeholder : '';
                var required = formValue.required? 'required' : '';

                if (formValue.type === 'string') {
                    wrapper = '<div class="form-group" data-component="'+formIndex+'"></div>';
                    if (typeof formValue.title !== 'undefined') {
                        variableLabel = '<label for="'+formIndex+'">'+formValue.title+'</label>';
                    }

                    variableComponent = '<input type="text" class="form-control" id="'+formIndex+'" name="'+formIndex+'" placeholder="'+placeholder+'" autocomplete="off" '+required+'>';
                    wrapper = $(wrapper).append(variableLabel+variableComponent);
                    formFields = $(formFields).append(wrapper);
                } else if (formValue.type === 'hidden') {
                    variableComponent = '<input type="hidden" id="'+formIndex+'" name="'+formIndex+'" autocomplete="off" '+required+'>';
                    formFields = $(formFields).append(variableComponent);
                } else if (formValue.type === 'number') {

                    // Create component container
                    var component = '<div class="form-group" data-component="'+formIndex+'"></div>';

                    // Append Label
                    component = $(component).append('<label for="'+formIndex+'">'+formValue.title+'</label>');

                    // Create input group container
                    var inputGroup = '<div class="input-group"></div>';

                    // Check if we have a prefix
                    if (typeof formValue.prefix !== 'undefined') {
                        // If we do, append it
                        inputGroup = $(inputGroup).append('<span class="input-group-addon">'+formValue.prefix+'</span>');
                    }

                    // Create an input element
                    var input = '<input type="number" class="form-control" id="'+formIndex+'" name="'+formIndex+'" placeholder="'+placeholder+'" autocomplete="off" '+required+'>';

                    // Set the input attributes
                    var properties = {};
                    properties.min = formValue.min ? formValue.min : '0';
                    properties.max = formValue.max ? formValue.max : '';
                    input = $(input).attr(properties);

                    // Append the input to the input group or the component
                    if (typeof formValue.prefix !== 'undefined') {
                        inputGroup = $(inputGroup).append(input);
                        // Appent the input group to the componens
                        component = $(component).append(inputGroup);

                    } else {
                        component = $(component).append(input);
                    }

                    // Append the component to the form
                    formFields = $(formFields).append(component);
                } else if (formValue.type === 'slider') {
                    wrapper = '<div class="form-group" data-component="'+formIndex+'"></div>';
                    variableLabel = '<label for="'+formIndex+'">'+formValue.title+'</label>';
                    variableComponent = '<input type="text" class="form-control slider" id="'+formIndex+'" name="'+formIndex+'">';
                    // Initialise sliders through deferred action
                    formBuilder.addDeferred({
                        action: function() {
                            $('#'+formIndex).bootstrapSlider({min: 0, max: 100, value: formValue.initial });
                        }
                    });

                    wrapper = $(wrapper).append(variableLabel+variableComponent);
                    formFields = $(formFields).append(wrapper);
                } else if (formValue.type === 'email') {
                    wrapper = '<div class="form-group" data-component="'+formIndex+'"></div>';
                    variableLabel = '<label for="'+formIndex+'">'+formValue.title+'</label>';
                    variableComponent = '<input type="email" class="form-control" id="'+formIndex+'" name="'+formIndex+'" placeholder="'+placeholder+'" autocomplete="off" '+required+'>';
                    wrapper = $(wrapper).append(variableLabel+variableComponent);
                    formFields = $(formFields).append(wrapper);
                } else if (formValue.type === 'textarea') {
                    wrapper = '<div class="form-group" data-component="'+formIndex+'"></div>';
                    variableLabel = '<label for="'+formIndex+'">'+formValue.title+'</label>';
                    variableComponent = '<textarea class="form-control" id="'+formIndex+'" name="'+formIndex+'" rows="'+formValue.rows+'" cols="'+formValue.cols+'" autocomplete="off" placeholder="'+placeholder+'" '+required+'></textarea>';
                    wrapper = $(wrapper).append(variableLabel+variableComponent);
                    formFields = $(formFields).append(wrapper);
                } else if (formValue.type === 'radio') {
                    wrapper = '<div class="form-group" data-component="'+formIndex+'"></div>';
                    variableComponent = '';
                    variableLabel = '<label class="control-label">'+formValue.title+'</label>';
                    wrapper = $(wrapper).append(variableLabel);

                    $.each(formValue.variables, function(checkIndex, checkValue){
                        variableComponent = '<input type="radio" name="'+formIndex+'" value="'+checkValue.value+'" id="'+checkValue.id+'" '+required+'>';
                        checkLabel = '<label class="radio-inline" for="'+checkValue.id+'">'+checkValue.label+'</label>';
                        wrapper = $(wrapper).append(variableComponent+checkLabel);
                    });
                    formFields = $(formFields).append(wrapper);
                } else if (formValue.type === 'checkbox') {
                    // inline or regular?
                    var inline = formValue.inline ? 'checkbox-inline' : 'checkbox';

                    // Create wrapper element
                    wrapper = '<div class="form-group" data-component="'+formIndex+'"></div>';
                    variableComponent = '';
                    variableLabel = '<label class="control-label">'+formValue.title+'</label>';
                    wrapper = $(wrapper).append(variableLabel);

                    // Append checkboxes
                    $.each(formValue.variables, function(checkIndex, checkValue){
                        variableComponent = '<input type="checkbox" data-field="'+formIndex+'" name="'+formIndex+'" value="'+checkValue.id+'" id="'+checkValue.id+'" '+required+'>';
                        checkLabel = '<label class="'+inline+'" for="'+checkValue.id+'">'+checkValue.label+'</label>';
                        wrapper = $(wrapper).append(variableComponent+checkLabel);
                    });
                    formFields = $(formFields).append(wrapper);
                }
            } else {
                note.error('FormBuilder ['+name+']: Field with id "'+formIndex+'" already exists!');
            }

        });
    };

    formBuilder.removeField = function(id) {
        $('[data-component="'+id+'"]').remove();
    };

    formBuilder.fieldExists = function(id) {
        if ($(html).find('[data-component="'+id+'"]').length > 0) {
            return true;
        } else {
            return false;
        }
    };

    formBuilder.addEvents = function() {

        // submit
        window.tools.Events.register(moduleEvents,
        [
            {
                targetEl: $(html),
                event: 'submit',
                handler: function(e) {
                    note.debug('FormBuilder ['+name+']: Form submitted.');

                    e.preventDefault();

                    var data = $(this).serializeArray();
                    var cleanData = {};
                    for (var i = 0; i < data.length; i++) {

                        // To handle checkboxes, we check if the key already exists first. If it
                        // does, we append new values to an array. This keeps compatibility with
                        // single form fields, but might need revising.
                        if (typeof cleanData[data[i].name] !== 'undefined' && typeof cleanData[data[i].name] !== 'object') {
                            cleanData[data[i].name] = [cleanData[data[i].name]];
                            cleanData[data[i].name].push(data[i].value);
                        } else if (typeof cleanData[data[i].name] !== 'undefined' && typeof cleanData[data[i].name] === 'object'){
                            cleanData[data[i].name].push(data[i].value);
                        } else {
                            cleanData[data[i].name] = data[i].value;
                        }

                    }
                    note.debug(data);
                    if (typeof thisForm.options.onSubmit !== 'undefined') {
                        thisForm.options.onSubmit(cleanData);
                    }

                }
            },
            // {
            //     targetEl: $(window.document),
            //     subTarget: $('#'+thisForm.options.buttons.cancel.id),
            //     event: 'click',
            //     handler: function() {
            //         note.debug('FormBuilder ['+name+']: Form cancelled.');
            //         formBuilder.hide();
            //     }
            // },
            {
                targetEl: $('input'),
                event: 'change paste keyup',
                handler: function() {
                    $('#'+thisForm.options.buttons.submit.id).html(thisForm.options.buttons.submit.update_label);
                }
            }
        ]);

        // onLoad
        if (typeof thisForm.options.onLoad !== 'undefined') {
            window.tools.Events.register(moduleEvents, [{
                targetEl: $(html),
                event: 'formLoaded',
                handler: function() {
                    thisForm.options.onLoad(thisForm);
                }
            }]);
        }

        $.each(thisForm.options.buttons, function(buttonIndex, buttonValue){
            if(typeof buttonValue.action !== 'undefined') {
                window.tools.Events.register(moduleEvents, [{
                    targetEl: $('#'+buttonValue.id),
                    event: 'click',
                    handler: buttonValue.action
                }]);
            }
        });

    };

    formBuilder.destroy = function() {
        window.tools.Events.unbind(moduleEvents);
    };

    formBuilder.addData = function(data) {
        note.debug('FormBuilder ['+name+']: addData()');

        $.each(data, function(dataIndex, dataValue) {
            console.log(dataIndex);
            if (thisForm.fields[dataIndex] !== undefined) {
                if (thisForm.fields[dataIndex].type === 'string' || thisForm.fields[dataIndex].type === 'email' || thisForm.fields[dataIndex].type === 'number' || thisForm.fields[dataIndex].type === 'hidden') {
                    $(html).find('#'+dataIndex).val(dataValue);
                } else if (thisForm.fields[dataIndex].type === 'slider') {
                    var dataValueArray = dataValue.split(',').map(Number);
                    if (dataValueArray.length>1) {
                        $(html).find('#'+dataIndex).val(dataValue);
                        $(html).find('#'+dataIndex).bootstrapSlider({min: 0, max: 100, value: dataValueArray });
                    } else {
                        $(html).find('#'+dataIndex).val(dataValue[0]);
                        $(html).find('#'+dataIndex).bootstrapSlider({min: 0, max: 100, value: dataValue[0] });
                    }
                } else if (thisForm.fields[dataIndex].type === 'textarea') {
                    $(html).find('#'+dataIndex).html(dataValue);
                } else if (thisForm.fields[dataIndex].type === 'radio') {
                    $('input:radio[name="'+dataIndex+'"][value="'+dataValue+'"]').prop('checked', true);
                } else if (thisForm.fields[dataIndex].type === 'checkbox') {

                    // If single value, use directly
                    if (typeof dataValue !== 'undefined' && typeof dataValue === 'object') {
                        // If array, iterate
                        for (var i = 0; i < dataValue.length; i++) {
                            $(html).find('input:checkbox[value="'+dataValue[i]+'"]').prop('checked', true);
                        }
                    } else if (typeof dataValue !== 'undefined' && typeof dataValue === 'string') {
                        $(html).find('input:checkbox[value="'+dataValue+'"]').prop('checked', true);
                    }

                }
            } else {
                // If the dataIndex doesn't exist as a key in the fields object, it could be a sub-key
                // if, for example, it is the child of a checkbox variable
                note.debug('FormBuilder ['+name+']: Data provided for undefined field "'+dataIndex+'"');
            }
        });
    };

    formBuilder.init();

    return formBuilder;
};


// form = new window.netCanvas.Modules.FormBuilder();
//
// form.build(egoBuilder.options.targetEl, {
//     'title':egoBuilder.options.formTitle,
//     'fields': {
//         'name': {
//             'type':'string',
//             'title':'Name',
//             'required':true,
//             'name': 'participant_name',
//             'placeholder': 'Please enter your name.'
//         },
//         'feedback': {
//             'title':'Feedback',
//             'type': 'textarea',
//             'name': 'your_feedback',
//             'rows': 5,
//             'cols': 40,
//             'placeholder': 'Please enter your feedback.'
//         },
//         'ranking': {
//             'type':'radio',
//             'name':'my_radio',
//             'title':'Ranking',
//             'variables':[
//                 {label:'Value 1', value:'value1', id:'radio1'},
//                 {label:'Value 2', value:'value2', id:'radio2'},
//                 {label:'Value 3', value:'value3', id:'radio3'}
//             ],
//             'required':true
//         }
//     },
//     'options':{
//         'attributes':{
//             'action':'http://httpbin.org/post',
//             'method':'post'
//         },
//         onSubmit: function() {
//             console.log('FORM subMITTED');
//         },
//         'buttons':{
//             'submit':{
//                 label: 'Submit',
//                 id: 'submit-btn',
//                 type: 'submit',
//                 class: 'btn-primary'
//             }
//         }
//     }
// });
