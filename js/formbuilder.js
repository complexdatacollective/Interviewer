/* global $, window */
/* exported FormBuilder */

module.exports = function FormBuilder() {
    'use strict';

    var formBuilder = {};
    var thisForm;
    var html = '<form></form>';
    var moduleEvents = [];

    formBuilder.init = function() {
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

    formBuilder.build = function(element, form) {
        thisForm = form;
        // Form options
        if (typeof form.title !== 'undefined') {
            html = $(html).append('<legend>'+form.title+'</legend><div class="alert alert-danger" role="alert" style="display: none;"><span class="glyphicon glyphicon-exclamation-sign" aria-hidden="true"></span> <span class="error"></span></div>');
        }

        // Form fields
        $.each(form.fields, function(formIndex, formValue) {
            var wrapper, variableComponent = '', variableLabel = '', checkLabel = '';
                var placeholder = formValue.placeholder? formValue.placeholder : '';
                var required = formValue.required? 'required' : '';

                if (formValue.type === 'string') {
                    wrapper = '<div class="form-group"></div>';
                    if (typeof formValue.title !== 'undefined') {
                        variableLabel = '<label for="'+formIndex+'">'+formValue.title+'</label>';
                    }

                    variableComponent = '<input type="text" class="form-control" id="'+formIndex+'" name="'+formIndex+'" placeholder="'+placeholder+'" '+required+'>';
                    wrapper = $(wrapper).append(variableLabel+variableComponent);
                    html = $(html).append(wrapper);
                } else if (formValue.type === 'number') {
                    wrapper = '<div class="form-group"></div>';
                    variableLabel = '<label for="'+formIndex+'">'+formValue.title+'</label>';
                    variableComponent = '<input type="number" class="form-control" id="'+formIndex+'" name="'+formIndex+'" placeholder="'+placeholder+'" '+required+'>';
                    wrapper = $(wrapper).append(variableLabel+variableComponent);
                    html = $(html).append(wrapper);
                } else if (formValue.type === 'email') {
                    wrapper = '<div class="form-group"></div>';
                    variableLabel = '<label for="'+formIndex+'">'+formValue.title+'</label>';
                    variableComponent = '<input type="email" class="form-control" id="'+formIndex+'" name="'+formIndex+'" placeholder="'+placeholder+'" '+required+'>';
                    wrapper = $(wrapper).append(variableLabel+variableComponent);
                    html = $(html).append(wrapper);
                } else if (formValue.type === 'textarea') {
                    wrapper = '<div class="form-group"></div>';
                    variableLabel = '<label for="'+formIndex+'">'+formValue.title+'</label>';
                    variableComponent = '<textarea class="form-control" id="'+formIndex+'" name="'+formIndex+'" rows="'+formValue.rows+'" cols="'+formValue.cols+'" placeholder="'+placeholder+'" '+required+'></textarea>';
                    wrapper = $(wrapper).append(variableLabel+variableComponent);
                    html = $(html).append(wrapper);
                } else if (formValue.type === 'radio') {
                    wrapper = '<div class="form-group"></div>';
                    variableComponent = '';
                    variableLabel = '<label class="control-label">'+formValue.title+'</label>';
                    wrapper = $(wrapper).append(variableLabel);

                    $.each(formValue.variables, function(checkIndex, checkValue){
                        variableComponent = '<input type="radio" name="'+formIndex+'" value="'+checkValue.value+'" id="'+checkValue.id+'" '+required+'>';
                        checkLabel = '<label class="radio-inline" for="'+checkValue.id+'">'+checkValue.label+'</label>';
                        wrapper = $(wrapper).append(variableComponent+checkLabel);
                    });
                    html = $(html).append(wrapper);
                }
        });

        // Buttons
        var buttonGroup = '<div class="text-right button-group"></div>';
        $.each(form.options.buttons, function(buttonIndex, buttonValue){
            buttonGroup = $(buttonGroup).append('<button id="'+buttonValue.id+'" type="'+buttonValue.type+'" class="btn '+buttonValue.class+'">'+buttonValue.label+'</button>&nbsp;');

        });
        html = $(html).append(buttonGroup);
        // Write to DOM
        element.append(html);

        // Events

        // submit
        window.tools.Events.register(moduleEvents, [{
            targetEl: $(html),
            event: 'submit',
            handler: function(e) {
                e.preventDefault();
                var data = $(this).serializeArray();
                var cleanData = {};
                for (var i = 0; i < data.length; i++) {
                    cleanData[data[i].name] = data[i].value;
                }
                form.options.onSubmit(cleanData);
            }
        }]);

        // onLoad
        window.tools.Events.register(moduleEvents, [{
            targetEl: $(html),
            event: 'formLoaded',
            handler: function() {
                form.options.onLoad();
            }
        }]);

        $.each(form.options.buttons, function(buttonIndex, buttonValue){
            if(buttonValue.action !== 'undefined') {
                window.tools.Events.register(moduleEvents, [{
                    targetEl: $('#'+buttonValue.id),
                    event: 'click',
                    handler: buttonValue.action
                }]);
            }
        });

        // Data population
        if (typeof form.data !== 'undefined') {
            formBuilder.addData(form.data);
        }

        $(html).trigger('formLoaded');

    };

    formBuilder.destroy = function() {
        window.tools.Events.unbind(moduleEvents);
    };

    formBuilder.addData = function(data) {
        $.each(data, function(dataIndex, dataValue) {
            if (thisForm.fields[dataIndex] !== undefined) {
                if (thisForm.fields[dataIndex].type === 'string' || thisForm.fields[dataIndex].type === 'email' || thisForm.fields[dataIndex].type === 'number') {
                    $('#'+dataIndex).val(dataValue);
                } else if (thisForm.fields[dataIndex].type === 'textarea') {
                    $('#'+dataIndex).html(dataValue);
                } else if (thisForm.fields[dataIndex].type === 'radio') {
                    $('input:radio[name="'+dataIndex+'"][value="'+dataValue+'"]').prop('checked', true);
                }
            } else {
                console.warn('Data provided for undefined field '+dataIndex);
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
