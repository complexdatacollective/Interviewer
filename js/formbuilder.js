/* global $, window */
/* exported FormBuilder */

module.exports = function FormBuilder() {
    'use strict';

    var formBuilder = {};
    var thisForm;
    var html = '<form></form>';

    formBuilder.build = function(element, form) {
        thisForm = form;
        // Form options
        html = $(html).append('<legend>'+form.title+'</legend>');

        // Form fields
        $.each(form.fields, function(formIndex, formValue) {
            var wrapper, variableComponent, variableLabel, checkLabel;
                if (formValue.type === 'string') {
                    wrapper = '<div class="form-group"></div>';
                    variableLabel = '<label for="'+formValue.name+'">'+formValue.title+'</label>';
                    variableComponent = '<input type="text" class="form-control" id="'+formValue.name+'" placeholder="'+formValue.placeholder+'">';
                    wrapper = $(wrapper).append(variableLabel+variableComponent);
                    html = $(html).append(wrapper);
                } else if (formValue.type === 'number') {
                    wrapper = '<div class="form-group"></div>';
                    variableLabel = '<label for="'+formValue.name+'">'+formValue.title+'</label>';
                    variableComponent = '<input type="number" class="form-control" id="'+formValue.name+'" placeholder="'+formValue.placeholder+'">';
                    wrapper = $(wrapper).append(variableLabel+variableComponent);
                    html = $(html).append(wrapper);
                } else if (formValue.type === 'email') {
                    wrapper = '<div class="form-group"></div>';
                    variableLabel = '<label for="'+formValue.name+'">'+formValue.title+'</label>';
                    variableComponent = '<input type="email" class="form-control" id="'+formValue.name+'" placeholder="'+formValue.placeholder+'">';
                    wrapper = $(wrapper).append(variableLabel+variableComponent);
                    html = $(html).append(wrapper);
                } else if (formValue.type === 'textarea') {
                    wrapper = '<div class="form-group"></div>';
                    variableLabel = '<label for="'+formValue.name+'">'+formValue.title+'</label>';
                    variableComponent = '<textarea class="form-control" id="'+formValue.name+'" rows="'+formValue.rows+'" cols="'+formValue.cols+'" placeholder="'+formValue.placeholder+'"></textarea>';
                    wrapper = $(wrapper).append(variableLabel+variableComponent);
                    html = $(html).append(wrapper);
                } else if (formValue.type === 'radio') {
                    wrapper = '<div class="form-group"></div>';
                    variableComponent = '';
                    variableLabel = '<label class="control-label">'+formValue.title+'</label>';
                    wrapper = $(wrapper).append(variableLabel);

                    $.each(formValue.variables, function(checkIndex, checkValue){
                        variableComponent = '<input type="radio" name="'+formValue.name+'" value="'+checkValue.value+'" id="'+checkValue.id+'">';
                        checkLabel = '<label class="radio-inline" for="'+checkValue.id+'">'+checkValue.label+'</label>';
                        wrapper = $(wrapper).append(variableComponent+checkLabel);
                    });
                    html = $(html).append(wrapper);
                }
        });
        // Buttons
        $.each(form.options.buttons, function(buttonIndex, buttonValue){
            html = $(html).append('<button type="'+buttonValue.type+'" class="btn btn-default '+buttonValue.class+'">'+buttonValue.label+'</button>');
        });

        // Write to DOM
        element.html(html);

        // Data population
        formBuilder.addData(form.data);

    };

    formBuilder.addData = function(data) {
        $.each(data, function(dataIndex, dataValue) {
            if (thisForm.fields[dataIndex] !== undefined) {
                if (thisForm.fields[dataIndex].type === 'string' || thisForm.fields[dataIndex].type === 'email' || thisForm.fields[dataIndex].type === 'number') {
                    $('#'+thisForm.fields[dataIndex].name).val(dataValue);
                } else if (thisForm.fields[dataIndex].type === 'textarea') {
                    $('#'+thisForm.fields[dataIndex].name).html(dataValue);
                } else if (thisForm.fields[dataIndex].type === 'radio') {
                    $('input:radio[name="'+thisForm.fields[dataIndex].name+'"][value="'+dataValue+'"]').prop('checked', true);
                }
            } else {
                console.warn('Data provided for undefined field.');
            }
        });
    };

    return formBuilder;
};
