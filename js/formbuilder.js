/* global $, window, jQuery, note, alert */
/* exported FormBuilder */

module.exports = function FormBuilder(formName) {
    'use strict';

    var formBuilder = {};
    var thisForm;
    var formOptions = {
        open: false,
        inline: false
    };
    var html = '<form></form>';
    var deferredTasks = [];
    var moduleEvents = [];
    var formFields;
    var temporaryFields = [];
    var targetEl;
    var name = formName ? formName : 'Default';
    window.forms = window.forms || {};
    window.forms[name] = formBuilder;

    formBuilder.init = function() {

        note.info('FormBuilder initialised.');
    };

    formBuilder.getID = function() {
        return thisForm.id;
    };

    formBuilder.reset = function() {
        $(html).find('.alert').fadeOut();
        $(html)[0].reset();

        // Reset all custom components
        $.each (thisForm.fields, function(fieldIndex, fieldValue) {
            if (fieldValue.type === 'custom') {
                thisForm.options.customFields[fieldValue.customType].reset();
            }
        });

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

        // Run custom show or hide functions, if present
        if (typeof thisForm.show === 'function') {
            thisForm.show();            
        }



        note.debug('FormBuilder ['+name+']: show.');
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
        setTimeout(function() {
            formBuilder.removeTemporaryFields();
            $(thisForm).trigger('reset');
        }, 1500);



    };

    formBuilder.build = function(element, form, options) {
        // element = target element to inject the form into
        // form = an object containing the form fields and configuration options. Also contains load, show, hide, and submit events.
        // options = buttons and custom field type definitions.

        var userOptions = options || {};
        $.extend(formOptions, userOptions);
        thisForm = form;
        targetEl = element;
        // Form options
        if (formOptions.inline === true) {
            html = $(html).addClass('inline-form');
        }

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
            thisForm.id = $(html).prop('id');
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
            thisForm.id = $(html).prop('id');
            return html;
        } else {
            throw new Error('Formbuilder ['+name+'] didn\'t understand the intended output destination of the build method.');
        }

    };

    formBuilder.removeTemporaryFields = function() {
        note.debug('FormBuilder ['+name+']: removeTemporaryFields()');
        console.log(temporaryFields);
        $.each(temporaryFields, function(fieldIndex, fieldValue) {
            formBuilder.removeField(fieldValue.id);
        });
    };

    formBuilder.addTemporaryFields = function(fields) {
        note.debug('FormBuilder ['+name+']: addTemporaryFields()');
        $.each(fields, function(fieldIndex, fieldValue) {
            fieldValue.id = fieldIndex;
            temporaryFields.push(fieldValue);
        });

        formBuilder.addFields(fields);
    };

    formBuilder.addFields = function(fields) {
        var wrapper, variableComponent, variableLabel, checkLabel, placeholder, required;
        note.debug('Adding fields');
        $.each(fields, function(formIndex, formValue) {
            note.debug('adding '+formIndex);
            if (!formBuilder.fieldExists(formIndex)) {
                variableComponent = ''; variableLabel = ''; checkLabel = '';
                placeholder = formValue.placeholder? formValue.placeholder : '';
                required = formValue.required? 'required' : '';

                if (formValue.type === 'text') {
                    wrapper = '<div class="form-group" data-component="'+formIndex+'"></div>';
                    if (typeof formValue.title !== 'undefined') {
                        variableLabel = '<label for="'+formIndex+'">'+formValue.title+'</label>';
                    }

                    variableComponent = '<input type="'+formValue.type+'" class="form-control" id="'+formIndex+'" name="'+formIndex+'" placeholder="'+placeholder+'" autocomplete="off" '+required+'>';
                    wrapper = $(wrapper).append(variableLabel+variableComponent);
                    formFields = $(formFields).append(wrapper);
                } else if (formValue.type === 'custom') {
                    note.warn('formBuilder.addFields(): Custom form field detected');

                    // Check if we have been supplied a definition
                    if (typeof formValue.customType !== 'undefined' && typeof thisForm.options.customFields[formValue.customType] !== 'undefined') {
                        // Check if the definition has a markup function
                        if (typeof thisForm.options.customFields[formValue.customType].markup !== 'undefined') {
                            wrapper = '<div class="form-group" data-component="'+formIndex+'"></div>';
                            // Pass the markup method the fields options, incase it needs them
                            wrapper = $(wrapper).append(thisForm.options.customFields[formValue.customType].markup(formValue.options));
                            formFields = $(formFields).append(wrapper);


                            // Initialise components as required
                            if (typeof thisForm.options.customFields[formValue.customType].markup !== 'undefined') {
                                formBuilder.addDeferred({
                                    action: thisForm.options.customFields[formValue.customType].initialise
                                });
                            }

                        } else {
                            note.warn('formBuilder.addFields(): Form of type "'+formValue.customType+'" did not have any markup.');
                        }
                    } else {
                        note.warn('formBuilder.addFields(): Could not find a definition for custom form type "'+formValue.customType+'"');
                    }

                    // formValue.customType
                } else if (formValue.type === 'hidden') {
                    wrapper = '<div class="hidden-form-group" data-component="'+formIndex+'"></div>';

                    variableComponent = '<input type="'+formValue.type+'" class="form-control" id="'+formIndex+'" name="'+formIndex+'" placeholder="'+placeholder+'" autocomplete="off" '+required+'>';
                    wrapper = $(wrapper).append(variableLabel+variableComponent);
                    formFields = $(formFields).append(wrapper);

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
                } else if (formValue.type === 'button-checkbox') {
                    // Create wrapper element
                    wrapper = '<div class="form-group" data-component="'+formIndex+'"></div>';
                    variableComponent = '';
                    variableLabel = '<label class="control-label">'+formValue.title+'</label>';
                    wrapper = $(wrapper).append(variableLabel);

                    // Append checkboxes
                    $.each(formValue.variables, function(checkIndex, checkValue){
                        variableComponent = '<input type="checkbox" data-field="'+formIndex+'" name="'+checkValue.id+'" id="'+checkValue.id+'" '+required+'>';
                        checkLabel = '<label class="checkbox-inline" for="'+checkValue.id+'">'+checkValue.label+'</label>';
                        wrapper = $(wrapper).append(variableComponent+checkLabel);
                    });
                    formFields = $(formFields).append(wrapper);
                }
            } else if(formBuilder.fieldExists(formIndex)) {
                variableComponent = ''; variableLabel = ''; checkLabel = '';
                placeholder = formValue.placeholder? formValue.placeholder : '';
                required = formValue.required? 'required' : '';


                if (formValue.type === 'button-checkbox') {
                    // This field exists. If we are trying to define it again, perhaps it is a checkbox group
                    // If it is, we should append the label and input to the existing form group
                    // Create wrapper element

                    // Append checkboxes
                    $.each(formValue.variables, function(checkIndex, checkValue){
                        variableComponent = '<input type="checkbox" data-field="'+formIndex+'" name="'+checkValue.id+'" id="'+checkValue.id+'" '+required+'>';
                        checkLabel = '<label class="checkbox-inline" for="'+checkValue.id+'">'+checkValue.label+'</label>';
                        $(formFields).find('[data-component="'+formIndex+'"]').append(variableComponent+checkLabel);
                    });
                }

            } else {
                note.error('FormBuilder ['+name+']: Field with id "'+formIndex+'" already exists!');
            }

        });

        formBuilder.runDeferred();
    };

    formBuilder.removeFields = function(fields) {
        note.debug('FormBuilder ['+name+']: removeFields()');
        $.each(fields, function(fieldIndex) {
            formBuilder.removeField(fieldIndex);
        });
    };

    formBuilder.removeField = function(id) {
        $('[data-component="'+id+'"]').remove();
    };

    formBuilder.fieldExists = function(id) {
        if ($('#'+thisForm.id).find('#'+id).length > 0) {
            note.debug('field '+id+' exists');
            return true;
        } else if ($('#'+thisForm.id).find('[data-component="'+id+'"]').length > 0) {
            note.debug('field '+id+' exists as a checkbox.');
            return true;
        } else {
            console.log('field '+id+' not found');
            return false;
        }
    };

    formBuilder.fieldType = function(id) {
        if (formBuilder.fieldExists(id)) {
            return $($('#'+thisForm.id).find('#'+id)[0]).prop('type');
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
                    console.log('raw form');
                    console.log(data);
                    var cleanData = {};
                    for (var i = 0; i < data.length; i++) {

                        // To handle checkboxes, we check if the key already exists first. If it
                        // does, we append new values to an array. This keeps compatibility with
                        // single form fields, but might need revising.

                        // Handle checkbox values
                        if (data[i].value === 'on') { data[i].value = 1; }

                        // This code takes the serialised output and puts it in the structured required to store within noded/edges.
                        if (typeof cleanData[data[i].name] !== 'undefined' && typeof cleanData[data[i].name] !== 'object') {
                            console.log('ONE');
                            // if it isn't an object, its a string. Create an empty array and store by itself.
                            cleanData[data[i].name] = [cleanData[data[i].name]];
                            cleanData[data[i].name].push(data[i].value);
                        } else if (typeof cleanData[data[i].name] !== 'undefined' && typeof cleanData[data[i].name] === 'object'){
                            console.log('TWO');
                            // Its already an object, so append our new item
                            cleanData[data[i].name].push(data[i].value);
                        } else {
                            console.log('THREE');
                            // This is for regular text fields. Simple store the key value pair.
                            cleanData[data[i].name] = data[i].value;
                        }

                    }

                    note.debug(cleanData);

                    if (typeof thisForm.submit !== 'undefined') {
                        thisForm.submit(cleanData);
                    }

                }
            },
            {
                targetEl: $('input'),
                event: 'change paste keyup',
                handler: function() {
                    $('#'+thisForm.options.buttons.submit.id).html(thisForm.options.buttons.submit.update_label);
                }
            }
        ]);

        // onLoad
        if (typeof thisForm.load !== 'undefined') {
            window.tools.Events.register(moduleEvents, [{
                targetEl: $(html),
                event: 'formLoaded',
                handler: function() {
                    thisForm.load(thisForm);
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

    formBuilder.isOpen = function() {
        return true;
    };

    formBuilder.isClosed = function() {
        return false;
    };

    formBuilder.destroy = function() {
        window.tools.Events.unbind(moduleEvents);
    };

    formBuilder.addData = function(data) {
        note.debug('FormBuilder ['+name+']: addData()');

        $.each(data, function(dataIndex, dataValue) {
            console.log('formbuilder.addData() analysing data for '+dataIndex);
            if (formBuilder.fieldExists(dataIndex)) {
                // For standard inputs
                var currentType = formBuilder.fieldType(dataIndex);

                // But we need this for checkboxes
                currentType = currentType ? currentType : 'checkbox';
                console.log('Identified '+dataIndex+' as type '+currentType);
                if (currentType === 'text' || currentType === 'email' || currentType === 'number' || currentType === 'hidden') {
                    console.log('assigning '+dataValue+' to '+dataIndex);
                    $(html).find('#'+dataIndex).val(dataValue);
                } else if (currentType === 'slider') {
                    var dataValueArray = dataValue.split(',').map(Number);
                    if (dataValueArray.length>1) {
                        $(html).find('#'+dataIndex).val(dataValue);
                        $(html).find('#'+dataIndex).bootstrapSlider({min: 0, max: 100, value: dataValueArray });
                    } else {
                        $(html).find('#'+dataIndex).val(dataValue[0]);
                        $(html).find('#'+dataIndex).bootstrapSlider({min: 0, max: 100, value: dataValue[0] });
                    }
                } else if (currentType === 'textarea') {
                    $(html).find('#'+dataIndex).html(dataValue);
                } else if (currentType === 'radio') {
                    $('input:radio[name="'+dataIndex+'"][value="'+dataValue+'"]').prop('checked', true);
                } else if (currentType === 'checkbox') {
                    console.log('adding checkbox data');
                    console.log(dataIndex);
                    console.log(dataValue);
                    // If single value, use directly
                    if (typeof dataValue !== 'undefined' && typeof dataValue === 'object') {
                        // If array, iterate
                        for (var i = 0; i < dataValue.length; i++) {
                            $(html).find('input:checkbox[value="'+dataValue[i]+'"]').prop('checked', true);
                        }
                    } else if (typeof dataValue !== 'undefined' && typeof dataValue === 'string') {
                        $(html).find('input:checkbox[value="'+dataValue+'"]').prop('checked', true);
                    } else if (typeof dataValue !== 'undefined' && typeof dataValue === 'number') {
                        $(html).find('#'+dataIndex).prop('checked', true);

                    }

                } else {
                    console.warn('currentType '+currentType+' not understood.');
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
