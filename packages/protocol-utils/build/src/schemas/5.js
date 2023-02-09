'use strict';
var formats = require('ajv/lib/compile/formats')();
var equal = require('ajv/lib/compile/equal');
var validate = (function () {
    var pattern0 = new RegExp('.+');
    var pattern1 = new RegExp('^[a-zA-Z0-9._:-]+$');
    var refVal = [];
    var refVal1 = (function () {
        var pattern0 = new RegExp('.+');
        var pattern1 = new RegExp('^[a-zA-Z0-9._:-]+$');
        return function validate(data, dataPath, parentData, parentDataProperty, rootData) {
            'use strict';
            var vErrors = null;
            var errors = 0;
            if (rootData === undefined)
                rootData = data;
            if ((data && typeof data === "object" && !Array.isArray(data))) {
                var errs__0 = errors;
                var valid1 = true;
                for (var key0 in data) {
                    var isAdditional0 = !(false || key0 == 'name' || key0 == 'description' || key0 == 'lastModified' || key0 == 'schemaVersion' || key0 == 'codebook' || key0 == 'assetManifest' || key0 == 'stages');
                    if (isAdditional0) {
                        valid1 = false;
                        var err = {
                            keyword: 'additionalProperties',
                            dataPath: (dataPath || '') + "",
                            schemaPath: '#/additionalProperties',
                            params: {
                                additionalProperty: '' + key0 + ''
                            },
                            message: 'should NOT have additional properties'
                        };
                        if (vErrors === null)
                            vErrors = [err];
                        else
                            vErrors.push(err);
                        errors++;
                    }
                }
                if (data.name !== undefined) {
                    var errs_1 = errors;
                    if (typeof data.name !== "string") {
                        var err = {
                            keyword: 'type',
                            dataPath: (dataPath || '') + '.name',
                            schemaPath: '#/properties/name/type',
                            params: {
                                type: 'string'
                            },
                            message: 'should be string'
                        };
                        if (vErrors === null)
                            vErrors = [err];
                        else
                            vErrors.push(err);
                        errors++;
                    }
                    var valid1 = errors === errs_1;
                }
                if (data.description !== undefined) {
                    var errs_1 = errors;
                    if (typeof data.description !== "string") {
                        var err = {
                            keyword: 'type',
                            dataPath: (dataPath || '') + '.description',
                            schemaPath: '#/properties/description/type',
                            params: {
                                type: 'string'
                            },
                            message: 'should be string'
                        };
                        if (vErrors === null)
                            vErrors = [err];
                        else
                            vErrors.push(err);
                        errors++;
                    }
                    var valid1 = errors === errs_1;
                }
                var data1 = data.lastModified;
                if (data1 !== undefined) {
                    var errs_1 = errors;
                    if (typeof data1 === "string") {
                        if (!formats['date-time'].test(data1)) {
                            var err = {
                                keyword: 'format',
                                dataPath: (dataPath || '') + '.lastModified',
                                schemaPath: '#/properties/lastModified/format',
                                params: {
                                    format: 'date-time'
                                },
                                message: 'should match format "date-time"'
                            };
                            if (vErrors === null)
                                vErrors = [err];
                            else
                                vErrors.push(err);
                            errors++;
                        }
                    }
                    else {
                        var err = {
                            keyword: 'type',
                            dataPath: (dataPath || '') + '.lastModified',
                            schemaPath: '#/properties/lastModified/type',
                            params: {
                                type: 'string'
                            },
                            message: 'should be string'
                        };
                        if (vErrors === null)
                            vErrors = [err];
                        else
                            vErrors.push(err);
                        errors++;
                    }
                    var valid1 = errors === errs_1;
                }
                if (data.schemaVersion !== undefined) {
                    var errs_1 = errors;
                    if (typeof data.schemaVersion !== "number") {
                        var err = {
                            keyword: 'type',
                            dataPath: (dataPath || '') + '.schemaVersion',
                            schemaPath: '#/properties/schemaVersion/type',
                            params: {
                                type: 'number'
                            },
                            message: 'should be number'
                        };
                        if (vErrors === null)
                            vErrors = [err];
                        else
                            vErrors.push(err);
                        errors++;
                    }
                    var valid1 = errors === errs_1;
                }
                if (data.codebook === undefined) {
                    valid1 = false;
                    var err = {
                        keyword: 'required',
                        dataPath: (dataPath || '') + "",
                        schemaPath: '#/required',
                        params: {
                            missingProperty: 'codebook'
                        },
                        message: 'should have required property \'codebook\''
                    };
                    if (vErrors === null)
                        vErrors = [err];
                    else
                        vErrors.push(err);
                    errors++;
                }
                else {
                    var errs_1 = errors;
                    if (!refVal2(data.codebook, (dataPath || '') + '.codebook', data, 'codebook', rootData)) {
                        if (vErrors === null)
                            vErrors = refVal2.errors;
                        else
                            vErrors = vErrors.concat(refVal2.errors);
                        errors = vErrors.length;
                    }
                    var valid1 = errors === errs_1;
                }
                var data1 = data.assetManifest;
                if (data1 !== undefined) {
                    var errs_1 = errors;
                    var errs_2 = errors;
                    if ((!data1 || typeof data1 !== "object" || Array.isArray(data1))) {
                        var err = {
                            keyword: 'type',
                            dataPath: (dataPath || '') + '.assetManifest',
                            schemaPath: '#/definitions/AssetManifest/type',
                            params: {
                                type: 'object'
                            },
                            message: 'should be object'
                        };
                        if (vErrors === null)
                            vErrors = [err];
                        else
                            vErrors.push(err);
                        errors++;
                    }
                    var valid2 = errors === errs_2;
                    var valid1 = errors === errs_1;
                }
                var data1 = data.stages;
                if (data1 === undefined) {
                    valid1 = false;
                    var err = {
                        keyword: 'required',
                        dataPath: (dataPath || '') + "",
                        schemaPath: '#/required',
                        params: {
                            missingProperty: 'stages'
                        },
                        message: 'should have required property \'stages\''
                    };
                    if (vErrors === null)
                        vErrors = [err];
                    else
                        vErrors.push(err);
                    errors++;
                }
                else {
                    var errs_1 = errors;
                    if (Array.isArray(data1)) {
                        var errs__1 = errors;
                        var valid1;
                        for (var i1 = 0; i1 < data1.length; i1++) {
                            var errs_2 = errors;
                            if (!refVal15(data1[i1], (dataPath || '') + '.stages[' + i1 + ']', data1, i1, rootData)) {
                                if (vErrors === null)
                                    vErrors = refVal15.errors;
                                else
                                    vErrors = vErrors.concat(refVal15.errors);
                                errors = vErrors.length;
                            }
                            var valid2 = errors === errs_2;
                        }
                    }
                    else {
                        var err = {
                            keyword: 'type',
                            dataPath: (dataPath || '') + '.stages',
                            schemaPath: '#/properties/stages/type',
                            params: {
                                type: 'array'
                            },
                            message: 'should be array'
                        };
                        if (vErrors === null)
                            vErrors = [err];
                        else
                            vErrors.push(err);
                        errors++;
                    }
                    var valid1 = errors === errs_1;
                }
            }
            else {
                var err = {
                    keyword: 'type',
                    dataPath: (dataPath || '') + "",
                    schemaPath: '#/type',
                    params: {
                        type: 'object'
                    },
                    message: 'should be object'
                };
                if (vErrors === null)
                    vErrors = [err];
                else
                    vErrors.push(err);
                errors++;
            }
            validate.errors = vErrors;
            return errors === 0;
        };
    })();
    refVal1.schema = {
        "type": "object",
        "additionalProperties": false,
        "properties": {
            "name": {
                "type": "string"
            },
            "description": {
                "type": "string"
            },
            "lastModified": {
                "type": "string",
                "format": "date-time"
            },
            "schemaVersion": {
                "type": "number"
            },
            "codebook": {
                "$ref": "#/definitions/codebook"
            },
            "assetManifest": {
                "$ref": "#/definitions/AssetManifest"
            },
            "stages": {
                "type": "array",
                "items": {
                    "$ref": "#/definitions/Stage"
                }
            }
        },
        "required": ["stages", "codebook"],
        "title": "Protocol"
    };
    refVal1.errors = null;
    refVal[1] = refVal1;
    var refVal2 = (function () {
        var pattern0 = new RegExp('.+');
        var pattern1 = new RegExp('^[a-zA-Z0-9._:-]+$');
        return function validate(data, dataPath, parentData, parentDataProperty, rootData) {
            'use strict';
            var vErrors = null;
            var errors = 0;
            if (rootData === undefined)
                rootData = data;
            if ((data && typeof data === "object" && !Array.isArray(data))) {
                var errs__0 = errors;
                var valid1 = true;
                for (var key0 in data) {
                    var isAdditional0 = !(false || key0 == 'node' || key0 == 'edge' || key0 == 'ego');
                    if (isAdditional0) {
                        valid1 = false;
                        var err = {
                            keyword: 'additionalProperties',
                            dataPath: (dataPath || '') + "",
                            schemaPath: '#/additionalProperties',
                            params: {
                                additionalProperty: '' + key0 + ''
                            },
                            message: 'should NOT have additional properties'
                        };
                        if (vErrors === null)
                            vErrors = [err];
                        else
                            vErrors.push(err);
                        errors++;
                    }
                }
                if (data.node !== undefined) {
                    var errs_1 = errors;
                    if (!refVal3(data.node, (dataPath || '') + '.node', data, 'node', rootData)) {
                        if (vErrors === null)
                            vErrors = refVal3.errors;
                        else
                            vErrors = vErrors.concat(refVal3.errors);
                        errors = vErrors.length;
                    }
                    var valid1 = errors === errs_1;
                }
                if (data.edge !== undefined) {
                    var errs_1 = errors;
                    if (!refVal11(data.edge, (dataPath || '') + '.edge', data, 'edge', rootData)) {
                        if (vErrors === null)
                            vErrors = refVal11.errors;
                        else
                            vErrors = vErrors.concat(refVal11.errors);
                        errors = vErrors.length;
                    }
                    var valid1 = errors === errs_1;
                }
                if (data.ego !== undefined) {
                    var errs_1 = errors;
                    if (!refVal13(data.ego, (dataPath || '') + '.ego', data, 'ego', rootData)) {
                        if (vErrors === null)
                            vErrors = refVal13.errors;
                        else
                            vErrors = vErrors.concat(refVal13.errors);
                        errors = vErrors.length;
                    }
                    var valid1 = errors === errs_1;
                }
            }
            else {
                var err = {
                    keyword: 'type',
                    dataPath: (dataPath || '') + "",
                    schemaPath: '#/type',
                    params: {
                        type: 'object'
                    },
                    message: 'should be object'
                };
                if (vErrors === null)
                    vErrors = [err];
                else
                    vErrors.push(err);
                errors++;
            }
            validate.errors = vErrors;
            return errors === 0;
        };
    })();
    refVal2.schema = {
        "type": "object",
        "additionalProperties": false,
        "properties": {
            "node": {
                "$ref": "#/definitions/Node"
            },
            "edge": {
                "$ref": "#/definitions/Edge"
            },
            "ego": {
                "$ref": "#/definitions/Ego"
            }
        },
        "required": [],
        "title": "codebook"
    };
    refVal2.errors = null;
    refVal[2] = refVal2;
    var refVal3 = (function () {
        var pattern0 = new RegExp('.+');
        var pattern1 = new RegExp('^[a-zA-Z0-9._:-]+$');
        return function validate(data, dataPath, parentData, parentDataProperty, rootData) {
            'use strict';
            var vErrors = null;
            var errors = 0;
            if (rootData === undefined)
                rootData = data;
            if ((data && typeof data === "object" && !Array.isArray(data))) {
                var errs__0 = errors;
                var valid1 = true;
                for (var key0 in data) {
                    var isAdditional0 = !(false || pattern0.test(key0));
                    if (isAdditional0) {
                        valid1 = false;
                        var err = {
                            keyword: 'additionalProperties',
                            dataPath: (dataPath || '') + "",
                            schemaPath: '#/additionalProperties',
                            params: {
                                additionalProperty: '' + key0 + ''
                            },
                            message: 'should NOT have additional properties'
                        };
                        if (vErrors === null)
                            vErrors = [err];
                        else
                            vErrors.push(err);
                        errors++;
                    }
                }
                for (var key0 in data) {
                    if (pattern0.test(key0)) {
                        var errs_1 = errors;
                        if (!refVal4(data[key0], (dataPath || '') + '[\'' + key0 + '\']', data, key0, rootData)) {
                            if (vErrors === null)
                                vErrors = refVal4.errors;
                            else
                                vErrors = vErrors.concat(refVal4.errors);
                            errors = vErrors.length;
                        }
                        var valid1 = errors === errs_1;
                    }
                }
            }
            else {
                var err = {
                    keyword: 'type',
                    dataPath: (dataPath || '') + "",
                    schemaPath: '#/type',
                    params: {
                        type: 'object'
                    },
                    message: 'should be object'
                };
                if (vErrors === null)
                    vErrors = [err];
                else
                    vErrors.push(err);
                errors++;
            }
            validate.errors = vErrors;
            return errors === 0;
        };
    })();
    refVal3.schema = {
        "type": "object",
        "additionalProperties": false,
        "title": "Node",
        "patternProperties": {
            ".+": {
                "$ref": "#/definitions/NodeTypeDef"
            }
        }
    };
    refVal3.errors = null;
    refVal[3] = refVal3;
    var refVal4 = (function () {
        var pattern0 = new RegExp('.+');
        var pattern1 = new RegExp('^[a-zA-Z0-9._:-]+$');
        return function validate(data, dataPath, parentData, parentDataProperty, rootData) {
            'use strict';
            var vErrors = null;
            var errors = 0;
            if (rootData === undefined)
                rootData = data;
            if ((data && typeof data === "object" && !Array.isArray(data))) {
                var errs__0 = errors;
                var valid1 = true;
                for (var key0 in data) {
                    var isAdditional0 = !(false || key0 == 'name' || key0 == 'displayVariable' || key0 == 'iconVariant' || key0 == 'variables' || key0 == 'color');
                    if (isAdditional0) {
                        valid1 = false;
                        var err = {
                            keyword: 'additionalProperties',
                            dataPath: (dataPath || '') + "",
                            schemaPath: '#/additionalProperties',
                            params: {
                                additionalProperty: '' + key0 + ''
                            },
                            message: 'should NOT have additional properties'
                        };
                        if (vErrors === null)
                            vErrors = [err];
                        else
                            vErrors.push(err);
                        errors++;
                    }
                }
                if (data.name === undefined) {
                    valid1 = false;
                    var err = {
                        keyword: 'required',
                        dataPath: (dataPath || '') + "",
                        schemaPath: '#/required',
                        params: {
                            missingProperty: 'name'
                        },
                        message: 'should have required property \'name\''
                    };
                    if (vErrors === null)
                        vErrors = [err];
                    else
                        vErrors.push(err);
                    errors++;
                }
                else {
                    var errs_1 = errors;
                    if (typeof data.name !== "string") {
                        var err = {
                            keyword: 'type',
                            dataPath: (dataPath || '') + '.name',
                            schemaPath: '#/properties/name/type',
                            params: {
                                type: 'string'
                            },
                            message: 'should be string'
                        };
                        if (vErrors === null)
                            vErrors = [err];
                        else
                            vErrors.push(err);
                        errors++;
                    }
                    var valid1 = errors === errs_1;
                }
                if (data.displayVariable !== undefined) {
                    var errs_1 = errors;
                    if (typeof data.displayVariable !== "string") {
                        var err = {
                            keyword: 'type',
                            dataPath: (dataPath || '') + '.displayVariable',
                            schemaPath: '#/properties/displayVariable/type',
                            params: {
                                type: 'string'
                            },
                            message: 'should be string'
                        };
                        if (vErrors === null)
                            vErrors = [err];
                        else
                            vErrors.push(err);
                        errors++;
                    }
                    var valid1 = errors === errs_1;
                }
                if (data.iconVariant !== undefined) {
                    var errs_1 = errors;
                    if (typeof data.iconVariant !== "string") {
                        var err = {
                            keyword: 'type',
                            dataPath: (dataPath || '') + '.iconVariant',
                            schemaPath: '#/properties/iconVariant/type',
                            params: {
                                type: 'string'
                            },
                            message: 'should be string'
                        };
                        if (vErrors === null)
                            vErrors = [err];
                        else
                            vErrors.push(err);
                        errors++;
                    }
                    var valid1 = errors === errs_1;
                }
                if (data.variables !== undefined) {
                    var errs_1 = errors;
                    if (!refVal5(data.variables, (dataPath || '') + '.variables', data, 'variables', rootData)) {
                        if (vErrors === null)
                            vErrors = refVal5.errors;
                        else
                            vErrors = vErrors.concat(refVal5.errors);
                        errors = vErrors.length;
                    }
                    var valid1 = errors === errs_1;
                }
                if (data.color === undefined) {
                    valid1 = false;
                    var err = {
                        keyword: 'required',
                        dataPath: (dataPath || '') + "",
                        schemaPath: '#/required',
                        params: {
                            missingProperty: 'color'
                        },
                        message: 'should have required property \'color\''
                    };
                    if (vErrors === null)
                        vErrors = [err];
                    else
                        vErrors.push(err);
                    errors++;
                }
                else {
                    var errs_1 = errors;
                    if (typeof data.color !== "string") {
                        var err = {
                            keyword: 'type',
                            dataPath: (dataPath || '') + '.color',
                            schemaPath: '#/properties/color/type',
                            params: {
                                type: 'string'
                            },
                            message: 'should be string'
                        };
                        if (vErrors === null)
                            vErrors = [err];
                        else
                            vErrors.push(err);
                        errors++;
                    }
                    var valid1 = errors === errs_1;
                }
            }
            else {
                var err = {
                    keyword: 'type',
                    dataPath: (dataPath || '') + "",
                    schemaPath: '#/type',
                    params: {
                        type: 'object'
                    },
                    message: 'should be object'
                };
                if (vErrors === null)
                    vErrors = [err];
                else
                    vErrors.push(err);
                errors++;
            }
            validate.errors = vErrors;
            return errors === 0;
        };
    })();
    refVal4.schema = {
        "type": "object",
        "additionalProperties": false,
        "properties": {
            "name": {
                "type": "string"
            },
            "displayVariable": {
                "type": "string"
            },
            "iconVariant": {
                "type": "string"
            },
            "variables": {
                "$ref": "#/definitions/Variables"
            },
            "color": {
                "type": "string"
            }
        },
        "required": ["name", "color"],
        "title": "NodeTypeDef"
    };
    refVal4.errors = null;
    refVal[4] = refVal4;
    var refVal5 = (function () {
        var pattern0 = new RegExp('.+');
        var pattern1 = new RegExp('^[a-zA-Z0-9._:-]+$');
        return function validate(data, dataPath, parentData, parentDataProperty, rootData) {
            'use strict';
            var vErrors = null;
            var errors = 0;
            if (rootData === undefined)
                rootData = data;
            if ((data && typeof data === "object" && !Array.isArray(data))) {
                var errs__0 = errors;
                var valid1 = true;
                for (var key0 in data) {
                    var isAdditional0 = !(false || pattern0.test(key0));
                    if (isAdditional0) {
                        valid1 = false;
                        var err = {
                            keyword: 'additionalProperties',
                            dataPath: (dataPath || '') + "",
                            schemaPath: '#/additionalProperties',
                            params: {
                                additionalProperty: '' + key0 + ''
                            },
                            message: 'should NOT have additional properties'
                        };
                        if (vErrors === null)
                            vErrors = [err];
                        else
                            vErrors.push(err);
                        errors++;
                    }
                }
                for (var key0 in data) {
                    if (pattern0.test(key0)) {
                        var errs_1 = errors;
                        if (!refVal6(data[key0], (dataPath || '') + '[\'' + key0 + '\']', data, key0, rootData)) {
                            if (vErrors === null)
                                vErrors = refVal6.errors;
                            else
                                vErrors = vErrors.concat(refVal6.errors);
                            errors = vErrors.length;
                        }
                        var valid1 = errors === errs_1;
                    }
                }
            }
            else {
                var err = {
                    keyword: 'type',
                    dataPath: (dataPath || '') + "",
                    schemaPath: '#/type',
                    params: {
                        type: 'object'
                    },
                    message: 'should be object'
                };
                if (vErrors === null)
                    vErrors = [err];
                else
                    vErrors.push(err);
                errors++;
            }
            validate.errors = vErrors;
            return errors === 0;
        };
    })();
    refVal5.schema = {
        "type": "object",
        "additionalProperties": false,
        "title": "Variables",
        "patternProperties": {
            ".+": {
                "$ref": "#/definitions/Variable"
            }
        }
    };
    refVal5.errors = null;
    refVal[5] = refVal5;
    var refVal6 = (function () {
        var pattern0 = new RegExp('.+');
        var pattern1 = new RegExp('^[a-zA-Z0-9._:-]+$');
        return function validate(data, dataPath, parentData, parentDataProperty, rootData) {
            'use strict';
            var vErrors = null;
            var errors = 0;
            if (rootData === undefined)
                rootData = data;
            if ((data && typeof data === "object" && !Array.isArray(data))) {
                var errs__0 = errors;
                var valid1 = true;
                for (var key0 in data) {
                    var isAdditional0 = !(false || key0 == 'name' || key0 == 'type' || key0 == 'component' || key0 == 'options' || key0 == 'parameters' || key0 == 'validation');
                    if (isAdditional0) {
                        valid1 = false;
                        var err = {
                            keyword: 'additionalProperties',
                            dataPath: (dataPath || '') + "",
                            schemaPath: '#/additionalProperties',
                            params: {
                                additionalProperty: '' + key0 + ''
                            },
                            message: 'should NOT have additional properties'
                        };
                        if (vErrors === null)
                            vErrors = [err];
                        else
                            vErrors.push(err);
                        errors++;
                    }
                }
                var data1 = data.name;
                if (data1 === undefined) {
                    valid1 = false;
                    var err = {
                        keyword: 'required',
                        dataPath: (dataPath || '') + "",
                        schemaPath: '#/required',
                        params: {
                            missingProperty: 'name'
                        },
                        message: 'should have required property \'name\''
                    };
                    if (vErrors === null)
                        vErrors = [err];
                    else
                        vErrors.push(err);
                    errors++;
                }
                else {
                    var errs_1 = errors;
                    if (typeof data1 === "string") {
                        if (!pattern1.test(data1)) {
                            var err = {
                                keyword: 'pattern',
                                dataPath: (dataPath || '') + '.name',
                                schemaPath: '#/properties/name/pattern',
                                params: {
                                    pattern: '^[a-zA-Z0-9._:-]+$'
                                },
                                message: 'should match pattern "^[a-zA-Z0-9._:-]+$"'
                            };
                            if (vErrors === null)
                                vErrors = [err];
                            else
                                vErrors.push(err);
                            errors++;
                        }
                    }
                    else {
                        var err = {
                            keyword: 'type',
                            dataPath: (dataPath || '') + '.name',
                            schemaPath: '#/properties/name/type',
                            params: {
                                type: 'string'
                            },
                            message: 'should be string'
                        };
                        if (vErrors === null)
                            vErrors = [err];
                        else
                            vErrors.push(err);
                        errors++;
                    }
                    var valid1 = errors === errs_1;
                }
                var data1 = data.type;
                if (data1 === undefined) {
                    valid1 = false;
                    var err = {
                        keyword: 'required',
                        dataPath: (dataPath || '') + "",
                        schemaPath: '#/required',
                        params: {
                            missingProperty: 'type'
                        },
                        message: 'should have required property \'type\''
                    };
                    if (vErrors === null)
                        vErrors = [err];
                    else
                        vErrors.push(err);
                    errors++;
                }
                else {
                    var errs_1 = errors;
                    if (typeof data1 !== "string") {
                        var err = {
                            keyword: 'type',
                            dataPath: (dataPath || '') + '.type',
                            schemaPath: '#/properties/type/type',
                            params: {
                                type: 'string'
                            },
                            message: 'should be string'
                        };
                        if (vErrors === null)
                            vErrors = [err];
                        else
                            vErrors.push(err);
                        errors++;
                    }
                    var schema1 = validate.schema.properties.type.enum;
                    var valid1;
                    valid1 = false;
                    for (var i1 = 0; i1 < schema1.length; i1++)
                        if (equal(data1, schema1[i1])) {
                            valid1 = true;
                            break;
                        }
                    if (!valid1) {
                        var err = {
                            keyword: 'enum',
                            dataPath: (dataPath || '') + '.type',
                            schemaPath: '#/properties/type/enum',
                            params: {
                                allowedValues: schema1
                            },
                            message: 'should be equal to one of the allowed values'
                        };
                        if (vErrors === null)
                            vErrors = [err];
                        else
                            vErrors.push(err);
                        errors++;
                    }
                    var valid1 = errors === errs_1;
                }
                var data1 = data.component;
                if (data1 !== undefined) {
                    var errs_1 = errors;
                    if (typeof data1 !== "string") {
                        var err = {
                            keyword: 'type',
                            dataPath: (dataPath || '') + '.component',
                            schemaPath: '#/properties/component/type',
                            params: {
                                type: 'string'
                            },
                            message: 'should be string'
                        };
                        if (vErrors === null)
                            vErrors = [err];
                        else
                            vErrors.push(err);
                        errors++;
                    }
                    var schema1 = validate.schema.properties.component.enum;
                    var valid1;
                    valid1 = false;
                    for (var i1 = 0; i1 < schema1.length; i1++)
                        if (equal(data1, schema1[i1])) {
                            valid1 = true;
                            break;
                        }
                    if (!valid1) {
                        var err = {
                            keyword: 'enum',
                            dataPath: (dataPath || '') + '.component',
                            schemaPath: '#/properties/component/enum',
                            params: {
                                allowedValues: schema1
                            },
                            message: 'should be equal to one of the allowed values'
                        };
                        if (vErrors === null)
                            vErrors = [err];
                        else
                            vErrors.push(err);
                        errors++;
                    }
                    var valid1 = errors === errs_1;
                }
                var data1 = data.options;
                if (data1 !== undefined) {
                    var errs_1 = errors;
                    if (Array.isArray(data1)) {
                        var errs__1 = errors;
                        var valid1;
                        for (var i1 = 0; i1 < data1.length; i1++) {
                            var errs_2 = errors;
                            if (!refVal7(data1[i1], (dataPath || '') + '.options[' + i1 + ']', data1, i1, rootData)) {
                                if (vErrors === null)
                                    vErrors = refVal7.errors;
                                else
                                    vErrors = vErrors.concat(refVal7.errors);
                                errors = vErrors.length;
                            }
                            var valid2 = errors === errs_2;
                        }
                    }
                    else {
                        var err = {
                            keyword: 'type',
                            dataPath: (dataPath || '') + '.options',
                            schemaPath: '#/properties/options/type',
                            params: {
                                type: 'array'
                            },
                            message: 'should be array'
                        };
                        if (vErrors === null)
                            vErrors = [err];
                        else
                            vErrors.push(err);
                        errors++;
                    }
                    var valid1 = errors === errs_1;
                }
                var data1 = data.parameters;
                if (data1 !== undefined) {
                    var errs_1 = errors;
                    if ((!data1 || typeof data1 !== "object" || Array.isArray(data1))) {
                        var err = {
                            keyword: 'type',
                            dataPath: (dataPath || '') + '.parameters',
                            schemaPath: '#/properties/parameters/type',
                            params: {
                                type: 'object'
                            },
                            message: 'should be object'
                        };
                        if (vErrors === null)
                            vErrors = [err];
                        else
                            vErrors.push(err);
                        errors++;
                    }
                    var valid1 = errors === errs_1;
                }
                var data1 = data.validation;
                if (data1 !== undefined) {
                    var errs_1 = errors;
                    var errs_2 = errors;
                    if ((data1 && typeof data1 === "object" && !Array.isArray(data1))) {
                        var errs__2 = errors;
                        var valid3 = true;
                        for (var key2 in data1) {
                            var isAdditional2 = !(false || refVal10.properties.hasOwnProperty(key2));
                            if (isAdditional2) {
                                valid3 = false;
                                var err = {
                                    keyword: 'additionalProperties',
                                    dataPath: (dataPath || '') + '.validation',
                                    schemaPath: '#/definitions/Validation/additionalProperties',
                                    params: {
                                        additionalProperty: '' + key2 + ''
                                    },
                                    message: 'should NOT have additional properties'
                                };
                                if (vErrors === null)
                                    vErrors = [err];
                                else
                                    vErrors.push(err);
                                errors++;
                            }
                        }
                        if (data1.required !== undefined) {
                            var errs_3 = errors;
                            if (typeof data1.required !== "boolean") {
                                var err = {
                                    keyword: 'type',
                                    dataPath: (dataPath || '') + '.validation.required',
                                    schemaPath: '#/definitions/Validation/properties/required/type',
                                    params: {
                                        type: 'boolean'
                                    },
                                    message: 'should be boolean'
                                };
                                if (vErrors === null)
                                    vErrors = [err];
                                else
                                    vErrors.push(err);
                                errors++;
                            }
                            var valid3 = errors === errs_3;
                        }
                        if (data1.requiredAcceptsNull !== undefined) {
                            var errs_3 = errors;
                            if (typeof data1.requiredAcceptsNull !== "boolean") {
                                var err = {
                                    keyword: 'type',
                                    dataPath: (dataPath || '') + '.validation.requiredAcceptsNull',
                                    schemaPath: '#/definitions/Validation/properties/requiredAcceptsNull/type',
                                    params: {
                                        type: 'boolean'
                                    },
                                    message: 'should be boolean'
                                };
                                if (vErrors === null)
                                    vErrors = [err];
                                else
                                    vErrors.push(err);
                                errors++;
                            }
                            var valid3 = errors === errs_3;
                        }
                        var data2 = data1.minLength;
                        if (data2 !== undefined) {
                            var errs_3 = errors;
                            if ((typeof data2 !== "number" || (data2 % 1) || data2 !== data2)) {
                                var err = {
                                    keyword: 'type',
                                    dataPath: (dataPath || '') + '.validation.minLength',
                                    schemaPath: '#/definitions/Validation/properties/minLength/type',
                                    params: {
                                        type: 'integer'
                                    },
                                    message: 'should be integer'
                                };
                                if (vErrors === null)
                                    vErrors = [err];
                                else
                                    vErrors.push(err);
                                errors++;
                            }
                            var valid3 = errors === errs_3;
                        }
                        var data2 = data1.maxLength;
                        if (data2 !== undefined) {
                            var errs_3 = errors;
                            if ((typeof data2 !== "number" || (data2 % 1) || data2 !== data2)) {
                                var err = {
                                    keyword: 'type',
                                    dataPath: (dataPath || '') + '.validation.maxLength',
                                    schemaPath: '#/definitions/Validation/properties/maxLength/type',
                                    params: {
                                        type: 'integer'
                                    },
                                    message: 'should be integer'
                                };
                                if (vErrors === null)
                                    vErrors = [err];
                                else
                                    vErrors.push(err);
                                errors++;
                            }
                            var valid3 = errors === errs_3;
                        }
                        var data2 = data1.minValue;
                        if (data2 !== undefined) {
                            var errs_3 = errors;
                            if ((typeof data2 !== "number" || (data2 % 1) || data2 !== data2)) {
                                var err = {
                                    keyword: 'type',
                                    dataPath: (dataPath || '') + '.validation.minValue',
                                    schemaPath: '#/definitions/Validation/properties/minValue/type',
                                    params: {
                                        type: 'integer'
                                    },
                                    message: 'should be integer'
                                };
                                if (vErrors === null)
                                    vErrors = [err];
                                else
                                    vErrors.push(err);
                                errors++;
                            }
                            var valid3 = errors === errs_3;
                        }
                        var data2 = data1.maxValue;
                        if (data2 !== undefined) {
                            var errs_3 = errors;
                            if ((typeof data2 !== "number" || (data2 % 1) || data2 !== data2)) {
                                var err = {
                                    keyword: 'type',
                                    dataPath: (dataPath || '') + '.validation.maxValue',
                                    schemaPath: '#/definitions/Validation/properties/maxValue/type',
                                    params: {
                                        type: 'integer'
                                    },
                                    message: 'should be integer'
                                };
                                if (vErrors === null)
                                    vErrors = [err];
                                else
                                    vErrors.push(err);
                                errors++;
                            }
                            var valid3 = errors === errs_3;
                        }
                        var data2 = data1.minSelected;
                        if (data2 !== undefined) {
                            var errs_3 = errors;
                            if ((typeof data2 !== "number" || (data2 % 1) || data2 !== data2)) {
                                var err = {
                                    keyword: 'type',
                                    dataPath: (dataPath || '') + '.validation.minSelected',
                                    schemaPath: '#/definitions/Validation/properties/minSelected/type',
                                    params: {
                                        type: 'integer'
                                    },
                                    message: 'should be integer'
                                };
                                if (vErrors === null)
                                    vErrors = [err];
                                else
                                    vErrors.push(err);
                                errors++;
                            }
                            var valid3 = errors === errs_3;
                        }
                        var data2 = data1.maxSelected;
                        if (data2 !== undefined) {
                            var errs_3 = errors;
                            if ((typeof data2 !== "number" || (data2 % 1) || data2 !== data2)) {
                                var err = {
                                    keyword: 'type',
                                    dataPath: (dataPath || '') + '.validation.maxSelected',
                                    schemaPath: '#/definitions/Validation/properties/maxSelected/type',
                                    params: {
                                        type: 'integer'
                                    },
                                    message: 'should be integer'
                                };
                                if (vErrors === null)
                                    vErrors = [err];
                                else
                                    vErrors.push(err);
                                errors++;
                            }
                            var valid3 = errors === errs_3;
                        }
                        if (data1.unique !== undefined) {
                            var errs_3 = errors;
                            if (typeof data1.unique !== "boolean") {
                                var err = {
                                    keyword: 'type',
                                    dataPath: (dataPath || '') + '.validation.unique',
                                    schemaPath: '#/definitions/Validation/properties/unique/type',
                                    params: {
                                        type: 'boolean'
                                    },
                                    message: 'should be boolean'
                                };
                                if (vErrors === null)
                                    vErrors = [err];
                                else
                                    vErrors.push(err);
                                errors++;
                            }
                            var valid3 = errors === errs_3;
                        }
                        if (data1.differentFrom !== undefined) {
                            var errs_3 = errors;
                            if (typeof data1.differentFrom !== "string") {
                                var err = {
                                    keyword: 'type',
                                    dataPath: (dataPath || '') + '.validation.differentFrom',
                                    schemaPath: '#/definitions/Validation/properties/differentFrom/type',
                                    params: {
                                        type: 'string'
                                    },
                                    message: 'should be string'
                                };
                                if (vErrors === null)
                                    vErrors = [err];
                                else
                                    vErrors.push(err);
                                errors++;
                            }
                            var valid3 = errors === errs_3;
                        }
                        if (data1.sameAs !== undefined) {
                            var errs_3 = errors;
                            if (typeof data1.sameAs !== "string") {
                                var err = {
                                    keyword: 'type',
                                    dataPath: (dataPath || '') + '.validation.sameAs',
                                    schemaPath: '#/definitions/Validation/properties/sameAs/type',
                                    params: {
                                        type: 'string'
                                    },
                                    message: 'should be string'
                                };
                                if (vErrors === null)
                                    vErrors = [err];
                                else
                                    vErrors.push(err);
                                errors++;
                            }
                            var valid3 = errors === errs_3;
                        }
                    }
                    else {
                        var err = {
                            keyword: 'type',
                            dataPath: (dataPath || '') + '.validation',
                            schemaPath: '#/definitions/Validation/type',
                            params: {
                                type: 'object'
                            },
                            message: 'should be object'
                        };
                        if (vErrors === null)
                            vErrors = [err];
                        else
                            vErrors.push(err);
                        errors++;
                    }
                    var valid2 = errors === errs_2;
                    var valid1 = errors === errs_1;
                }
            }
            else {
                var err = {
                    keyword: 'type',
                    dataPath: (dataPath || '') + "",
                    schemaPath: '#/type',
                    params: {
                        type: 'object'
                    },
                    message: 'should be object'
                };
                if (vErrors === null)
                    vErrors = [err];
                else
                    vErrors.push(err);
                errors++;
            }
            validate.errors = vErrors;
            return errors === 0;
        };
    })();
    refVal6.schema = {
        "type": "object",
        "additionalProperties": false,
        "properties": {
            "name": {
                "type": "string",
                "pattern": "^[a-zA-Z0-9._:-]+$"
            },
            "type": {
                "type": "string",
                "enum": ["boolean", "text", "number", "datetime", "ordinal", "scalar", "categorical", "layout", "location"]
            },
            "component": {
                "type": "string",
                "enum": ["Boolean", "CheckboxGroup", "Number", "RadioGroup", "Text", "TextArea", "Toggle", "ToggleButtonGroup", "Slider", "VisualAnalogScale", "LikertScale", "DatePicker", "RelativeDatePicker"]
            },
            "options": {
                "type": "array",
                "items": {
                    "$ref": "#/definitions/OptionElement"
                }
            },
            "parameters": {
                "type": "object"
            },
            "validation": {
                "$ref": "#/definitions/Validation"
            }
        },
        "required": ["type", "name"],
        "title": "Variable"
    };
    refVal6.errors = null;
    refVal[6] = refVal6;
    var refVal7 = (function () {
        var pattern0 = new RegExp('.+');
        var pattern1 = new RegExp('^[a-zA-Z0-9._:-]+$');
        return function validate(data, dataPath, parentData, parentDataProperty, rootData) {
            'use strict';
            var vErrors = null;
            var errors = 0;
            if (rootData === undefined)
                rootData = data;
            var errs__0 = errors;
            var valid0 = false;
            var errs_1 = errors;
            if (!refVal8(data, (dataPath || ''), parentData, parentDataProperty, rootData)) {
                if (vErrors === null)
                    vErrors = refVal8.errors;
                else
                    vErrors = vErrors.concat(refVal8.errors);
                errors = vErrors.length;
            }
            var valid1 = errors === errs_1;
            valid0 = valid0 || valid1;
            if (!valid0) {
                var errs_1 = errors;
                if ((typeof data !== "number" || (data % 1) || data !== data)) {
                    var err = {
                        keyword: 'type',
                        dataPath: (dataPath || '') + "",
                        schemaPath: '#/anyOf/1/type',
                        params: {
                            type: 'integer'
                        },
                        message: 'should be integer'
                    };
                    if (vErrors === null)
                        vErrors = [err];
                    else
                        vErrors.push(err);
                    errors++;
                }
                var valid1 = errors === errs_1;
                valid0 = valid0 || valid1;
                if (!valid0) {
                    var errs_1 = errors;
                    if (typeof data !== "string") {
                        var err = {
                            keyword: 'type',
                            dataPath: (dataPath || '') + "",
                            schemaPath: '#/anyOf/2/type',
                            params: {
                                type: 'string'
                            },
                            message: 'should be string'
                        };
                        if (vErrors === null)
                            vErrors = [err];
                        else
                            vErrors.push(err);
                        errors++;
                    }
                    var valid1 = errors === errs_1;
                    valid0 = valid0 || valid1;
                }
            }
            if (!valid0) {
                var err = {
                    keyword: 'anyOf',
                    dataPath: (dataPath || '') + "",
                    schemaPath: '#/anyOf',
                    params: {},
                    message: 'should match some schema in anyOf'
                };
                if (vErrors === null)
                    vErrors = [err];
                else
                    vErrors.push(err);
                errors++;
            }
            else {
                errors = errs__0;
                if (vErrors !== null) {
                    if (errs__0)
                        vErrors.length = errs__0;
                    else
                        vErrors = null;
                }
            }
            validate.errors = vErrors;
            return errors === 0;
        };
    })();
    refVal7.schema = {
        "anyOf": [{
                "$ref": "#/definitions/OptionClass"
            }, {
                "type": "integer"
            }, {
                "type": "string"
            }],
        "title": "Variable Option"
    };
    refVal7.errors = null;
    refVal[7] = refVal7;
    var refVal8 = (function () {
        var pattern0 = new RegExp('.+');
        var pattern1 = new RegExp('^[a-zA-Z0-9._:-]+$');
        return function validate(data, dataPath, parentData, parentDataProperty, rootData) {
            'use strict';
            var vErrors = null;
            var errors = 0;
            if ((data && typeof data === "object" && !Array.isArray(data))) {
                var errs__0 = errors;
                var valid1 = true;
                for (var key0 in data) {
                    var isAdditional0 = !(false || key0 == 'label' || key0 == 'value' || key0 == 'negative');
                    if (isAdditional0) {
                        valid1 = false;
                        var err = {
                            keyword: 'additionalProperties',
                            dataPath: (dataPath || '') + "",
                            schemaPath: '#/additionalProperties',
                            params: {
                                additionalProperty: '' + key0 + ''
                            },
                            message: 'should NOT have additional properties'
                        };
                        if (vErrors === null)
                            vErrors = [err];
                        else
                            vErrors.push(err);
                        errors++;
                    }
                }
                if (data.label === undefined) {
                    valid1 = false;
                    var err = {
                        keyword: 'required',
                        dataPath: (dataPath || '') + "",
                        schemaPath: '#/required',
                        params: {
                            missingProperty: 'label'
                        },
                        message: 'should have required property \'label\''
                    };
                    if (vErrors === null)
                        vErrors = [err];
                    else
                        vErrors.push(err);
                    errors++;
                }
                else {
                    var errs_1 = errors;
                    if (typeof data.label !== "string") {
                        var err = {
                            keyword: 'type',
                            dataPath: (dataPath || '') + '.label',
                            schemaPath: '#/properties/label/type',
                            params: {
                                type: 'string'
                            },
                            message: 'should be string'
                        };
                        if (vErrors === null)
                            vErrors = [err];
                        else
                            vErrors.push(err);
                        errors++;
                    }
                    var valid1 = errors === errs_1;
                }
                var data1 = data.value;
                if (data1 === undefined) {
                    valid1 = false;
                    var err = {
                        keyword: 'required',
                        dataPath: (dataPath || '') + "",
                        schemaPath: '#/required',
                        params: {
                            missingProperty: 'value'
                        },
                        message: 'should have required property \'value\''
                    };
                    if (vErrors === null)
                        vErrors = [err];
                    else
                        vErrors.push(err);
                    errors++;
                }
                else {
                    var errs_1 = errors;
                    var errs_2 = errors;
                    var errs__2 = errors;
                    var valid2 = false;
                    var errs_3 = errors;
                    if ((typeof data1 !== "number" || (data1 % 1) || data1 !== data1)) {
                        var err = {
                            keyword: 'type',
                            dataPath: (dataPath || '') + '.value',
                            schemaPath: '#/definitions/Value/anyOf/0/type',
                            params: {
                                type: 'integer'
                            },
                            message: 'should be integer'
                        };
                        if (vErrors === null)
                            vErrors = [err];
                        else
                            vErrors.push(err);
                        errors++;
                    }
                    var valid3 = errors === errs_3;
                    valid2 = valid2 || valid3;
                    if (!valid2) {
                        var errs_3 = errors;
                        if (typeof data1 === "string") {
                            if (!pattern1.test(data1)) {
                                var err = {
                                    keyword: 'pattern',
                                    dataPath: (dataPath || '') + '.value',
                                    schemaPath: '#/definitions/Value/anyOf/1/pattern',
                                    params: {
                                        pattern: '^[a-zA-Z0-9._:-]+$'
                                    },
                                    message: 'should match pattern "^[a-zA-Z0-9._:-]+$"'
                                };
                                if (vErrors === null)
                                    vErrors = [err];
                                else
                                    vErrors.push(err);
                                errors++;
                            }
                        }
                        else {
                            var err = {
                                keyword: 'type',
                                dataPath: (dataPath || '') + '.value',
                                schemaPath: '#/definitions/Value/anyOf/1/type',
                                params: {
                                    type: 'string'
                                },
                                message: 'should be string'
                            };
                            if (vErrors === null)
                                vErrors = [err];
                            else
                                vErrors.push(err);
                            errors++;
                        }
                        var valid3 = errors === errs_3;
                        valid2 = valid2 || valid3;
                        if (!valid2) {
                            var errs_3 = errors;
                            if (typeof data1 !== "boolean") {
                                var err = {
                                    keyword: 'type',
                                    dataPath: (dataPath || '') + '.value',
                                    schemaPath: '#/definitions/Value/anyOf/2/type',
                                    params: {
                                        type: 'boolean'
                                    },
                                    message: 'should be boolean'
                                };
                                if (vErrors === null)
                                    vErrors = [err];
                                else
                                    vErrors.push(err);
                                errors++;
                            }
                            var valid3 = errors === errs_3;
                            valid2 = valid2 || valid3;
                        }
                    }
                    if (!valid2) {
                        var err = {
                            keyword: 'anyOf',
                            dataPath: (dataPath || '') + '.value',
                            schemaPath: '#/definitions/Value/anyOf',
                            params: {},
                            message: 'should match some schema in anyOf'
                        };
                        if (vErrors === null)
                            vErrors = [err];
                        else
                            vErrors.push(err);
                        errors++;
                    }
                    else {
                        errors = errs__2;
                        if (vErrors !== null) {
                            if (errs__2)
                                vErrors.length = errs__2;
                            else
                                vErrors = null;
                        }
                    }
                    var valid2 = errors === errs_2;
                    var valid1 = errors === errs_1;
                }
                if (data.negative !== undefined) {
                    var errs_1 = errors;
                    if (typeof data.negative !== "boolean") {
                        var err = {
                            keyword: 'type',
                            dataPath: (dataPath || '') + '.negative',
                            schemaPath: '#/properties/negative/type',
                            params: {
                                type: 'boolean'
                            },
                            message: 'should be boolean'
                        };
                        if (vErrors === null)
                            vErrors = [err];
                        else
                            vErrors.push(err);
                        errors++;
                    }
                    var valid1 = errors === errs_1;
                }
            }
            else {
                var err = {
                    keyword: 'type',
                    dataPath: (dataPath || '') + "",
                    schemaPath: '#/type',
                    params: {
                        type: 'object'
                    },
                    message: 'should be object'
                };
                if (vErrors === null)
                    vErrors = [err];
                else
                    vErrors.push(err);
                errors++;
            }
            validate.errors = vErrors;
            return errors === 0;
        };
    })();
    refVal8.schema = {
        "type": "object",
        "additionalProperties": false,
        "properties": {
            "label": {
                "type": "string"
            },
            "value": {
                "$ref": "#/definitions/Value"
            },
            "negative": {
                "type": "boolean"
            }
        },
        "required": ["label", "value"],
        "title": "OptionClass"
    };
    refVal8.errors = null;
    refVal[8] = refVal8;
    var refVal9 = {
        "anyOf": [{
                "type": "integer"
            }, {
                "type": "string",
                "pattern": "^[a-zA-Z0-9._:-]+$"
            }, {
                "type": "boolean"
            }],
        "title": "Value"
    };
    refVal[9] = refVal9;
    var refVal10 = {
        "type": "object",
        "additionalProperties": false,
        "properties": {
            "required": {
                "type": "boolean"
            },
            "requiredAcceptsNull": {
                "type": "boolean"
            },
            "minLength": {
                "type": "integer"
            },
            "maxLength": {
                "type": "integer"
            },
            "minValue": {
                "type": "integer"
            },
            "maxValue": {
                "type": "integer"
            },
            "minSelected": {
                "type": "integer"
            },
            "maxSelected": {
                "type": "integer"
            },
            "unique": {
                "type": "boolean"
            },
            "differentFrom": {
                "type": "string"
            },
            "sameAs": {
                "type": "string"
            }
        },
        "title": "Validation"
    };
    refVal[10] = refVal10;
    var refVal11 = (function () {
        var pattern0 = new RegExp('.+');
        var pattern1 = new RegExp('^[a-zA-Z0-9._:-]+$');
        return function validate(data, dataPath, parentData, parentDataProperty, rootData) {
            'use strict';
            var vErrors = null;
            var errors = 0;
            if (rootData === undefined)
                rootData = data;
            if ((data && typeof data === "object" && !Array.isArray(data))) {
                var errs__0 = errors;
                var valid1 = true;
                for (var key0 in data) {
                    var isAdditional0 = !(false || pattern0.test(key0));
                    if (isAdditional0) {
                        valid1 = false;
                        var err = {
                            keyword: 'additionalProperties',
                            dataPath: (dataPath || '') + "",
                            schemaPath: '#/additionalProperties',
                            params: {
                                additionalProperty: '' + key0 + ''
                            },
                            message: 'should NOT have additional properties'
                        };
                        if (vErrors === null)
                            vErrors = [err];
                        else
                            vErrors.push(err);
                        errors++;
                    }
                }
                for (var key0 in data) {
                    if (pattern0.test(key0)) {
                        var errs_1 = errors;
                        if (!refVal12(data[key0], (dataPath || '') + '[\'' + key0 + '\']', data, key0, rootData)) {
                            if (vErrors === null)
                                vErrors = refVal12.errors;
                            else
                                vErrors = vErrors.concat(refVal12.errors);
                            errors = vErrors.length;
                        }
                        var valid1 = errors === errs_1;
                    }
                }
            }
            else {
                var err = {
                    keyword: 'type',
                    dataPath: (dataPath || '') + "",
                    schemaPath: '#/type',
                    params: {
                        type: 'object'
                    },
                    message: 'should be object'
                };
                if (vErrors === null)
                    vErrors = [err];
                else
                    vErrors.push(err);
                errors++;
            }
            validate.errors = vErrors;
            return errors === 0;
        };
    })();
    refVal11.schema = {
        "type": "object",
        "additionalProperties": false,
        "title": "Edge",
        "patternProperties": {
            ".+": {
                "$ref": "#/definitions/EdgeTypeDef"
            }
        }
    };
    refVal11.errors = null;
    refVal[11] = refVal11;
    var refVal12 = (function () {
        var pattern0 = new RegExp('.+');
        var pattern1 = new RegExp('^[a-zA-Z0-9._:-]+$');
        return function validate(data, dataPath, parentData, parentDataProperty, rootData) {
            'use strict';
            var vErrors = null;
            var errors = 0;
            if (rootData === undefined)
                rootData = data;
            if ((data && typeof data === "object" && !Array.isArray(data))) {
                var errs__0 = errors;
                var valid1 = true;
                for (var key0 in data) {
                    var isAdditional0 = !(false || key0 == 'name' || key0 == 'color' || key0 == 'variables');
                    if (isAdditional0) {
                        valid1 = false;
                        var err = {
                            keyword: 'additionalProperties',
                            dataPath: (dataPath || '') + "",
                            schemaPath: '#/additionalProperties',
                            params: {
                                additionalProperty: '' + key0 + ''
                            },
                            message: 'should NOT have additional properties'
                        };
                        if (vErrors === null)
                            vErrors = [err];
                        else
                            vErrors.push(err);
                        errors++;
                    }
                }
                if (data.name === undefined) {
                    valid1 = false;
                    var err = {
                        keyword: 'required',
                        dataPath: (dataPath || '') + "",
                        schemaPath: '#/required',
                        params: {
                            missingProperty: 'name'
                        },
                        message: 'should have required property \'name\''
                    };
                    if (vErrors === null)
                        vErrors = [err];
                    else
                        vErrors.push(err);
                    errors++;
                }
                else {
                    var errs_1 = errors;
                    if (typeof data.name !== "string") {
                        var err = {
                            keyword: 'type',
                            dataPath: (dataPath || '') + '.name',
                            schemaPath: '#/properties/name/type',
                            params: {
                                type: 'string'
                            },
                            message: 'should be string'
                        };
                        if (vErrors === null)
                            vErrors = [err];
                        else
                            vErrors.push(err);
                        errors++;
                    }
                    var valid1 = errors === errs_1;
                }
                if (data.color === undefined) {
                    valid1 = false;
                    var err = {
                        keyword: 'required',
                        dataPath: (dataPath || '') + "",
                        schemaPath: '#/required',
                        params: {
                            missingProperty: 'color'
                        },
                        message: 'should have required property \'color\''
                    };
                    if (vErrors === null)
                        vErrors = [err];
                    else
                        vErrors.push(err);
                    errors++;
                }
                else {
                    var errs_1 = errors;
                    if (typeof data.color !== "string") {
                        var err = {
                            keyword: 'type',
                            dataPath: (dataPath || '') + '.color',
                            schemaPath: '#/properties/color/type',
                            params: {
                                type: 'string'
                            },
                            message: 'should be string'
                        };
                        if (vErrors === null)
                            vErrors = [err];
                        else
                            vErrors.push(err);
                        errors++;
                    }
                    var valid1 = errors === errs_1;
                }
                if (data.variables !== undefined) {
                    var errs_1 = errors;
                    if (!refVal[5](data.variables, (dataPath || '') + '.variables', data, 'variables', rootData)) {
                        if (vErrors === null)
                            vErrors = refVal[5].errors;
                        else
                            vErrors = vErrors.concat(refVal[5].errors);
                        errors = vErrors.length;
                    }
                    var valid1 = errors === errs_1;
                }
            }
            else {
                var err = {
                    keyword: 'type',
                    dataPath: (dataPath || '') + "",
                    schemaPath: '#/type',
                    params: {
                        type: 'object'
                    },
                    message: 'should be object'
                };
                if (vErrors === null)
                    vErrors = [err];
                else
                    vErrors.push(err);
                errors++;
            }
            validate.errors = vErrors;
            return errors === 0;
        };
    })();
    refVal12.schema = {
        "type": "object",
        "additionalProperties": false,
        "properties": {
            "name": {
                "type": "string"
            },
            "color": {
                "type": "string"
            },
            "variables": {
                "$ref": "#/definitions/Variables"
            }
        },
        "required": ["name", "color"],
        "title": "EdgeTypeDef"
    };
    refVal12.errors = null;
    refVal[12] = refVal12;
    var refVal13 = (function () {
        var pattern0 = new RegExp('.+');
        var pattern1 = new RegExp('^[a-zA-Z0-9._:-]+$');
        return function validate(data, dataPath, parentData, parentDataProperty, rootData) {
            'use strict';
            var vErrors = null;
            var errors = 0;
            if (rootData === undefined)
                rootData = data;
            if ((data && typeof data === "object" && !Array.isArray(data))) {
                var errs__0 = errors;
                var valid1 = true;
                for (var key0 in data) {
                    var isAdditional0 = !(false || key0 == 'variables');
                    if (isAdditional0) {
                        valid1 = false;
                        var err = {
                            keyword: 'additionalProperties',
                            dataPath: (dataPath || '') + "",
                            schemaPath: '#/additionalProperties',
                            params: {
                                additionalProperty: '' + key0 + ''
                            },
                            message: 'should NOT have additional properties'
                        };
                        if (vErrors === null)
                            vErrors = [err];
                        else
                            vErrors.push(err);
                        errors++;
                    }
                }
                if (data.variables !== undefined) {
                    var errs_1 = errors;
                    if (!refVal[5](data.variables, (dataPath || '') + '.variables', data, 'variables', rootData)) {
                        if (vErrors === null)
                            vErrors = refVal[5].errors;
                        else
                            vErrors = vErrors.concat(refVal[5].errors);
                        errors = vErrors.length;
                    }
                    var valid1 = errors === errs_1;
                }
            }
            validate.errors = vErrors;
            return errors === 0;
        };
    })();
    refVal13.schema = {
        "type:": "object",
        "additionalProperties": false,
        "properties": {
            "variables": {
                "$ref": "#/definitions/Variables"
            }
        }
    };
    refVal13.errors = null;
    refVal[13] = refVal13;
    var refVal14 = {
        "type": "object",
        "title": "AssetManifest"
    };
    refVal[14] = refVal14;
    var refVal15 = (function () {
        var pattern0 = new RegExp('.+');
        var pattern1 = new RegExp('^[a-zA-Z0-9._:-]+$');
        return function validate(data, dataPath, parentData, parentDataProperty, rootData) {
            'use strict';
            var vErrors = null;
            var errors = 0;
            if (rootData === undefined)
                rootData = data;
            if ((data && typeof data === "object" && !Array.isArray(data))) {
                var errs__0 = errors;
                var valid1 = true;
                for (var key0 in data) {
                    var isAdditional0 = !(false || validate.schema.properties.hasOwnProperty(key0));
                    if (isAdditional0) {
                        valid1 = false;
                        var err = {
                            keyword: 'additionalProperties',
                            dataPath: (dataPath || '') + "",
                            schemaPath: '#/additionalProperties',
                            params: {
                                additionalProperty: '' + key0 + ''
                            },
                            message: 'should NOT have additional properties'
                        };
                        if (vErrors === null)
                            vErrors = [err];
                        else
                            vErrors.push(err);
                        errors++;
                    }
                }
                if (data.id === undefined) {
                    valid1 = false;
                    var err = {
                        keyword: 'required',
                        dataPath: (dataPath || '') + "",
                        schemaPath: '#/required',
                        params: {
                            missingProperty: 'id'
                        },
                        message: 'should have required property \'id\''
                    };
                    if (vErrors === null)
                        vErrors = [err];
                    else
                        vErrors.push(err);
                    errors++;
                }
                else {
                    var errs_1 = errors;
                    if (typeof data.id !== "string") {
                        var err = {
                            keyword: 'type',
                            dataPath: (dataPath || '') + '.id',
                            schemaPath: '#/properties/id/type',
                            params: {
                                type: 'string'
                            },
                            message: 'should be string'
                        };
                        if (vErrors === null)
                            vErrors = [err];
                        else
                            vErrors.push(err);
                        errors++;
                    }
                    var valid1 = errors === errs_1;
                }
                if (data.interviewScript !== undefined) {
                    var errs_1 = errors;
                    if (typeof data.interviewScript !== "string") {
                        var err = {
                            keyword: 'type',
                            dataPath: (dataPath || '') + '.interviewScript',
                            schemaPath: '#/properties/interviewScript/type',
                            params: {
                                type: 'string'
                            },
                            message: 'should be string'
                        };
                        if (vErrors === null)
                            vErrors = [err];
                        else
                            vErrors.push(err);
                        errors++;
                    }
                    var valid1 = errors === errs_1;
                }
                var data1 = data.type;
                if (data1 === undefined) {
                    valid1 = false;
                    var err = {
                        keyword: 'required',
                        dataPath: (dataPath || '') + "",
                        schemaPath: '#/required',
                        params: {
                            missingProperty: 'type'
                        },
                        message: 'should have required property \'type\''
                    };
                    if (vErrors === null)
                        vErrors = [err];
                    else
                        vErrors.push(err);
                    errors++;
                }
                else {
                    var errs_1 = errors;
                    if (typeof data1 !== "string") {
                        var err = {
                            keyword: 'type',
                            dataPath: (dataPath || '') + '.type',
                            schemaPath: '#/properties/type/type',
                            params: {
                                type: 'string'
                            },
                            message: 'should be string'
                        };
                        if (vErrors === null)
                            vErrors = [err];
                        else
                            vErrors.push(err);
                        errors++;
                    }
                    var schema1 = validate.schema.properties.type.enum;
                    var valid1;
                    valid1 = false;
                    for (var i1 = 0; i1 < schema1.length; i1++)
                        if (equal(data1, schema1[i1])) {
                            valid1 = true;
                            break;
                        }
                    if (!valid1) {
                        var err = {
                            keyword: 'enum',
                            dataPath: (dataPath || '') + '.type',
                            schemaPath: '#/properties/type/enum',
                            params: {
                                allowedValues: schema1
                            },
                            message: 'should be equal to one of the allowed values'
                        };
                        if (vErrors === null)
                            vErrors = [err];
                        else
                            vErrors.push(err);
                        errors++;
                    }
                    var valid1 = errors === errs_1;
                }
                if (data.label === undefined) {
                    valid1 = false;
                    var err = {
                        keyword: 'required',
                        dataPath: (dataPath || '') + "",
                        schemaPath: '#/required',
                        params: {
                            missingProperty: 'label'
                        },
                        message: 'should have required property \'label\''
                    };
                    if (vErrors === null)
                        vErrors = [err];
                    else
                        vErrors.push(err);
                    errors++;
                }
                else {
                    var errs_1 = errors;
                    if (typeof data.label !== "string") {
                        var err = {
                            keyword: 'type',
                            dataPath: (dataPath || '') + '.label',
                            schemaPath: '#/properties/label/type',
                            params: {
                                type: 'string'
                            },
                            message: 'should be string'
                        };
                        if (vErrors === null)
                            vErrors = [err];
                        else
                            vErrors.push(err);
                        errors++;
                    }
                    var valid1 = errors === errs_1;
                }
                if (data.form !== undefined) {
                    var errs_1 = errors;
                    if (!refVal16(data.form, (dataPath || '') + '.form', data, 'form', rootData)) {
                        if (vErrors === null)
                            vErrors = refVal16.errors;
                        else
                            vErrors = vErrors.concat(refVal16.errors);
                        errors = vErrors.length;
                    }
                    var valid1 = errors === errs_1;
                }
                var data1 = data.quickAdd;
                if (data1 !== undefined) {
                    var errs_1 = errors;
                    if (typeof data1 !== "string" && data1 !== null) {
                        var err = {
                            keyword: 'type',
                            dataPath: (dataPath || '') + '.quickAdd',
                            schemaPath: '#/properties/quickAdd/type',
                            params: {
                                type: 'string,null'
                            },
                            message: 'should be string,null'
                        };
                        if (vErrors === null)
                            vErrors = [err];
                        else
                            vErrors.push(err);
                        errors++;
                    }
                    var valid1 = errors === errs_1;
                }
                if (data.createEdge !== undefined) {
                    var errs_1 = errors;
                    if (typeof data.createEdge !== "string") {
                        var err = {
                            keyword: 'type',
                            dataPath: (dataPath || '') + '.createEdge',
                            schemaPath: '#/properties/createEdge/type',
                            params: {
                                type: 'string'
                            },
                            message: 'should be string'
                        };
                        if (vErrors === null)
                            vErrors = [err];
                        else
                            vErrors.push(err);
                        errors++;
                    }
                    var valid1 = errors === errs_1;
                }
                var data1 = data.dataSource;
                if (data1 !== undefined) {
                    var errs_1 = errors;
                    if (typeof data1 !== "string" && data1 !== null) {
                        var err = {
                            keyword: 'type',
                            dataPath: (dataPath || '') + '.dataSource',
                            schemaPath: '#/properties/dataSource/type',
                            params: {
                                type: 'string,null'
                            },
                            message: 'should be string,null'
                        };
                        if (vErrors === null)
                            vErrors = [err];
                        else
                            vErrors.push(err);
                        errors++;
                    }
                    var valid1 = errors === errs_1;
                }
                if (data.subject !== undefined) {
                    var errs_1 = errors;
                    if (!refVal18(data.subject, (dataPath || '') + '.subject', data, 'subject', rootData)) {
                        if (vErrors === null)
                            vErrors = refVal18.errors;
                        else
                            vErrors = vErrors.concat(refVal18.errors);
                        errors = vErrors.length;
                    }
                    var valid1 = errors === errs_1;
                }
                var data1 = data.panels;
                if (data1 !== undefined) {
                    var errs_1 = errors;
                    if (Array.isArray(data1)) {
                        var errs__1 = errors;
                        var valid1;
                        for (var i1 = 0; i1 < data1.length; i1++) {
                            var errs_2 = errors;
                            if (!refVal20(data1[i1], (dataPath || '') + '.panels[' + i1 + ']', data1, i1, rootData)) {
                                if (vErrors === null)
                                    vErrors = refVal20.errors;
                                else
                                    vErrors = vErrors.concat(refVal20.errors);
                                errors = vErrors.length;
                            }
                            var valid2 = errors === errs_2;
                        }
                    }
                    else {
                        var err = {
                            keyword: 'type',
                            dataPath: (dataPath || '') + '.panels',
                            schemaPath: '#/properties/panels/type',
                            params: {
                                type: 'array'
                            },
                            message: 'should be array'
                        };
                        if (vErrors === null)
                            vErrors = [err];
                        else
                            vErrors.push(err);
                        errors++;
                    }
                    var valid1 = errors === errs_1;
                }
                var data1 = data.prompts;
                if (data1 !== undefined) {
                    var errs_1 = errors;
                    if (Array.isArray(data1)) {
                        if (data1.length < 1) {
                            var err = {
                                keyword: 'minItems',
                                dataPath: (dataPath || '') + '.prompts',
                                schemaPath: '#/properties/prompts/minItems',
                                params: {
                                    limit: 1
                                },
                                message: 'should NOT have fewer than 1 items'
                            };
                            if (vErrors === null)
                                vErrors = [err];
                            else
                                vErrors.push(err);
                            errors++;
                        }
                        var errs__1 = errors;
                        var valid1;
                        for (var i1 = 0; i1 < data1.length; i1++) {
                            var errs_2 = errors;
                            if (!refVal24(data1[i1], (dataPath || '') + '.prompts[' + i1 + ']', data1, i1, rootData)) {
                                if (vErrors === null)
                                    vErrors = refVal24.errors;
                                else
                                    vErrors = vErrors.concat(refVal24.errors);
                                errors = vErrors.length;
                            }
                            var valid2 = errors === errs_2;
                        }
                    }
                    else {
                        var err = {
                            keyword: 'type',
                            dataPath: (dataPath || '') + '.prompts',
                            schemaPath: '#/properties/prompts/type',
                            params: {
                                type: 'array'
                            },
                            message: 'should be array'
                        };
                        if (vErrors === null)
                            vErrors = [err];
                        else
                            vErrors.push(err);
                        errors++;
                    }
                    var valid1 = errors === errs_1;
                }
                var data1 = data.presets;
                if (data1 !== undefined) {
                    var errs_1 = errors;
                    if (Array.isArray(data1)) {
                        if (data1.length < 1) {
                            var err = {
                                keyword: 'minItems',
                                dataPath: (dataPath || '') + '.presets',
                                schemaPath: '#/properties/presets/minItems',
                                params: {
                                    limit: 1
                                },
                                message: 'should NOT have fewer than 1 items'
                            };
                            if (vErrors === null)
                                vErrors = [err];
                            else
                                vErrors.push(err);
                            errors++;
                        }
                        var errs__1 = errors;
                        var valid1;
                        for (var i1 = 0; i1 < data1.length; i1++) {
                            var errs_2 = errors;
                            if (!refVal32(data1[i1], (dataPath || '') + '.presets[' + i1 + ']', data1, i1, rootData)) {
                                if (vErrors === null)
                                    vErrors = refVal32.errors;
                                else
                                    vErrors = vErrors.concat(refVal32.errors);
                                errors = vErrors.length;
                            }
                            var valid2 = errors === errs_2;
                        }
                    }
                    else {
                        var err = {
                            keyword: 'type',
                            dataPath: (dataPath || '') + '.presets',
                            schemaPath: '#/properties/presets/type',
                            params: {
                                type: 'array'
                            },
                            message: 'should be array'
                        };
                        if (vErrors === null)
                            vErrors = [err];
                        else
                            vErrors.push(err);
                        errors++;
                    }
                    var valid1 = errors === errs_1;
                }
                var data1 = data.background;
                if (data1 !== undefined) {
                    var errs_1 = errors;
                    if ((!data1 || typeof data1 !== "object" || Array.isArray(data1))) {
                        var err = {
                            keyword: 'type',
                            dataPath: (dataPath || '') + '.background',
                            schemaPath: '#/properties/background/type',
                            params: {
                                type: 'object'
                            },
                            message: 'should be object'
                        };
                        if (vErrors === null)
                            vErrors = [err];
                        else
                            vErrors.push(err);
                        errors++;
                    }
                    if (Array.isArray(data1)) {
                        if (data1.length < 1) {
                            var err = {
                                keyword: 'minItems',
                                dataPath: (dataPath || '') + '.background',
                                schemaPath: '#/properties/background/minItems',
                                params: {
                                    limit: 1
                                },
                                message: 'should NOT have fewer than 1 items'
                            };
                            if (vErrors === null)
                                vErrors = [err];
                            else
                                vErrors.push(err);
                            errors++;
                        }
                        var errs__1 = errors;
                        var valid1;
                        for (var i1 = 0; i1 < data1.length; i1++) {
                            var data2 = data1[i1];
                            var errs_2 = errors;
                            var errs_3 = errors;
                            if ((data2 && typeof data2 === "object" && !Array.isArray(data2))) {
                                var errs__3 = errors;
                                var valid4 = true;
                                for (var key3 in data2) {
                                    var isAdditional3 = !(false || key3 == 'image' || key3 == 'concentricCircles' || key3 == 'skewedTowardCenter');
                                    if (isAdditional3) {
                                        valid4 = false;
                                        var err = {
                                            keyword: 'additionalProperties',
                                            dataPath: (dataPath || '') + '.background[' + i1 + ']',
                                            schemaPath: '#/definitions/Background/additionalProperties',
                                            params: {
                                                additionalProperty: '' + key3 + ''
                                            },
                                            message: 'should NOT have additional properties'
                                        };
                                        if (vErrors === null)
                                            vErrors = [err];
                                        else
                                            vErrors.push(err);
                                        errors++;
                                    }
                                }
                                if (data2.image !== undefined) {
                                    var errs_4 = errors;
                                    if (typeof data2.image !== "string") {
                                        var err = {
                                            keyword: 'type',
                                            dataPath: (dataPath || '') + '.background[' + i1 + '].image',
                                            schemaPath: '#/definitions/Background/properties/image/type',
                                            params: {
                                                type: 'string'
                                            },
                                            message: 'should be string'
                                        };
                                        if (vErrors === null)
                                            vErrors = [err];
                                        else
                                            vErrors.push(err);
                                        errors++;
                                    }
                                    var valid4 = errors === errs_4;
                                }
                                var data3 = data2.concentricCircles;
                                if (data3 === undefined) {
                                    valid4 = false;
                                    var err = {
                                        keyword: 'required',
                                        dataPath: (dataPath || '') + '.background[' + i1 + ']',
                                        schemaPath: '#/definitions/Background/required',
                                        params: {
                                            missingProperty: 'concentricCircles'
                                        },
                                        message: 'should have required property \'concentricCircles\''
                                    };
                                    if (vErrors === null)
                                        vErrors = [err];
                                    else
                                        vErrors.push(err);
                                    errors++;
                                }
                                else {
                                    var errs_4 = errors;
                                    if ((typeof data3 !== "number" || (data3 % 1) || data3 !== data3)) {
                                        var err = {
                                            keyword: 'type',
                                            dataPath: (dataPath || '') + '.background[' + i1 + '].concentricCircles',
                                            schemaPath: '#/definitions/Background/properties/concentricCircles/type',
                                            params: {
                                                type: 'integer'
                                            },
                                            message: 'should be integer'
                                        };
                                        if (vErrors === null)
                                            vErrors = [err];
                                        else
                                            vErrors.push(err);
                                        errors++;
                                    }
                                    var valid4 = errors === errs_4;
                                }
                                if (data2.skewedTowardCenter === undefined) {
                                    valid4 = false;
                                    var err = {
                                        keyword: 'required',
                                        dataPath: (dataPath || '') + '.background[' + i1 + ']',
                                        schemaPath: '#/definitions/Background/required',
                                        params: {
                                            missingProperty: 'skewedTowardCenter'
                                        },
                                        message: 'should have required property \'skewedTowardCenter\''
                                    };
                                    if (vErrors === null)
                                        vErrors = [err];
                                    else
                                        vErrors.push(err);
                                    errors++;
                                }
                                else {
                                    var errs_4 = errors;
                                    if (typeof data2.skewedTowardCenter !== "boolean") {
                                        var err = {
                                            keyword: 'type',
                                            dataPath: (dataPath || '') + '.background[' + i1 + '].skewedTowardCenter',
                                            schemaPath: '#/definitions/Background/properties/skewedTowardCenter/type',
                                            params: {
                                                type: 'boolean'
                                            },
                                            message: 'should be boolean'
                                        };
                                        if (vErrors === null)
                                            vErrors = [err];
                                        else
                                            vErrors.push(err);
                                        errors++;
                                    }
                                    var valid4 = errors === errs_4;
                                }
                            }
                            else {
                                var err = {
                                    keyword: 'type',
                                    dataPath: (dataPath || '') + '.background[' + i1 + ']',
                                    schemaPath: '#/definitions/Background/type',
                                    params: {
                                        type: 'object'
                                    },
                                    message: 'should be object'
                                };
                                if (vErrors === null)
                                    vErrors = [err];
                                else
                                    vErrors.push(err);
                                errors++;
                            }
                            var valid3 = errors === errs_3;
                            var valid2 = errors === errs_2;
                        }
                    }
                    var valid1 = errors === errs_1;
                }
                var data1 = data.sortOptions;
                if (data1 !== undefined) {
                    var errs_1 = errors;
                    if ((!data1 || typeof data1 !== "object" || Array.isArray(data1))) {
                        var err = {
                            keyword: 'type',
                            dataPath: (dataPath || '') + '.sortOptions',
                            schemaPath: '#/properties/sortOptions/type',
                            params: {
                                type: 'object'
                            },
                            message: 'should be object'
                        };
                        if (vErrors === null)
                            vErrors = [err];
                        else
                            vErrors.push(err);
                        errors++;
                    }
                    if (Array.isArray(data1)) {
                        var errs__1 = errors;
                        var valid1;
                        for (var i1 = 0; i1 < data1.length; i1++) {
                            var errs_2 = errors;
                            if (!refVal35(data1[i1], (dataPath || '') + '.sortOptions[' + i1 + ']', data1, i1, rootData)) {
                                if (vErrors === null)
                                    vErrors = refVal35.errors;
                                else
                                    vErrors = vErrors.concat(refVal35.errors);
                                errors = vErrors.length;
                            }
                            var valid2 = errors === errs_2;
                        }
                    }
                    var valid1 = errors === errs_1;
                }
                var data1 = data.cardOptions;
                if (data1 !== undefined) {
                    var errs_1 = errors;
                    if ((!data1 || typeof data1 !== "object" || Array.isArray(data1))) {
                        var err = {
                            keyword: 'type',
                            dataPath: (dataPath || '') + '.cardOptions',
                            schemaPath: '#/properties/cardOptions/type',
                            params: {
                                type: 'object'
                            },
                            message: 'should be object'
                        };
                        if (vErrors === null)
                            vErrors = [err];
                        else
                            vErrors.push(err);
                        errors++;
                    }
                    if (Array.isArray(data1)) {
                        var errs__1 = errors;
                        var valid1;
                        for (var i1 = 0; i1 < data1.length; i1++) {
                            var errs_2 = errors;
                            if (!refVal37(data1[i1], (dataPath || '') + '.cardOptions[' + i1 + ']', data1, i1, rootData)) {
                                if (vErrors === null)
                                    vErrors = refVal37.errors;
                                else
                                    vErrors = vErrors.concat(refVal37.errors);
                                errors = vErrors.length;
                            }
                            var valid2 = errors === errs_2;
                        }
                    }
                    var valid1 = errors === errs_1;
                }
                var data1 = data.searchOptions;
                if (data1 !== undefined) {
                    var errs_1 = errors;
                    if ((!data1 || typeof data1 !== "object" || Array.isArray(data1))) {
                        var err = {
                            keyword: 'type',
                            dataPath: (dataPath || '') + '.searchOptions',
                            schemaPath: '#/properties/searchOptions/type',
                            params: {
                                type: 'object'
                            },
                            message: 'should be object'
                        };
                        if (vErrors === null)
                            vErrors = [err];
                        else
                            vErrors.push(err);
                        errors++;
                    }
                    if (Array.isArray(data1)) {
                        var errs__1 = errors;
                        var valid1;
                        for (var i1 = 0; i1 < data1.length; i1++) {
                            var data2 = data1[i1];
                            var errs_2 = errors;
                            var errs_3 = errors;
                            if ((data2 && typeof data2 === "object" && !Array.isArray(data2))) {
                                var errs__3 = errors;
                                var valid4 = true;
                                for (var key3 in data2) {
                                    var isAdditional3 = !(false || key3 == 'fuzziness' || key3 == 'matchProperties');
                                    if (isAdditional3) {
                                        valid4 = false;
                                        var err = {
                                            keyword: 'additionalProperties',
                                            dataPath: (dataPath || '') + '.searchOptions[' + i1 + ']',
                                            schemaPath: '#/definitions/SearchOptions/additionalProperties',
                                            params: {
                                                additionalProperty: '' + key3 + ''
                                            },
                                            message: 'should NOT have additional properties'
                                        };
                                        if (vErrors === null)
                                            vErrors = [err];
                                        else
                                            vErrors.push(err);
                                        errors++;
                                    }
                                }
                                if (data2.fuzziness === undefined) {
                                    valid4 = false;
                                    var err = {
                                        keyword: 'required',
                                        dataPath: (dataPath || '') + '.searchOptions[' + i1 + ']',
                                        schemaPath: '#/definitions/SearchOptions/required',
                                        params: {
                                            missingProperty: 'fuzziness'
                                        },
                                        message: 'should have required property \'fuzziness\''
                                    };
                                    if (vErrors === null)
                                        vErrors = [err];
                                    else
                                        vErrors.push(err);
                                    errors++;
                                }
                                else {
                                    var errs_4 = errors;
                                    if (typeof data2.fuzziness !== "number") {
                                        var err = {
                                            keyword: 'type',
                                            dataPath: (dataPath || '') + '.searchOptions[' + i1 + '].fuzziness',
                                            schemaPath: '#/definitions/SearchOptions/properties/fuzziness/type',
                                            params: {
                                                type: 'number'
                                            },
                                            message: 'should be number'
                                        };
                                        if (vErrors === null)
                                            vErrors = [err];
                                        else
                                            vErrors.push(err);
                                        errors++;
                                    }
                                    var valid4 = errors === errs_4;
                                }
                                var data3 = data2.matchProperties;
                                if (data3 === undefined) {
                                    valid4 = false;
                                    var err = {
                                        keyword: 'required',
                                        dataPath: (dataPath || '') + '.searchOptions[' + i1 + ']',
                                        schemaPath: '#/definitions/SearchOptions/required',
                                        params: {
                                            missingProperty: 'matchProperties'
                                        },
                                        message: 'should have required property \'matchProperties\''
                                    };
                                    if (vErrors === null)
                                        vErrors = [err];
                                    else
                                        vErrors.push(err);
                                    errors++;
                                }
                                else {
                                    var errs_4 = errors;
                                    if (Array.isArray(data3)) {
                                        var errs__4 = errors;
                                        var valid4;
                                        for (var i4 = 0; i4 < data3.length; i4++) {
                                            var errs_5 = errors;
                                            if (typeof data3[i4] !== "string") {
                                                var err = {
                                                    keyword: 'type',
                                                    dataPath: (dataPath || '') + '.searchOptions[' + i1 + '].matchProperties[' + i4 + ']',
                                                    schemaPath: '#/definitions/SearchOptions/properties/matchProperties/items/type',
                                                    params: {
                                                        type: 'string'
                                                    },
                                                    message: 'should be string'
                                                };
                                                if (vErrors === null)
                                                    vErrors = [err];
                                                else
                                                    vErrors.push(err);
                                                errors++;
                                            }
                                            var valid5 = errors === errs_5;
                                        }
                                    }
                                    else {
                                        var err = {
                                            keyword: 'type',
                                            dataPath: (dataPath || '') + '.searchOptions[' + i1 + '].matchProperties',
                                            schemaPath: '#/definitions/SearchOptions/properties/matchProperties/type',
                                            params: {
                                                type: 'array'
                                            },
                                            message: 'should be array'
                                        };
                                        if (vErrors === null)
                                            vErrors = [err];
                                        else
                                            vErrors.push(err);
                                        errors++;
                                    }
                                    var valid4 = errors === errs_4;
                                }
                            }
                            else {
                                var err = {
                                    keyword: 'type',
                                    dataPath: (dataPath || '') + '.searchOptions[' + i1 + ']',
                                    schemaPath: '#/definitions/SearchOptions/type',
                                    params: {
                                        type: 'object'
                                    },
                                    message: 'should be object'
                                };
                                if (vErrors === null)
                                    vErrors = [err];
                                else
                                    vErrors.push(err);
                                errors++;
                            }
                            var valid3 = errors === errs_3;
                            var valid2 = errors === errs_2;
                        }
                    }
                    var valid1 = errors === errs_1;
                }
                var data1 = data.behaviours;
                if (data1 !== undefined) {
                    var errs_1 = errors;
                    if ((!data1 || typeof data1 !== "object" || Array.isArray(data1))) {
                        var err = {
                            keyword: 'type',
                            dataPath: (dataPath || '') + '.behaviours',
                            schemaPath: '#/properties/behaviours/type',
                            params: {
                                type: 'object'
                            },
                            message: 'should be object'
                        };
                        if (vErrors === null)
                            vErrors = [err];
                        else
                            vErrors.push(err);
                        errors++;
                    }
                    if (Array.isArray(data1)) {
                        if (data1.length < 1) {
                            var err = {
                                keyword: 'minItems',
                                dataPath: (dataPath || '') + '.behaviours',
                                schemaPath: '#/properties/behaviours/minItems',
                                params: {
                                    limit: 1
                                },
                                message: 'should NOT have fewer than 1 items'
                            };
                            if (vErrors === null)
                                vErrors = [err];
                            else
                                vErrors.push(err);
                            errors++;
                        }
                        var errs__1 = errors;
                        var valid1;
                        for (var i1 = 0; i1 < data1.length; i1++) {
                            var data2 = data1[i1];
                            var errs_2 = errors;
                            var errs_3 = errors;
                            if ((data2 && typeof data2 === "object" && !Array.isArray(data2))) {
                                var errs__3 = errors;
                                var valid4 = true;
                                for (var key3 in data2) {
                                    var isAdditional3 = !(false || key3 == 'freeDraw' || key3 == 'featureNode' || key3 == 'allowRepositioning');
                                    if (isAdditional3) {
                                        valid4 = false;
                                        var err = {
                                            keyword: 'additionalProperties',
                                            dataPath: (dataPath || '') + '.behaviours[' + i1 + ']',
                                            schemaPath: '#/definitions/Behaviours/additionalProperties',
                                            params: {
                                                additionalProperty: '' + key3 + ''
                                            },
                                            message: 'should NOT have additional properties'
                                        };
                                        if (vErrors === null)
                                            vErrors = [err];
                                        else
                                            vErrors.push(err);
                                        errors++;
                                    }
                                }
                                if (data2.freeDraw !== undefined) {
                                    var errs_4 = errors;
                                    if (typeof data2.freeDraw !== "boolean") {
                                        var err = {
                                            keyword: 'type',
                                            dataPath: (dataPath || '') + '.behaviours[' + i1 + '].freeDraw',
                                            schemaPath: '#/definitions/Behaviours/properties/freeDraw/type',
                                            params: {
                                                type: 'boolean'
                                            },
                                            message: 'should be boolean'
                                        };
                                        if (vErrors === null)
                                            vErrors = [err];
                                        else
                                            vErrors.push(err);
                                        errors++;
                                    }
                                    var valid4 = errors === errs_4;
                                }
                                if (data2.featureNode !== undefined) {
                                    var errs_4 = errors;
                                    if (typeof data2.featureNode !== "boolean") {
                                        var err = {
                                            keyword: 'type',
                                            dataPath: (dataPath || '') + '.behaviours[' + i1 + '].featureNode',
                                            schemaPath: '#/definitions/Behaviours/properties/featureNode/type',
                                            params: {
                                                type: 'boolean'
                                            },
                                            message: 'should be boolean'
                                        };
                                        if (vErrors === null)
                                            vErrors = [err];
                                        else
                                            vErrors.push(err);
                                        errors++;
                                    }
                                    var valid4 = errors === errs_4;
                                }
                                if (data2.allowRepositioning !== undefined) {
                                    var errs_4 = errors;
                                    if (typeof data2.allowRepositioning !== "boolean") {
                                        var err = {
                                            keyword: 'type',
                                            dataPath: (dataPath || '') + '.behaviours[' + i1 + '].allowRepositioning',
                                            schemaPath: '#/definitions/Behaviours/properties/allowRepositioning/type',
                                            params: {
                                                type: 'boolean'
                                            },
                                            message: 'should be boolean'
                                        };
                                        if (vErrors === null)
                                            vErrors = [err];
                                        else
                                            vErrors.push(err);
                                        errors++;
                                    }
                                    var valid4 = errors === errs_4;
                                }
                            }
                            else {
                                var err = {
                                    keyword: 'type',
                                    dataPath: (dataPath || '') + '.behaviours[' + i1 + ']',
                                    schemaPath: '#/definitions/Behaviours/type',
                                    params: {
                                        type: 'object'
                                    },
                                    message: 'should be object'
                                };
                                if (vErrors === null)
                                    vErrors = [err];
                                else
                                    vErrors.push(err);
                                errors++;
                            }
                            var valid3 = errors === errs_3;
                            var valid2 = errors === errs_2;
                        }
                    }
                    var valid1 = errors === errs_1;
                }
                if (data.showExistingNodes !== undefined) {
                    var errs_1 = errors;
                    if (typeof data.showExistingNodes !== "boolean") {
                        var err = {
                            keyword: 'type',
                            dataPath: (dataPath || '') + '.showExistingNodes',
                            schemaPath: '#/properties/showExistingNodes/type',
                            params: {
                                type: 'boolean'
                            },
                            message: 'should be boolean'
                        };
                        if (vErrors === null)
                            vErrors = [err];
                        else
                            vErrors.push(err);
                        errors++;
                    }
                    var valid1 = errors === errs_1;
                }
                if (data.title !== undefined) {
                    var errs_1 = errors;
                    if (typeof data.title !== "string") {
                        var err = {
                            keyword: 'type',
                            dataPath: (dataPath || '') + '.title',
                            schemaPath: '#/properties/title/type',
                            params: {
                                type: 'string'
                            },
                            message: 'should be string'
                        };
                        if (vErrors === null)
                            vErrors = [err];
                        else
                            vErrors.push(err);
                        errors++;
                    }
                    var valid1 = errors === errs_1;
                }
                var data1 = data.items;
                if (data1 !== undefined) {
                    var errs_1 = errors;
                    if (Array.isArray(data1)) {
                        var errs__1 = errors;
                        var valid1;
                        for (var i1 = 0; i1 < data1.length; i1++) {
                            var data2 = data1[i1];
                            var errs_2 = errors;
                            var errs_3 = errors;
                            if ((data2 && typeof data2 === "object" && !Array.isArray(data2))) {
                                var errs__3 = errors;
                                var valid4 = true;
                                for (var key3 in data2) {
                                    var isAdditional3 = !(false || key3 == 'id' || key3 == 'type' || key3 == 'content' || key3 == 'description' || key3 == 'size' || key3 == 'loop');
                                    if (isAdditional3) {
                                        valid4 = false;
                                        var err = {
                                            keyword: 'additionalProperties',
                                            dataPath: (dataPath || '') + '.items[' + i1 + ']',
                                            schemaPath: '#/definitions/Item/additionalProperties',
                                            params: {
                                                additionalProperty: '' + key3 + ''
                                            },
                                            message: 'should NOT have additional properties'
                                        };
                                        if (vErrors === null)
                                            vErrors = [err];
                                        else
                                            vErrors.push(err);
                                        errors++;
                                    }
                                }
                                if (data2.id === undefined) {
                                    valid4 = false;
                                    var err = {
                                        keyword: 'required',
                                        dataPath: (dataPath || '') + '.items[' + i1 + ']',
                                        schemaPath: '#/definitions/Item/required',
                                        params: {
                                            missingProperty: 'id'
                                        },
                                        message: 'should have required property \'id\''
                                    };
                                    if (vErrors === null)
                                        vErrors = [err];
                                    else
                                        vErrors.push(err);
                                    errors++;
                                }
                                else {
                                    var errs_4 = errors;
                                    if (typeof data2.id !== "string") {
                                        var err = {
                                            keyword: 'type',
                                            dataPath: (dataPath || '') + '.items[' + i1 + '].id',
                                            schemaPath: '#/definitions/Item/properties/id/type',
                                            params: {
                                                type: 'string'
                                            },
                                            message: 'should be string'
                                        };
                                        if (vErrors === null)
                                            vErrors = [err];
                                        else
                                            vErrors.push(err);
                                        errors++;
                                    }
                                    var valid4 = errors === errs_4;
                                }
                                var data3 = data2.type;
                                if (data3 === undefined) {
                                    valid4 = false;
                                    var err = {
                                        keyword: 'required',
                                        dataPath: (dataPath || '') + '.items[' + i1 + ']',
                                        schemaPath: '#/definitions/Item/required',
                                        params: {
                                            missingProperty: 'type'
                                        },
                                        message: 'should have required property \'type\''
                                    };
                                    if (vErrors === null)
                                        vErrors = [err];
                                    else
                                        vErrors.push(err);
                                    errors++;
                                }
                                else {
                                    var errs_4 = errors;
                                    if (typeof data3 !== "string") {
                                        var err = {
                                            keyword: 'type',
                                            dataPath: (dataPath || '') + '.items[' + i1 + '].type',
                                            schemaPath: '#/definitions/Item/properties/type/type',
                                            params: {
                                                type: 'string'
                                            },
                                            message: 'should be string'
                                        };
                                        if (vErrors === null)
                                            vErrors = [err];
                                        else
                                            vErrors.push(err);
                                        errors++;
                                    }
                                    var schema4 = refVal40.properties.type.enum;
                                    var valid4;
                                    valid4 = false;
                                    for (var i4 = 0; i4 < schema4.length; i4++)
                                        if (equal(data3, schema4[i4])) {
                                            valid4 = true;
                                            break;
                                        }
                                    if (!valid4) {
                                        var err = {
                                            keyword: 'enum',
                                            dataPath: (dataPath || '') + '.items[' + i1 + '].type',
                                            schemaPath: '#/definitions/Item/properties/type/enum',
                                            params: {
                                                allowedValues: schema4
                                            },
                                            message: 'should be equal to one of the allowed values'
                                        };
                                        if (vErrors === null)
                                            vErrors = [err];
                                        else
                                            vErrors.push(err);
                                        errors++;
                                    }
                                    var valid4 = errors === errs_4;
                                }
                                if (data2.content === undefined) {
                                    valid4 = false;
                                    var err = {
                                        keyword: 'required',
                                        dataPath: (dataPath || '') + '.items[' + i1 + ']',
                                        schemaPath: '#/definitions/Item/required',
                                        params: {
                                            missingProperty: 'content'
                                        },
                                        message: 'should have required property \'content\''
                                    };
                                    if (vErrors === null)
                                        vErrors = [err];
                                    else
                                        vErrors.push(err);
                                    errors++;
                                }
                                else {
                                    var errs_4 = errors;
                                    if (typeof data2.content !== "string") {
                                        var err = {
                                            keyword: 'type',
                                            dataPath: (dataPath || '') + '.items[' + i1 + '].content',
                                            schemaPath: '#/definitions/Item/properties/content/type',
                                            params: {
                                                type: 'string'
                                            },
                                            message: 'should be string'
                                        };
                                        if (vErrors === null)
                                            vErrors = [err];
                                        else
                                            vErrors.push(err);
                                        errors++;
                                    }
                                    var valid4 = errors === errs_4;
                                }
                                if (data2.description !== undefined) {
                                    var errs_4 = errors;
                                    if (typeof data2.description !== "string") {
                                        var err = {
                                            keyword: 'type',
                                            dataPath: (dataPath || '') + '.items[' + i1 + '].description',
                                            schemaPath: '#/definitions/Item/properties/description/type',
                                            params: {
                                                type: 'string'
                                            },
                                            message: 'should be string'
                                        };
                                        if (vErrors === null)
                                            vErrors = [err];
                                        else
                                            vErrors.push(err);
                                        errors++;
                                    }
                                    var valid4 = errors === errs_4;
                                }
                                if (data2.size !== undefined) {
                                    var errs_4 = errors;
                                    if (typeof data2.size !== "string") {
                                        var err = {
                                            keyword: 'type',
                                            dataPath: (dataPath || '') + '.items[' + i1 + '].size',
                                            schemaPath: '#/definitions/Item/properties/size/type',
                                            params: {
                                                type: 'string'
                                            },
                                            message: 'should be string'
                                        };
                                        if (vErrors === null)
                                            vErrors = [err];
                                        else
                                            vErrors.push(err);
                                        errors++;
                                    }
                                    var valid4 = errors === errs_4;
                                }
                                if (data2.loop !== undefined) {
                                    var errs_4 = errors;
                                    if (typeof data2.loop !== "boolean") {
                                        var err = {
                                            keyword: 'type',
                                            dataPath: (dataPath || '') + '.items[' + i1 + '].loop',
                                            schemaPath: '#/definitions/Item/properties/loop/type',
                                            params: {
                                                type: 'boolean'
                                            },
                                            message: 'should be boolean'
                                        };
                                        if (vErrors === null)
                                            vErrors = [err];
                                        else
                                            vErrors.push(err);
                                        errors++;
                                    }
                                    var valid4 = errors === errs_4;
                                }
                            }
                            else {
                                var err = {
                                    keyword: 'type',
                                    dataPath: (dataPath || '') + '.items[' + i1 + ']',
                                    schemaPath: '#/definitions/Item/type',
                                    params: {
                                        type: 'object'
                                    },
                                    message: 'should be object'
                                };
                                if (vErrors === null)
                                    vErrors = [err];
                                else
                                    vErrors.push(err);
                                errors++;
                            }
                            var valid3 = errors === errs_3;
                            var valid2 = errors === errs_2;
                        }
                    }
                    else {
                        var err = {
                            keyword: 'type',
                            dataPath: (dataPath || '') + '.items',
                            schemaPath: '#/properties/items/type',
                            params: {
                                type: 'array'
                            },
                            message: 'should be array'
                        };
                        if (vErrors === null)
                            vErrors = [err];
                        else
                            vErrors.push(err);
                        errors++;
                    }
                    var valid1 = errors === errs_1;
                }
                var data1 = data.introductionPanel;
                if (data1 !== undefined) {
                    var errs_1 = errors;
                    var errs_2 = errors;
                    if ((data1 && typeof data1 === "object" && !Array.isArray(data1))) {
                        var errs__2 = errors;
                        var valid3 = true;
                        for (var key2 in data1) {
                            var isAdditional2 = !(false || key2 == 'title' || key2 == 'text');
                            if (isAdditional2) {
                                valid3 = false;
                                var err = {
                                    keyword: 'additionalProperties',
                                    dataPath: (dataPath || '') + '.introductionPanel',
                                    schemaPath: '#/definitions/IntroductionPanel/additionalProperties',
                                    params: {
                                        additionalProperty: '' + key2 + ''
                                    },
                                    message: 'should NOT have additional properties'
                                };
                                if (vErrors === null)
                                    vErrors = [err];
                                else
                                    vErrors.push(err);
                                errors++;
                            }
                        }
                        if (data1.title === undefined) {
                            valid3 = false;
                            var err = {
                                keyword: 'required',
                                dataPath: (dataPath || '') + '.introductionPanel',
                                schemaPath: '#/definitions/IntroductionPanel/required',
                                params: {
                                    missingProperty: 'title'
                                },
                                message: 'should have required property \'title\''
                            };
                            if (vErrors === null)
                                vErrors = [err];
                            else
                                vErrors.push(err);
                            errors++;
                        }
                        else {
                            var errs_3 = errors;
                            if (typeof data1.title !== "string") {
                                var err = {
                                    keyword: 'type',
                                    dataPath: (dataPath || '') + '.introductionPanel.title',
                                    schemaPath: '#/definitions/IntroductionPanel/properties/title/type',
                                    params: {
                                        type: 'string'
                                    },
                                    message: 'should be string'
                                };
                                if (vErrors === null)
                                    vErrors = [err];
                                else
                                    vErrors.push(err);
                                errors++;
                            }
                            var valid3 = errors === errs_3;
                        }
                        if (data1.text === undefined) {
                            valid3 = false;
                            var err = {
                                keyword: 'required',
                                dataPath: (dataPath || '') + '.introductionPanel',
                                schemaPath: '#/definitions/IntroductionPanel/required',
                                params: {
                                    missingProperty: 'text'
                                },
                                message: 'should have required property \'text\''
                            };
                            if (vErrors === null)
                                vErrors = [err];
                            else
                                vErrors.push(err);
                            errors++;
                        }
                        else {
                            var errs_3 = errors;
                            if (typeof data1.text !== "string") {
                                var err = {
                                    keyword: 'type',
                                    dataPath: (dataPath || '') + '.introductionPanel.text',
                                    schemaPath: '#/definitions/IntroductionPanel/properties/text/type',
                                    params: {
                                        type: 'string'
                                    },
                                    message: 'should be string'
                                };
                                if (vErrors === null)
                                    vErrors = [err];
                                else
                                    vErrors.push(err);
                                errors++;
                            }
                            var valid3 = errors === errs_3;
                        }
                    }
                    else {
                        var err = {
                            keyword: 'type',
                            dataPath: (dataPath || '') + '.introductionPanel',
                            schemaPath: '#/definitions/IntroductionPanel/type',
                            params: {
                                type: 'object'
                            },
                            message: 'should be object'
                        };
                        if (vErrors === null)
                            vErrors = [err];
                        else
                            vErrors.push(err);
                        errors++;
                    }
                    var valid2 = errors === errs_2;
                    var valid1 = errors === errs_1;
                }
                if (data.skipLogic !== undefined) {
                    var errs_1 = errors;
                    if (!refVal42(data.skipLogic, (dataPath || '') + '.skipLogic', data, 'skipLogic', rootData)) {
                        if (vErrors === null)
                            vErrors = refVal42.errors;
                        else
                            vErrors = vErrors.concat(refVal42.errors);
                        errors = vErrors.length;
                    }
                    var valid1 = errors === errs_1;
                }
                if (data.filter !== undefined) {
                    var errs_1 = errors;
                    if (!refVal[21](data.filter, (dataPath || '') + '.filter', data, 'filter', rootData)) {
                        if (vErrors === null)
                            vErrors = refVal[21].errors;
                        else
                            vErrors = vErrors.concat(refVal[21].errors);
                        errors = vErrors.length;
                    }
                    var valid1 = errors === errs_1;
                }
            }
            else {
                var err = {
                    keyword: 'type',
                    dataPath: (dataPath || '') + "",
                    schemaPath: '#/type',
                    params: {
                        type: 'object'
                    },
                    message: 'should be object'
                };
                if (vErrors === null)
                    vErrors = [err];
                else
                    vErrors.push(err);
                errors++;
            }
            var errs__0 = errors;
            var valid0 = false;
            var errs_1 = errors;
            if ((data && typeof data === "object" && !Array.isArray(data))) {
                if (data.form === undefined) {
                    var err = {
                        keyword: 'required',
                        dataPath: (dataPath || '') + "",
                        schemaPath: '#/anyOf/0/required',
                        params: {
                            missingProperty: 'form'
                        },
                        message: 'should have required property \'form\''
                    };
                    if (vErrors === null)
                        vErrors = [err];
                    else
                        vErrors.push(err);
                    errors++;
                }
                var errs__1 = errors;
                var valid2 = true;
                if (data.type !== undefined) {
                    var errs_2 = errors;
                    var schema2 = validate.schema.anyOf[0].properties.type.const;
                    var valid2 = equal(data.type, schema2);
                    if (!valid2) {
                        var err = {
                            keyword: 'const',
                            dataPath: (dataPath || '') + '.type',
                            schemaPath: '#/anyOf/0/properties/type/const',
                            params: {
                                allowedValue: schema2
                            },
                            message: 'should be equal to constant'
                        };
                        if (vErrors === null)
                            vErrors = [err];
                        else
                            vErrors.push(err);
                        errors++;
                    }
                    var valid2 = errors === errs_2;
                }
            }
            var valid1 = errors === errs_1;
            valid0 = valid0 || valid1;
            if (!valid0) {
                var errs_1 = errors;
                if ((data && typeof data === "object" && !Array.isArray(data))) {
                    if (data.subject === undefined) {
                        var err = {
                            keyword: 'required',
                            dataPath: (dataPath || '') + "",
                            schemaPath: '#/anyOf/1/required',
                            params: {
                                missingProperty: 'subject'
                            },
                            message: 'should have required property \'subject\''
                        };
                        if (vErrors === null)
                            vErrors = [err];
                        else
                            vErrors.push(err);
                        errors++;
                    }
                    if (data.prompts === undefined) {
                        var err = {
                            keyword: 'required',
                            dataPath: (dataPath || '') + "",
                            schemaPath: '#/anyOf/1/required',
                            params: {
                                missingProperty: 'prompts'
                            },
                            message: 'should have required property \'prompts\''
                        };
                        if (vErrors === null)
                            vErrors = [err];
                        else
                            vErrors.push(err);
                        errors++;
                    }
                    var errs__1 = errors;
                    var valid2 = true;
                    if (data.type !== undefined) {
                        var errs_2 = errors;
                        var schema2 = validate.schema.anyOf[1].properties.type.const;
                        var valid2 = equal(data.type, schema2);
                        if (!valid2) {
                            var err = {
                                keyword: 'const',
                                dataPath: (dataPath || '') + '.type',
                                schemaPath: '#/anyOf/1/properties/type/const',
                                params: {
                                    allowedValue: schema2
                                },
                                message: 'should be equal to constant'
                            };
                            if (vErrors === null)
                                vErrors = [err];
                            else
                                vErrors.push(err);
                            errors++;
                        }
                        var valid2 = errors === errs_2;
                    }
                }
                var valid1 = errors === errs_1;
                valid0 = valid0 || valid1;
                if (!valid0) {
                    var errs_1 = errors;
                    if ((data && typeof data === "object" && !Array.isArray(data))) {
                        if (data.subject === undefined) {
                            var err = {
                                keyword: 'required',
                                dataPath: (dataPath || '') + "",
                                schemaPath: '#/anyOf/2/required',
                                params: {
                                    missingProperty: 'subject'
                                },
                                message: 'should have required property \'subject\''
                            };
                            if (vErrors === null)
                                vErrors = [err];
                            else
                                vErrors.push(err);
                            errors++;
                        }
                        if (data.prompts === undefined) {
                            var err = {
                                keyword: 'required',
                                dataPath: (dataPath || '') + "",
                                schemaPath: '#/anyOf/2/required',
                                params: {
                                    missingProperty: 'prompts'
                                },
                                message: 'should have required property \'prompts\''
                            };
                            if (vErrors === null)
                                vErrors = [err];
                            else
                                vErrors.push(err);
                            errors++;
                        }
                        var errs__1 = errors;
                        var valid2 = true;
                        if (data.type !== undefined) {
                            var errs_2 = errors;
                            var schema2 = validate.schema.anyOf[2].properties.type.const;
                            var valid2 = equal(data.type, schema2);
                            if (!valid2) {
                                var err = {
                                    keyword: 'const',
                                    dataPath: (dataPath || '') + '.type',
                                    schemaPath: '#/anyOf/2/properties/type/const',
                                    params: {
                                        allowedValue: schema2
                                    },
                                    message: 'should be equal to constant'
                                };
                                if (vErrors === null)
                                    vErrors = [err];
                                else
                                    vErrors.push(err);
                                errors++;
                            }
                            var valid2 = errors === errs_2;
                        }
                    }
                    var valid1 = errors === errs_1;
                    valid0 = valid0 || valid1;
                    if (!valid0) {
                        var errs_1 = errors;
                        if ((data && typeof data === "object" && !Array.isArray(data))) {
                            if (data.form === undefined) {
                                var err = {
                                    keyword: 'required',
                                    dataPath: (dataPath || '') + "",
                                    schemaPath: '#/anyOf/3/required',
                                    params: {
                                        missingProperty: 'form'
                                    },
                                    message: 'should have required property \'form\''
                                };
                                if (vErrors === null)
                                    vErrors = [err];
                                else
                                    vErrors.push(err);
                                errors++;
                            }
                            var errs__1 = errors;
                            var valid2 = true;
                            if (data.type !== undefined) {
                                var errs_2 = errors;
                                var schema2 = validate.schema.anyOf[3].properties.type.const;
                                var valid2 = equal(data.type, schema2);
                                if (!valid2) {
                                    var err = {
                                        keyword: 'const',
                                        dataPath: (dataPath || '') + '.type',
                                        schemaPath: '#/anyOf/3/properties/type/const',
                                        params: {
                                            allowedValue: schema2
                                        },
                                        message: 'should be equal to constant'
                                    };
                                    if (vErrors === null)
                                        vErrors = [err];
                                    else
                                        vErrors.push(err);
                                    errors++;
                                }
                                var valid2 = errors === errs_2;
                            }
                        }
                        var valid1 = errors === errs_1;
                        valid0 = valid0 || valid1;
                        if (!valid0) {
                            var errs_1 = errors;
                            if ((data && typeof data === "object" && !Array.isArray(data))) {
                                if (data.form === undefined) {
                                    var err = {
                                        keyword: 'required',
                                        dataPath: (dataPath || '') + "",
                                        schemaPath: '#/anyOf/4/required',
                                        params: {
                                            missingProperty: 'form'
                                        },
                                        message: 'should have required property \'form\''
                                    };
                                    if (vErrors === null)
                                        vErrors = [err];
                                    else
                                        vErrors.push(err);
                                    errors++;
                                }
                                var errs__1 = errors;
                                var valid2 = true;
                                if (data.type !== undefined) {
                                    var errs_2 = errors;
                                    var schema2 = validate.schema.anyOf[4].properties.type.const;
                                    var valid2 = equal(data.type, schema2);
                                    if (!valid2) {
                                        var err = {
                                            keyword: 'const',
                                            dataPath: (dataPath || '') + '.type',
                                            schemaPath: '#/anyOf/4/properties/type/const',
                                            params: {
                                                allowedValue: schema2
                                            },
                                            message: 'should be equal to constant'
                                        };
                                        if (vErrors === null)
                                            vErrors = [err];
                                        else
                                            vErrors.push(err);
                                        errors++;
                                    }
                                    var valid2 = errors === errs_2;
                                }
                            }
                            var valid1 = errors === errs_1;
                            valid0 = valid0 || valid1;
                            if (!valid0) {
                                var errs_1 = errors;
                                if ((data && typeof data === "object" && !Array.isArray(data))) {
                                    if (data.items === undefined) {
                                        var err = {
                                            keyword: 'required',
                                            dataPath: (dataPath || '') + "",
                                            schemaPath: '#/anyOf/5/required',
                                            params: {
                                                missingProperty: 'items'
                                            },
                                            message: 'should have required property \'items\''
                                        };
                                        if (vErrors === null)
                                            vErrors = [err];
                                        else
                                            vErrors.push(err);
                                        errors++;
                                    }
                                    var errs__1 = errors;
                                    var valid2 = true;
                                    if (data.type !== undefined) {
                                        var errs_2 = errors;
                                        var schema2 = validate.schema.anyOf[5].properties.type.const;
                                        var valid2 = equal(data.type, schema2);
                                        if (!valid2) {
                                            var err = {
                                                keyword: 'const',
                                                dataPath: (dataPath || '') + '.type',
                                                schemaPath: '#/anyOf/5/properties/type/const',
                                                params: {
                                                    allowedValue: schema2
                                                },
                                                message: 'should be equal to constant'
                                            };
                                            if (vErrors === null)
                                                vErrors = [err];
                                            else
                                                vErrors.push(err);
                                            errors++;
                                        }
                                        var valid2 = errors === errs_2;
                                    }
                                }
                                var valid1 = errors === errs_1;
                                valid0 = valid0 || valid1;
                                if (!valid0) {
                                    var errs_1 = errors;
                                    if ((data && typeof data === "object" && !Array.isArray(data))) {
                                        if (data.presets === undefined) {
                                            var err = {
                                                keyword: 'required',
                                                dataPath: (dataPath || '') + "",
                                                schemaPath: '#/anyOf/6/required',
                                                params: {
                                                    missingProperty: 'presets'
                                                },
                                                message: 'should have required property \'presets\''
                                            };
                                            if (vErrors === null)
                                                vErrors = [err];
                                            else
                                                vErrors.push(err);
                                            errors++;
                                        }
                                        if (data.background === undefined) {
                                            var err = {
                                                keyword: 'required',
                                                dataPath: (dataPath || '') + "",
                                                schemaPath: '#/anyOf/6/required',
                                                params: {
                                                    missingProperty: 'background'
                                                },
                                                message: 'should have required property \'background\''
                                            };
                                            if (vErrors === null)
                                                vErrors = [err];
                                            else
                                                vErrors.push(err);
                                            errors++;
                                        }
                                        var errs__1 = errors;
                                        var valid2 = true;
                                        if (data.type !== undefined) {
                                            var errs_2 = errors;
                                            var schema2 = validate.schema.anyOf[6].properties.type.const;
                                            var valid2 = equal(data.type, schema2);
                                            if (!valid2) {
                                                var err = {
                                                    keyword: 'const',
                                                    dataPath: (dataPath || '') + '.type',
                                                    schemaPath: '#/anyOf/6/properties/type/const',
                                                    params: {
                                                        allowedValue: schema2
                                                    },
                                                    message: 'should be equal to constant'
                                                };
                                                if (vErrors === null)
                                                    vErrors = [err];
                                                else
                                                    vErrors.push(err);
                                                errors++;
                                            }
                                            var valid2 = errors === errs_2;
                                        }
                                    }
                                    var valid1 = errors === errs_1;
                                    valid0 = valid0 || valid1;
                                    if (!valid0) {
                                        var errs_1 = errors;
                                        if ((data && typeof data === "object" && !Array.isArray(data))) {
                                            if (data.prompts === undefined) {
                                                var err = {
                                                    keyword: 'required',
                                                    dataPath: (dataPath || '') + "",
                                                    schemaPath: '#/anyOf/7/required',
                                                    params: {
                                                        missingProperty: 'prompts'
                                                    },
                                                    message: 'should have required property \'prompts\''
                                                };
                                                if (vErrors === null)
                                                    vErrors = [err];
                                                else
                                                    vErrors.push(err);
                                                errors++;
                                            }
                                            var errs__1 = errors;
                                            var valid2 = true;
                                            if (data.type !== undefined) {
                                                var errs_2 = errors;
                                                var schema2 = validate.schema.anyOf[7].properties.type.enum;
                                                var valid2;
                                                valid2 = false;
                                                for (var i2 = 0; i2 < schema2.length; i2++)
                                                    if (equal(data.type, schema2[i2])) {
                                                        valid2 = true;
                                                        break;
                                                    }
                                                if (!valid2) {
                                                    var err = {
                                                        keyword: 'enum',
                                                        dataPath: (dataPath || '') + '.type',
                                                        schemaPath: '#/anyOf/7/properties/type/enum',
                                                        params: {
                                                            allowedValues: schema2
                                                        },
                                                        message: 'should be equal to one of the allowed values'
                                                    };
                                                    if (vErrors === null)
                                                        vErrors = [err];
                                                    else
                                                        vErrors.push(err);
                                                    errors++;
                                                }
                                                var valid2 = errors === errs_2;
                                            }
                                        }
                                        var valid1 = errors === errs_1;
                                        valid0 = valid0 || valid1;
                                    }
                                }
                            }
                        }
                    }
                }
            }
            if (!valid0) {
                var err = {
                    keyword: 'anyOf',
                    dataPath: (dataPath || '') + "",
                    schemaPath: '#/anyOf',
                    params: {},
                    message: 'should match some schema in anyOf'
                };
                if (vErrors === null)
                    vErrors = [err];
                else
                    vErrors.push(err);
                errors++;
            }
            else {
                errors = errs__0;
                if (vErrors !== null) {
                    if (errs__0)
                        vErrors.length = errs__0;
                    else
                        vErrors = null;
                }
            }
            validate.errors = vErrors;
            return errors === 0;
        };
    })();
    refVal15.schema = {
        "type": "object",
        "additionalProperties": false,
        "properties": {
            "id": {
                "type": "string"
            },
            "interviewScript": {
                "type": "string"
            },
            "type": {
                "type": "string",
                "enum": ["Narrative", "AlterForm", "AlterEdgeForm", "EgoForm", "NameGenerator", "NameGeneratorQuickAdd", "NameGeneratorList", "NameGeneratorAutoComplete", "Sociogram", "DyadCensus", "TieStrengthCensus", "Information", "OrdinalBin", "CategoricalBin"]
            },
            "label": {
                "type": "string"
            },
            "form": {
                "$ref": "#/definitions/Form"
            },
            "quickAdd": {
                "type": ["string", "null"]
            },
            "createEdge": {
                "type": "string"
            },
            "dataSource": {
                "type": ["string", "null"]
            },
            "subject": {
                "$ref": "#/definitions/Subject"
            },
            "panels": {
                "type": "array",
                "items": {
                    "$ref": "#/definitions/Panel"
                }
            },
            "prompts": {
                "type": "array",
                "items": {
                    "$ref": "#/definitions/Prompt"
                },
                "minItems": 1
            },
            "presets": {
                "type": "array",
                "items": {
                    "$ref": "#/definitions/Preset"
                },
                "minItems": 1
            },
            "background": {
                "type": "object",
                "items": {
                    "$ref": "#/definitions/Background"
                },
                "minItems": 1
            },
            "sortOptions": {
                "type": "object",
                "items": {
                    "$ref": "#/definitions/SortOptions"
                }
            },
            "cardOptions": {
                "type": "object",
                "items": {
                    "$ref": "#/definitions/CardOptions"
                }
            },
            "searchOptions": {
                "type": "object",
                "items": {
                    "$ref": "#/definitions/SearchOptions"
                }
            },
            "behaviours": {
                "type": "object",
                "items": {
                    "$ref": "#/definitions/Behaviours"
                },
                "minItems": 1
            },
            "showExistingNodes": {
                "type": "boolean"
            },
            "title": {
                "type": "string"
            },
            "items": {
                "type": "array",
                "items": {
                    "$ref": "#/definitions/Item"
                }
            },
            "introductionPanel": {
                "$ref": "#/definitions/IntroductionPanel"
            },
            "skipLogic": {
                "$ref": "#/definitions/SkipLogic"
            },
            "filter": {
                "$ref": "#/definitions/Filter"
            }
        },
        "required": ["id", "label", "type"],
        "title": "Interface",
        "anyOf": [{
                "properties": {
                    "type": {
                        "const": "EgoForm"
                    }
                },
                "required": ["form"]
            }, {
                "properties": {
                    "type": {
                        "const": "DyadCensus"
                    }
                },
                "required": ["subject", "prompts"]
            }, {
                "properties": {
                    "type": {
                        "const": "TieStrengthCensus"
                    }
                },
                "required": ["subject", "prompts"]
            }, {
                "properties": {
                    "type": {
                        "const": "AlterForm"
                    }
                },
                "required": ["form"]
            }, {
                "properties": {
                    "type": {
                        "const": "AlterEdgeForm"
                    }
                },
                "required": ["form"]
            }, {
                "properties": {
                    "type": {
                        "const": "Information"
                    }
                },
                "required": ["items"]
            }, {
                "properties": {
                    "type": {
                        "const": "Narrative"
                    }
                },
                "required": ["presets", "background"]
            }, {
                "properties": {
                    "type": {
                        "enum": ["NameGenerator", "NameGeneratorQuickAdd", "NameGeneratorList", "NameGeneratorAutoComplete", "Sociogram", "OrdinalBin", "CategoricalBin", "DyadCensus"]
                    }
                },
                "required": ["prompts"]
            }]
    };
    refVal15.errors = null;
    refVal[15] = refVal15;
    var refVal16 = (function () {
        var pattern0 = new RegExp('.+');
        var pattern1 = new RegExp('^[a-zA-Z0-9._:-]+$');
        return function validate(data, dataPath, parentData, parentDataProperty, rootData) {
            'use strict';
            var vErrors = null;
            var errors = 0;
            if ((!data || typeof data !== "object" || Array.isArray(data)) && data !== null) {
                var err = {
                    keyword: 'type',
                    dataPath: (dataPath || '') + "",
                    schemaPath: '#/type',
                    params: {
                        type: 'object,null'
                    },
                    message: 'should be object,null'
                };
                if (vErrors === null)
                    vErrors = [err];
                else
                    vErrors.push(err);
                errors++;
            }
            if ((data && typeof data === "object" && !Array.isArray(data))) {
                var errs__0 = errors;
                var valid1 = true;
                for (var key0 in data) {
                    var isAdditional0 = !(false || key0 == 'title' || key0 == 'fields');
                    if (isAdditional0) {
                        valid1 = false;
                        var err = {
                            keyword: 'additionalProperties',
                            dataPath: (dataPath || '') + "",
                            schemaPath: '#/additionalProperties',
                            params: {
                                additionalProperty: '' + key0 + ''
                            },
                            message: 'should NOT have additional properties'
                        };
                        if (vErrors === null)
                            vErrors = [err];
                        else
                            vErrors.push(err);
                        errors++;
                    }
                }
                if (data.title !== undefined) {
                    var errs_1 = errors;
                    if (typeof data.title !== "string") {
                        var err = {
                            keyword: 'type',
                            dataPath: (dataPath || '') + '.title',
                            schemaPath: '#/properties/title/type',
                            params: {
                                type: 'string'
                            },
                            message: 'should be string'
                        };
                        if (vErrors === null)
                            vErrors = [err];
                        else
                            vErrors.push(err);
                        errors++;
                    }
                    var valid1 = errors === errs_1;
                }
                var data1 = data.fields;
                if (data1 === undefined) {
                    valid1 = false;
                    var err = {
                        keyword: 'required',
                        dataPath: (dataPath || '') + "",
                        schemaPath: '#/required',
                        params: {
                            missingProperty: 'fields'
                        },
                        message: 'should have required property \'fields\''
                    };
                    if (vErrors === null)
                        vErrors = [err];
                    else
                        vErrors.push(err);
                    errors++;
                }
                else {
                    var errs_1 = errors;
                    if (Array.isArray(data1)) {
                        var errs__1 = errors;
                        var valid1;
                        for (var i1 = 0; i1 < data1.length; i1++) {
                            var data2 = data1[i1];
                            var errs_2 = errors;
                            var errs_3 = errors;
                            if ((data2 && typeof data2 === "object" && !Array.isArray(data2))) {
                                var errs__3 = errors;
                                var valid4 = true;
                                for (var key3 in data2) {
                                    var isAdditional3 = !(false || key3 == 'variable' || key3 == 'prompt');
                                    if (isAdditional3) {
                                        valid4 = false;
                                        var err = {
                                            keyword: 'additionalProperties',
                                            dataPath: (dataPath || '') + '.fields[' + i1 + ']',
                                            schemaPath: '#/definitions/Field/additionalProperties',
                                            params: {
                                                additionalProperty: '' + key3 + ''
                                            },
                                            message: 'should NOT have additional properties'
                                        };
                                        if (vErrors === null)
                                            vErrors = [err];
                                        else
                                            vErrors.push(err);
                                        errors++;
                                    }
                                }
                                if (data2.variable === undefined) {
                                    valid4 = false;
                                    var err = {
                                        keyword: 'required',
                                        dataPath: (dataPath || '') + '.fields[' + i1 + ']',
                                        schemaPath: '#/definitions/Field/required',
                                        params: {
                                            missingProperty: 'variable'
                                        },
                                        message: 'should have required property \'variable\''
                                    };
                                    if (vErrors === null)
                                        vErrors = [err];
                                    else
                                        vErrors.push(err);
                                    errors++;
                                }
                                else {
                                    var errs_4 = errors;
                                    if (typeof data2.variable !== "string") {
                                        var err = {
                                            keyword: 'type',
                                            dataPath: (dataPath || '') + '.fields[' + i1 + '].variable',
                                            schemaPath: '#/definitions/Field/properties/variable/type',
                                            params: {
                                                type: 'string'
                                            },
                                            message: 'should be string'
                                        };
                                        if (vErrors === null)
                                            vErrors = [err];
                                        else
                                            vErrors.push(err);
                                        errors++;
                                    }
                                    var valid4 = errors === errs_4;
                                }
                                if (data2.prompt === undefined) {
                                    valid4 = false;
                                    var err = {
                                        keyword: 'required',
                                        dataPath: (dataPath || '') + '.fields[' + i1 + ']',
                                        schemaPath: '#/definitions/Field/required',
                                        params: {
                                            missingProperty: 'prompt'
                                        },
                                        message: 'should have required property \'prompt\''
                                    };
                                    if (vErrors === null)
                                        vErrors = [err];
                                    else
                                        vErrors.push(err);
                                    errors++;
                                }
                                else {
                                    var errs_4 = errors;
                                    if (typeof data2.prompt !== "string") {
                                        var err = {
                                            keyword: 'type',
                                            dataPath: (dataPath || '') + '.fields[' + i1 + '].prompt',
                                            schemaPath: '#/definitions/Field/properties/prompt/type',
                                            params: {
                                                type: 'string'
                                            },
                                            message: 'should be string'
                                        };
                                        if (vErrors === null)
                                            vErrors = [err];
                                        else
                                            vErrors.push(err);
                                        errors++;
                                    }
                                    var valid4 = errors === errs_4;
                                }
                            }
                            else {
                                var err = {
                                    keyword: 'type',
                                    dataPath: (dataPath || '') + '.fields[' + i1 + ']',
                                    schemaPath: '#/definitions/Field/type',
                                    params: {
                                        type: 'object'
                                    },
                                    message: 'should be object'
                                };
                                if (vErrors === null)
                                    vErrors = [err];
                                else
                                    vErrors.push(err);
                                errors++;
                            }
                            var valid3 = errors === errs_3;
                            var valid2 = errors === errs_2;
                        }
                    }
                    else {
                        var err = {
                            keyword: 'type',
                            dataPath: (dataPath || '') + '.fields',
                            schemaPath: '#/properties/fields/type',
                            params: {
                                type: 'array'
                            },
                            message: 'should be array'
                        };
                        if (vErrors === null)
                            vErrors = [err];
                        else
                            vErrors.push(err);
                        errors++;
                    }
                    var valid1 = errors === errs_1;
                }
            }
            validate.errors = vErrors;
            return errors === 0;
        };
    })();
    refVal16.schema = {
        "type": ["object", "null"],
        "additionalProperties": false,
        "properties": {
            "title": {
                "type": "string"
            },
            "fields": {
                "type": "array",
                "items": {
                    "$ref": "#/definitions/Field"
                }
            }
        },
        "required": ["fields"],
        "title": "Form"
    };
    refVal16.errors = null;
    refVal[16] = refVal16;
    var refVal17 = {
        "type": "object",
        "additionalProperties": false,
        "properties": {
            "variable": {
                "type": "string"
            },
            "prompt": {
                "type": "string"
            }
        },
        "required": ["variable", "prompt"],
        "title": "Field"
    };
    refVal[17] = refVal17;
    var refVal18 = (function () {
        var pattern0 = new RegExp('.+');
        var pattern1 = new RegExp('^[a-zA-Z0-9._:-]+$');
        return function validate(data, dataPath, parentData, parentDataProperty, rootData) {
            'use strict';
            var vErrors = null;
            var errors = 0;
            if ((data && typeof data === "object" && !Array.isArray(data))) {
                var errs__0 = errors;
                var valid1 = true;
                for (var key0 in data) {
                    var isAdditional0 = !(false || key0 == 'entity' || key0 == 'type');
                    if (isAdditional0) {
                        valid1 = false;
                        var err = {
                            keyword: 'additionalProperties',
                            dataPath: (dataPath || '') + "",
                            schemaPath: '#/additionalProperties',
                            params: {
                                additionalProperty: '' + key0 + ''
                            },
                            message: 'should NOT have additional properties'
                        };
                        if (vErrors === null)
                            vErrors = [err];
                        else
                            vErrors.push(err);
                        errors++;
                    }
                }
                var data1 = data.entity;
                if (data1 === undefined) {
                    valid1 = false;
                    var err = {
                        keyword: 'required',
                        dataPath: (dataPath || '') + "",
                        schemaPath: '#/required',
                        params: {
                            missingProperty: 'entity'
                        },
                        message: 'should have required property \'entity\''
                    };
                    if (vErrors === null)
                        vErrors = [err];
                    else
                        vErrors.push(err);
                    errors++;
                }
                else {
                    var errs_1 = errors;
                    var errs_2 = errors;
                    if (typeof data1 !== "string") {
                        var err = {
                            keyword: 'type',
                            dataPath: (dataPath || '') + '.entity',
                            schemaPath: '#/definitions/Entity/type',
                            params: {
                                type: 'string'
                            },
                            message: 'should be string'
                        };
                        if (vErrors === null)
                            vErrors = [err];
                        else
                            vErrors.push(err);
                        errors++;
                    }
                    var schema2 = refVal19.enum;
                    var valid2;
                    valid2 = false;
                    for (var i2 = 0; i2 < schema2.length; i2++)
                        if (equal(data1, schema2[i2])) {
                            valid2 = true;
                            break;
                        }
                    if (!valid2) {
                        var err = {
                            keyword: 'enum',
                            dataPath: (dataPath || '') + '.entity',
                            schemaPath: '#/definitions/Entity/enum',
                            params: {
                                allowedValues: schema2
                            },
                            message: 'should be equal to one of the allowed values'
                        };
                        if (vErrors === null)
                            vErrors = [err];
                        else
                            vErrors.push(err);
                        errors++;
                    }
                    var valid2 = errors === errs_2;
                    var valid1 = errors === errs_1;
                }
                if (data.type === undefined) {
                    valid1 = false;
                    var err = {
                        keyword: 'required',
                        dataPath: (dataPath || '') + "",
                        schemaPath: '#/required',
                        params: {
                            missingProperty: 'type'
                        },
                        message: 'should have required property \'type\''
                    };
                    if (vErrors === null)
                        vErrors = [err];
                    else
                        vErrors.push(err);
                    errors++;
                }
                else {
                    var errs_1 = errors;
                    if (typeof data.type !== "string") {
                        var err = {
                            keyword: 'type',
                            dataPath: (dataPath || '') + '.type',
                            schemaPath: '#/properties/type/type',
                            params: {
                                type: 'string'
                            },
                            message: 'should be string'
                        };
                        if (vErrors === null)
                            vErrors = [err];
                        else
                            vErrors.push(err);
                        errors++;
                    }
                    var valid1 = errors === errs_1;
                }
            }
            else {
                var err = {
                    keyword: 'type',
                    dataPath: (dataPath || '') + "",
                    schemaPath: '#/type',
                    params: {
                        type: 'object'
                    },
                    message: 'should be object'
                };
                if (vErrors === null)
                    vErrors = [err];
                else
                    vErrors.push(err);
                errors++;
            }
            validate.errors = vErrors;
            return errors === 0;
        };
    })();
    refVal18.schema = {
        "type": "object",
        "additionalProperties": false,
        "properties": {
            "entity": {
                "$ref": "#/definitions/Entity"
            },
            "type": {
                "type": "string"
            }
        },
        "required": ["entity", "type"],
        "title": "Subject"
    };
    refVal18.errors = null;
    refVal[18] = refVal18;
    var refVal19 = {
        "type": "string",
        "enum": ["edge", "node", "ego"],
        "title": "Entity"
    };
    refVal[19] = refVal19;
    var refVal20 = (function () {
        var pattern0 = new RegExp('.+');
        var pattern1 = new RegExp('^[a-zA-Z0-9._:-]+$');
        return function validate(data, dataPath, parentData, parentDataProperty, rootData) {
            'use strict';
            var vErrors = null;
            var errors = 0;
            if (rootData === undefined)
                rootData = data;
            if ((data && typeof data === "object" && !Array.isArray(data))) {
                var errs__0 = errors;
                var valid1 = true;
                for (var key0 in data) {
                    var isAdditional0 = !(false || key0 == 'id' || key0 == 'title' || key0 == 'filter' || key0 == 'dataSource');
                    if (isAdditional0) {
                        valid1 = false;
                        var err = {
                            keyword: 'additionalProperties',
                            dataPath: (dataPath || '') + "",
                            schemaPath: '#/additionalProperties',
                            params: {
                                additionalProperty: '' + key0 + ''
                            },
                            message: 'should NOT have additional properties'
                        };
                        if (vErrors === null)
                            vErrors = [err];
                        else
                            vErrors.push(err);
                        errors++;
                    }
                }
                if (data.id === undefined) {
                    valid1 = false;
                    var err = {
                        keyword: 'required',
                        dataPath: (dataPath || '') + "",
                        schemaPath: '#/required',
                        params: {
                            missingProperty: 'id'
                        },
                        message: 'should have required property \'id\''
                    };
                    if (vErrors === null)
                        vErrors = [err];
                    else
                        vErrors.push(err);
                    errors++;
                }
                else {
                    var errs_1 = errors;
                    if (typeof data.id !== "string") {
                        var err = {
                            keyword: 'type',
                            dataPath: (dataPath || '') + '.id',
                            schemaPath: '#/properties/id/type',
                            params: {
                                type: 'string'
                            },
                            message: 'should be string'
                        };
                        if (vErrors === null)
                            vErrors = [err];
                        else
                            vErrors.push(err);
                        errors++;
                    }
                    var valid1 = errors === errs_1;
                }
                if (data.title === undefined) {
                    valid1 = false;
                    var err = {
                        keyword: 'required',
                        dataPath: (dataPath || '') + "",
                        schemaPath: '#/required',
                        params: {
                            missingProperty: 'title'
                        },
                        message: 'should have required property \'title\''
                    };
                    if (vErrors === null)
                        vErrors = [err];
                    else
                        vErrors.push(err);
                    errors++;
                }
                else {
                    var errs_1 = errors;
                    if (typeof data.title !== "string") {
                        var err = {
                            keyword: 'type',
                            dataPath: (dataPath || '') + '.title',
                            schemaPath: '#/properties/title/type',
                            params: {
                                type: 'string'
                            },
                            message: 'should be string'
                        };
                        if (vErrors === null)
                            vErrors = [err];
                        else
                            vErrors.push(err);
                        errors++;
                    }
                    var valid1 = errors === errs_1;
                }
                if (data.filter !== undefined) {
                    var errs_1 = errors;
                    if (!refVal21(data.filter, (dataPath || '') + '.filter', data, 'filter', rootData)) {
                        if (vErrors === null)
                            vErrors = refVal21.errors;
                        else
                            vErrors = vErrors.concat(refVal21.errors);
                        errors = vErrors.length;
                    }
                    var valid1 = errors === errs_1;
                }
                var data1 = data.dataSource;
                if (data1 === undefined) {
                    valid1 = false;
                    var err = {
                        keyword: 'required',
                        dataPath: (dataPath || '') + "",
                        schemaPath: '#/required',
                        params: {
                            missingProperty: 'dataSource'
                        },
                        message: 'should have required property \'dataSource\''
                    };
                    if (vErrors === null)
                        vErrors = [err];
                    else
                        vErrors.push(err);
                    errors++;
                }
                else {
                    var errs_1 = errors;
                    if (typeof data1 !== "string" && data1 !== null) {
                        var err = {
                            keyword: 'type',
                            dataPath: (dataPath || '') + '.dataSource',
                            schemaPath: '#/properties/dataSource/type',
                            params: {
                                type: 'string,null'
                            },
                            message: 'should be string,null'
                        };
                        if (vErrors === null)
                            vErrors = [err];
                        else
                            vErrors.push(err);
                        errors++;
                    }
                    var valid1 = errors === errs_1;
                }
            }
            else {
                var err = {
                    keyword: 'type',
                    dataPath: (dataPath || '') + "",
                    schemaPath: '#/type',
                    params: {
                        type: 'object'
                    },
                    message: 'should be object'
                };
                if (vErrors === null)
                    vErrors = [err];
                else
                    vErrors.push(err);
                errors++;
            }
            validate.errors = vErrors;
            return errors === 0;
        };
    })();
    refVal20.schema = {
        "type": "object",
        "additionalProperties": false,
        "properties": {
            "id": {
                "type": "string"
            },
            "title": {
                "type": "string"
            },
            "filter": {
                "$ref": "#/definitions/Filter"
            },
            "dataSource": {
                "type": ["string", "null"]
            }
        },
        "required": ["id", "title", "dataSource"],
        "title": "Panel"
    };
    refVal20.errors = null;
    refVal[20] = refVal20;
    var refVal21 = (function () {
        var pattern0 = new RegExp('.+');
        var pattern1 = new RegExp('^[a-zA-Z0-9._:-]+$');
        return function validate(data, dataPath, parentData, parentDataProperty, rootData) {
            'use strict';
            var vErrors = null;
            var errors = 0;
            if (rootData === undefined)
                rootData = data;
            if ((!data || typeof data !== "object" || Array.isArray(data)) && data !== null) {
                var err = {
                    keyword: 'type',
                    dataPath: (dataPath || '') + "",
                    schemaPath: '#/type',
                    params: {
                        type: 'object,null'
                    },
                    message: 'should be object,null'
                };
                if (vErrors === null)
                    vErrors = [err];
                else
                    vErrors.push(err);
                errors++;
            }
            if ((data && typeof data === "object" && !Array.isArray(data))) {
                var errs__0 = errors;
                var valid1 = true;
                for (var key0 in data) {
                    var isAdditional0 = !(false || key0 == 'join' || key0 == 'rules');
                    if (isAdditional0) {
                        valid1 = false;
                        var err = {
                            keyword: 'additionalProperties',
                            dataPath: (dataPath || '') + "",
                            schemaPath: '#/additionalProperties',
                            params: {
                                additionalProperty: '' + key0 + ''
                            },
                            message: 'should NOT have additional properties'
                        };
                        if (vErrors === null)
                            vErrors = [err];
                        else
                            vErrors.push(err);
                        errors++;
                    }
                }
                var data1 = data.join;
                if (data1 !== undefined) {
                    var errs_1 = errors;
                    if (typeof data1 !== "string") {
                        var err = {
                            keyword: 'type',
                            dataPath: (dataPath || '') + '.join',
                            schemaPath: '#/properties/join/type',
                            params: {
                                type: 'string'
                            },
                            message: 'should be string'
                        };
                        if (vErrors === null)
                            vErrors = [err];
                        else
                            vErrors.push(err);
                        errors++;
                    }
                    var schema1 = validate.schema.properties.join.enum;
                    var valid1;
                    valid1 = false;
                    for (var i1 = 0; i1 < schema1.length; i1++)
                        if (equal(data1, schema1[i1])) {
                            valid1 = true;
                            break;
                        }
                    if (!valid1) {
                        var err = {
                            keyword: 'enum',
                            dataPath: (dataPath || '') + '.join',
                            schemaPath: '#/properties/join/enum',
                            params: {
                                allowedValues: schema1
                            },
                            message: 'should be equal to one of the allowed values'
                        };
                        if (vErrors === null)
                            vErrors = [err];
                        else
                            vErrors.push(err);
                        errors++;
                    }
                    var valid1 = errors === errs_1;
                }
                var data1 = data.rules;
                if (data1 !== undefined) {
                    var errs_1 = errors;
                    if (Array.isArray(data1)) {
                        var errs__1 = errors;
                        var valid1;
                        for (var i1 = 0; i1 < data1.length; i1++) {
                            var errs_2 = errors;
                            if (!refVal22(data1[i1], (dataPath || '') + '.rules[' + i1 + ']', data1, i1, rootData)) {
                                if (vErrors === null)
                                    vErrors = refVal22.errors;
                                else
                                    vErrors = vErrors.concat(refVal22.errors);
                                errors = vErrors.length;
                            }
                            var valid2 = errors === errs_2;
                        }
                    }
                    else {
                        var err = {
                            keyword: 'type',
                            dataPath: (dataPath || '') + '.rules',
                            schemaPath: '#/properties/rules/type',
                            params: {
                                type: 'array'
                            },
                            message: 'should be array'
                        };
                        if (vErrors === null)
                            vErrors = [err];
                        else
                            vErrors.push(err);
                        errors++;
                    }
                    var valid1 = errors === errs_1;
                }
            }
            validate.errors = vErrors;
            return errors === 0;
        };
    })();
    refVal21.schema = {
        "type": ["object", "null"],
        "additionalProperties": false,
        "properties": {
            "join": {
                "type": "string",
                "enum": ["OR", "AND"]
            },
            "rules": {
                "type": "array",
                "items": {
                    "$ref": "#/definitions/Rule"
                }
            }
        },
        "title": "Filter"
    };
    refVal21.errors = null;
    refVal[21] = refVal21;
    var refVal22 = (function () {
        var pattern0 = new RegExp('.+');
        var pattern1 = new RegExp('^[a-zA-Z0-9._:-]+$');
        return function validate(data, dataPath, parentData, parentDataProperty, rootData) {
            'use strict';
            var vErrors = null;
            var errors = 0;
            if ((data && typeof data === "object" && !Array.isArray(data))) {
                var errs__0 = errors;
                var valid1 = true;
                for (var key0 in data) {
                    var isAdditional0 = !(false || key0 == 'type' || key0 == 'id' || key0 == 'options');
                    if (isAdditional0) {
                        valid1 = false;
                        var err = {
                            keyword: 'additionalProperties',
                            dataPath: (dataPath || '') + "",
                            schemaPath: '#/additionalProperties',
                            params: {
                                additionalProperty: '' + key0 + ''
                            },
                            message: 'should NOT have additional properties'
                        };
                        if (vErrors === null)
                            vErrors = [err];
                        else
                            vErrors.push(err);
                        errors++;
                    }
                }
                var data1 = data.type;
                if (data1 === undefined) {
                    valid1 = false;
                    var err = {
                        keyword: 'required',
                        dataPath: (dataPath || '') + "",
                        schemaPath: '#/required',
                        params: {
                            missingProperty: 'type'
                        },
                        message: 'should have required property \'type\''
                    };
                    if (vErrors === null)
                        vErrors = [err];
                    else
                        vErrors.push(err);
                    errors++;
                }
                else {
                    var errs_1 = errors;
                    if (typeof data1 !== "string") {
                        var err = {
                            keyword: 'type',
                            dataPath: (dataPath || '') + '.type',
                            schemaPath: '#/properties/type/type',
                            params: {
                                type: 'string'
                            },
                            message: 'should be string'
                        };
                        if (vErrors === null)
                            vErrors = [err];
                        else
                            vErrors.push(err);
                        errors++;
                    }
                    var schema1 = validate.schema.properties.type.enum;
                    var valid1;
                    valid1 = false;
                    for (var i1 = 0; i1 < schema1.length; i1++)
                        if (equal(data1, schema1[i1])) {
                            valid1 = true;
                            break;
                        }
                    if (!valid1) {
                        var err = {
                            keyword: 'enum',
                            dataPath: (dataPath || '') + '.type',
                            schemaPath: '#/properties/type/enum',
                            params: {
                                allowedValues: schema1
                            },
                            message: 'should be equal to one of the allowed values'
                        };
                        if (vErrors === null)
                            vErrors = [err];
                        else
                            vErrors.push(err);
                        errors++;
                    }
                    var valid1 = errors === errs_1;
                }
                if (data.id === undefined) {
                    valid1 = false;
                    var err = {
                        keyword: 'required',
                        dataPath: (dataPath || '') + "",
                        schemaPath: '#/required',
                        params: {
                            missingProperty: 'id'
                        },
                        message: 'should have required property \'id\''
                    };
                    if (vErrors === null)
                        vErrors = [err];
                    else
                        vErrors.push(err);
                    errors++;
                }
                else {
                    var errs_1 = errors;
                    if (typeof data.id !== "string") {
                        var err = {
                            keyword: 'type',
                            dataPath: (dataPath || '') + '.id',
                            schemaPath: '#/properties/id/type',
                            params: {
                                type: 'string'
                            },
                            message: 'should be string'
                        };
                        if (vErrors === null)
                            vErrors = [err];
                        else
                            vErrors.push(err);
                        errors++;
                    }
                    var valid1 = errors === errs_1;
                }
                var data1 = data.options;
                if (data1 === undefined) {
                    valid1 = false;
                    var err = {
                        keyword: 'required',
                        dataPath: (dataPath || '') + "",
                        schemaPath: '#/required',
                        params: {
                            missingProperty: 'options'
                        },
                        message: 'should have required property \'options\''
                    };
                    if (vErrors === null)
                        vErrors = [err];
                    else
                        vErrors.push(err);
                    errors++;
                }
                else {
                    var errs_1 = errors;
                    var errs_2 = errors;
                    if ((data1 && typeof data1 === "object" && !Array.isArray(data1))) {
                        var errs__2 = errors;
                        var valid3 = true;
                        for (var key2 in data1) {
                            var isAdditional2 = !(false || key2 == 'type' || key2 == 'attribute' || key2 == 'operator' || key2 == 'value');
                            if (isAdditional2) {
                                valid3 = false;
                                var err = {
                                    keyword: 'additionalProperties',
                                    dataPath: (dataPath || '') + '.options',
                                    schemaPath: '#/definitions/Options/additionalProperties',
                                    params: {
                                        additionalProperty: '' + key2 + ''
                                    },
                                    message: 'should NOT have additional properties'
                                };
                                if (vErrors === null)
                                    vErrors = [err];
                                else
                                    vErrors.push(err);
                                errors++;
                            }
                        }
                        if (data1.type !== undefined) {
                            var errs_3 = errors;
                            if (typeof data1.type !== "string") {
                                var err = {
                                    keyword: 'type',
                                    dataPath: (dataPath || '') + '.options.type',
                                    schemaPath: '#/definitions/Options/properties/type/type',
                                    params: {
                                        type: 'string'
                                    },
                                    message: 'should be string'
                                };
                                if (vErrors === null)
                                    vErrors = [err];
                                else
                                    vErrors.push(err);
                                errors++;
                            }
                            var valid3 = errors === errs_3;
                        }
                        if (data1.attribute !== undefined) {
                            var errs_3 = errors;
                            if (typeof data1.attribute !== "string") {
                                var err = {
                                    keyword: 'type',
                                    dataPath: (dataPath || '') + '.options.attribute',
                                    schemaPath: '#/definitions/Options/properties/attribute/type',
                                    params: {
                                        type: 'string'
                                    },
                                    message: 'should be string'
                                };
                                if (vErrors === null)
                                    vErrors = [err];
                                else
                                    vErrors.push(err);
                                errors++;
                            }
                            var valid3 = errors === errs_3;
                        }
                        var data2 = data1.operator;
                        if (data2 === undefined) {
                            valid3 = false;
                            var err = {
                                keyword: 'required',
                                dataPath: (dataPath || '') + '.options',
                                schemaPath: '#/definitions/Options/required',
                                params: {
                                    missingProperty: 'operator'
                                },
                                message: 'should have required property \'operator\''
                            };
                            if (vErrors === null)
                                vErrors = [err];
                            else
                                vErrors.push(err);
                            errors++;
                        }
                        else {
                            var errs_3 = errors;
                            if (typeof data2 !== "string") {
                                var err = {
                                    keyword: 'type',
                                    dataPath: (dataPath || '') + '.options.operator',
                                    schemaPath: '#/definitions/Options/properties/operator/type',
                                    params: {
                                        type: 'string'
                                    },
                                    message: 'should be string'
                                };
                                if (vErrors === null)
                                    vErrors = [err];
                                else
                                    vErrors.push(err);
                                errors++;
                            }
                            var schema3 = refVal23.properties.operator.enum;
                            var valid3;
                            valid3 = false;
                            for (var i3 = 0; i3 < schema3.length; i3++)
                                if (equal(data2, schema3[i3])) {
                                    valid3 = true;
                                    break;
                                }
                            if (!valid3) {
                                var err = {
                                    keyword: 'enum',
                                    dataPath: (dataPath || '') + '.options.operator',
                                    schemaPath: '#/definitions/Options/properties/operator/enum',
                                    params: {
                                        allowedValues: schema3
                                    },
                                    message: 'should be equal to one of the allowed values'
                                };
                                if (vErrors === null)
                                    vErrors = [err];
                                else
                                    vErrors.push(err);
                                errors++;
                            }
                            var valid3 = errors === errs_3;
                        }
                        var data2 = data1.value;
                        if (data2 !== undefined) {
                            var errs_3 = errors;
                            if ((typeof data2 !== "number" || (data2 % 1) || data2 !== data2) && typeof data2 !== "string" && typeof data2 !== "boolean") {
                                var err = {
                                    keyword: 'type',
                                    dataPath: (dataPath || '') + '.options.value',
                                    schemaPath: '#/definitions/Options/properties/value/type',
                                    params: {
                                        type: 'integer,string,boolean'
                                    },
                                    message: 'should be integer,string,boolean'
                                };
                                if (vErrors === null)
                                    vErrors = [err];
                                else
                                    vErrors.push(err);
                                errors++;
                            }
                            var valid3 = errors === errs_3;
                        }
                    }
                    else {
                        var err = {
                            keyword: 'type',
                            dataPath: (dataPath || '') + '.options',
                            schemaPath: '#/definitions/Options/type',
                            params: {
                                type: 'object'
                            },
                            message: 'should be object'
                        };
                        if (vErrors === null)
                            vErrors = [err];
                        else
                            vErrors.push(err);
                        errors++;
                    }
                    var errs_3 = errors;
                    var errs__3 = errors;
                    var valid3 = true;
                    var errs_4 = errors;
                    if ((data1 && typeof data1 === "object" && !Array.isArray(data1))) {
                        var errs__4 = errors;
                        var valid5 = true;
                        if (data1.operator !== undefined) {
                            var errs_5 = errors;
                            var schema5 = refVal23.allOf[0].if.properties.operator.enum;
                            var valid5;
                            valid5 = false;
                            for (var i5 = 0; i5 < schema5.length; i5++)
                                if (equal(data1.operator, schema5[i5])) {
                                    valid5 = true;
                                    break;
                                }
                            if (!valid5) {
                                var err = {};
                                if (vErrors === null)
                                    vErrors = [err];
                                else
                                    vErrors.push(err);
                                errors++;
                            }
                            var valid5 = errors === errs_5;
                        }
                    }
                    var valid4 = errors === errs_4;
                    errors = errs__3;
                    if (vErrors !== null) {
                        if (errs__3)
                            vErrors.length = errs__3;
                        else
                            vErrors = null;
                    }
                    if (valid4) {
                        var errs_4 = errors;
                        if ((data1 && typeof data1 === "object" && !Array.isArray(data1))) {
                            if (data1.value === undefined) {
                                var err = {
                                    keyword: 'required',
                                    dataPath: (dataPath || '') + '.options',
                                    schemaPath: '#/definitions/Options/allOf/0/then/required',
                                    params: {
                                        missingProperty: 'value'
                                    },
                                    message: 'should have required property \'value\''
                                };
                                if (vErrors === null)
                                    vErrors = [err];
                                else
                                    vErrors.push(err);
                                errors++;
                            }
                        }
                        var valid4 = errors === errs_4;
                        valid3 = valid4;
                    }
                    if (!valid3) {
                        var err = {
                            keyword: 'if',
                            dataPath: (dataPath || '') + '.options',
                            schemaPath: '#/definitions/Options/allOf/0/if',
                            params: {
                                failingKeyword: 'then'
                            },
                            message: 'should match "' + 'then' + '" schema'
                        };
                        if (vErrors === null)
                            vErrors = [err];
                        else
                            vErrors.push(err);
                        errors++;
                    }
                    var valid3 = errors === errs_3;
                    var valid2 = errors === errs_2;
                    var valid1 = errors === errs_1;
                }
            }
            else {
                var err = {
                    keyword: 'type',
                    dataPath: (dataPath || '') + "",
                    schemaPath: '#/type',
                    params: {
                        type: 'object'
                    },
                    message: 'should be object'
                };
                if (vErrors === null)
                    vErrors = [err];
                else
                    vErrors.push(err);
                errors++;
            }
            validate.errors = vErrors;
            return errors === 0;
        };
    })();
    refVal22.schema = {
        "type": "object",
        "additionalProperties": false,
        "properties": {
            "type": {
                "type": "string",
                "enum": ["alter", "ego", "edge"]
            },
            "id": {
                "type": "string"
            },
            "options": {
                "$ref": "#/definitions/Options"
            }
        },
        "required": ["id", "options", "type"],
        "title": "Rule"
    };
    refVal22.errors = null;
    refVal[22] = refVal22;
    var refVal23 = {
        "type": "object",
        "additionalProperties": false,
        "properties": {
            "type": {
                "type": "string"
            },
            "attribute": {
                "type": "string"
            },
            "operator": {
                "type": "string",
                "enum": ["EXISTS", "NOT_EXISTS", "EXACTLY", "NOT", "GREATER_THAN", "GREATER_THAN_OR_EQUAL", "LESS_THAN", "LESS_THAN_OR_EQUAL", "INCLUDES", "EXCLUDES"]
            },
            "value": {
                "type": ["integer", "string", "boolean"]
            }
        },
        "required": ["operator"],
        "title": "Rule Options",
        "allOf": [{
                "if": {
                    "properties": {
                        "operator": {
                            "enum": ["EXACTLY", "NOT", "GREATER_THAN", "GREATER_THAN_OR_EQUAL", "LESS_THAN", "LESS_THAN_OR_EQUAL", "INCLUDES", "EXCLUDES"]
                        }
                    }
                },
                "then": {
                    "required": ["value"]
                }
            }]
    };
    refVal[23] = refVal23;
    var refVal24 = (function () {
        var pattern0 = new RegExp('.+');
        var pattern1 = new RegExp('^[a-zA-Z0-9._:-]+$');
        return function validate(data, dataPath, parentData, parentDataProperty, rootData) {
            'use strict';
            var vErrors = null;
            var errors = 0;
            if (rootData === undefined)
                rootData = data;
            if ((data && typeof data === "object" && !Array.isArray(data))) {
                var errs__0 = errors;
                var valid1 = true;
                for (var key0 in data) {
                    var isAdditional0 = !(false || validate.schema.properties.hasOwnProperty(key0));
                    if (isAdditional0) {
                        valid1 = false;
                        var err = {
                            keyword: 'additionalProperties',
                            dataPath: (dataPath || '') + "",
                            schemaPath: '#/additionalProperties',
                            params: {
                                additionalProperty: '' + key0 + ''
                            },
                            message: 'should NOT have additional properties'
                        };
                        if (vErrors === null)
                            vErrors = [err];
                        else
                            vErrors.push(err);
                        errors++;
                    }
                }
                if (data.id === undefined) {
                    valid1 = false;
                    var err = {
                        keyword: 'required',
                        dataPath: (dataPath || '') + "",
                        schemaPath: '#/required',
                        params: {
                            missingProperty: 'id'
                        },
                        message: 'should have required property \'id\''
                    };
                    if (vErrors === null)
                        vErrors = [err];
                    else
                        vErrors.push(err);
                    errors++;
                }
                else {
                    var errs_1 = errors;
                    if (typeof data.id !== "string") {
                        var err = {
                            keyword: 'type',
                            dataPath: (dataPath || '') + '.id',
                            schemaPath: '#/properties/id/type',
                            params: {
                                type: 'string'
                            },
                            message: 'should be string'
                        };
                        if (vErrors === null)
                            vErrors = [err];
                        else
                            vErrors.push(err);
                        errors++;
                    }
                    var valid1 = errors === errs_1;
                }
                if (data.text === undefined) {
                    valid1 = false;
                    var err = {
                        keyword: 'required',
                        dataPath: (dataPath || '') + "",
                        schemaPath: '#/required',
                        params: {
                            missingProperty: 'text'
                        },
                        message: 'should have required property \'text\''
                    };
                    if (vErrors === null)
                        vErrors = [err];
                    else
                        vErrors.push(err);
                    errors++;
                }
                else {
                    var errs_1 = errors;
                    if (typeof data.text !== "string") {
                        var err = {
                            keyword: 'type',
                            dataPath: (dataPath || '') + '.text',
                            schemaPath: '#/properties/text/type',
                            params: {
                                type: 'string'
                            },
                            message: 'should be string'
                        };
                        if (vErrors === null)
                            vErrors = [err];
                        else
                            vErrors.push(err);
                        errors++;
                    }
                    var valid1 = errors === errs_1;
                }
                if (data.additionalAttributes !== undefined) {
                    var errs_1 = errors;
                    if (!refVal25(data.additionalAttributes, (dataPath || '') + '.additionalAttributes', data, 'additionalAttributes', rootData)) {
                        if (vErrors === null)
                            vErrors = refVal25.errors;
                        else
                            vErrors = vErrors.concat(refVal25.errors);
                        errors = vErrors.length;
                    }
                    var valid1 = errors === errs_1;
                }
                if (data.variable !== undefined) {
                    var errs_1 = errors;
                    if (typeof data.variable !== "string") {
                        var err = {
                            keyword: 'type',
                            dataPath: (dataPath || '') + '.variable',
                            schemaPath: '#/properties/variable/type',
                            params: {
                                type: 'string'
                            },
                            message: 'should be string'
                        };
                        if (vErrors === null)
                            vErrors = [err];
                        else
                            vErrors.push(err);
                        errors++;
                    }
                    var valid1 = errors === errs_1;
                }
                if (data.edgeVariable !== undefined) {
                    var errs_1 = errors;
                    if (typeof data.edgeVariable !== "string") {
                        var err = {
                            keyword: 'type',
                            dataPath: (dataPath || '') + '.edgeVariable',
                            schemaPath: '#/properties/edgeVariable/type',
                            params: {
                                type: 'string'
                            },
                            message: 'should be string'
                        };
                        if (vErrors === null)
                            vErrors = [err];
                        else
                            vErrors.push(err);
                        errors++;
                    }
                    var valid1 = errors === errs_1;
                }
                if (data.negativeLabel !== undefined) {
                    var errs_1 = errors;
                    if (typeof data.negativeLabel !== "string") {
                        var err = {
                            keyword: 'type',
                            dataPath: (dataPath || '') + '.negativeLabel',
                            schemaPath: '#/properties/negativeLabel/type',
                            params: {
                                type: 'string'
                            },
                            message: 'should be string'
                        };
                        if (vErrors === null)
                            vErrors = [err];
                        else
                            vErrors.push(err);
                        errors++;
                    }
                    var valid1 = errors === errs_1;
                }
                if (data.otherVariable !== undefined) {
                    var errs_1 = errors;
                    if (typeof data.otherVariable !== "string") {
                        var err = {
                            keyword: 'type',
                            dataPath: (dataPath || '') + '.otherVariable',
                            schemaPath: '#/properties/otherVariable/type',
                            params: {
                                type: 'string'
                            },
                            message: 'should be string'
                        };
                        if (vErrors === null)
                            vErrors = [err];
                        else
                            vErrors.push(err);
                        errors++;
                    }
                    var valid1 = errors === errs_1;
                }
                if (data.otherVariablePrompt !== undefined) {
                    var errs_1 = errors;
                    if (typeof data.otherVariablePrompt !== "string") {
                        var err = {
                            keyword: 'type',
                            dataPath: (dataPath || '') + '.otherVariablePrompt',
                            schemaPath: '#/properties/otherVariablePrompt/type',
                            params: {
                                type: 'string'
                            },
                            message: 'should be string'
                        };
                        if (vErrors === null)
                            vErrors = [err];
                        else
                            vErrors.push(err);
                        errors++;
                    }
                    var valid1 = errors === errs_1;
                }
                if (data.otherOptionLabel !== undefined) {
                    var errs_1 = errors;
                    if (typeof data.otherOptionLabel !== "string") {
                        var err = {
                            keyword: 'type',
                            dataPath: (dataPath || '') + '.otherOptionLabel',
                            schemaPath: '#/properties/otherOptionLabel/type',
                            params: {
                                type: 'string'
                            },
                            message: 'should be string'
                        };
                        if (vErrors === null)
                            vErrors = [err];
                        else
                            vErrors.push(err);
                        errors++;
                    }
                    var valid1 = errors === errs_1;
                }
                var data1 = data.bucketSortOrder;
                if (data1 !== undefined) {
                    var errs_1 = errors;
                    if (Array.isArray(data1)) {
                        var errs__1 = errors;
                        var valid1;
                        for (var i1 = 0; i1 < data1.length; i1++) {
                            var errs_2 = errors;
                            if (!refVal27(data1[i1], (dataPath || '') + '.bucketSortOrder[' + i1 + ']', data1, i1, rootData)) {
                                if (vErrors === null)
                                    vErrors = refVal27.errors;
                                else
                                    vErrors = vErrors.concat(refVal27.errors);
                                errors = vErrors.length;
                            }
                            var valid2 = errors === errs_2;
                        }
                    }
                    else {
                        var err = {
                            keyword: 'type',
                            dataPath: (dataPath || '') + '.bucketSortOrder',
                            schemaPath: '#/properties/bucketSortOrder/type',
                            params: {
                                type: 'array'
                            },
                            message: 'should be array'
                        };
                        if (vErrors === null)
                            vErrors = [err];
                        else
                            vErrors.push(err);
                        errors++;
                    }
                    var valid1 = errors === errs_1;
                }
                var data1 = data.binSortOrder;
                if (data1 !== undefined) {
                    var errs_1 = errors;
                    if (Array.isArray(data1)) {
                        var errs__1 = errors;
                        var valid1;
                        for (var i1 = 0; i1 < data1.length; i1++) {
                            var errs_2 = errors;
                            if (!refVal[27](data1[i1], (dataPath || '') + '.binSortOrder[' + i1 + ']', data1, i1, rootData)) {
                                if (vErrors === null)
                                    vErrors = refVal[27].errors;
                                else
                                    vErrors = vErrors.concat(refVal[27].errors);
                                errors = vErrors.length;
                            }
                            var valid2 = errors === errs_2;
                        }
                    }
                    else {
                        var err = {
                            keyword: 'type',
                            dataPath: (dataPath || '') + '.binSortOrder',
                            schemaPath: '#/properties/binSortOrder/type',
                            params: {
                                type: 'array'
                            },
                            message: 'should be array'
                        };
                        if (vErrors === null)
                            vErrors = [err];
                        else
                            vErrors.push(err);
                        errors++;
                    }
                    var valid1 = errors === errs_1;
                }
                var data1 = data.sortOrder;
                if (data1 !== undefined) {
                    var errs_1 = errors;
                    if (Array.isArray(data1)) {
                        var errs__1 = errors;
                        var valid1;
                        for (var i1 = 0; i1 < data1.length; i1++) {
                            var errs_2 = errors;
                            if (!refVal[27](data1[i1], (dataPath || '') + '.sortOrder[' + i1 + ']', data1, i1, rootData)) {
                                if (vErrors === null)
                                    vErrors = refVal[27].errors;
                                else
                                    vErrors = vErrors.concat(refVal[27].errors);
                                errors = vErrors.length;
                            }
                            var valid2 = errors === errs_2;
                        }
                    }
                    else {
                        var err = {
                            keyword: 'type',
                            dataPath: (dataPath || '') + '.sortOrder',
                            schemaPath: '#/properties/sortOrder/type',
                            params: {
                                type: 'array'
                            },
                            message: 'should be array'
                        };
                        if (vErrors === null)
                            vErrors = [err];
                        else
                            vErrors.push(err);
                        errors++;
                    }
                    var valid1 = errors === errs_1;
                }
                if (data.color !== undefined) {
                    var errs_1 = errors;
                    if (typeof data.color !== "string") {
                        var err = {
                            keyword: 'type',
                            dataPath: (dataPath || '') + '.color',
                            schemaPath: '#/properties/color/type',
                            params: {
                                type: 'string'
                            },
                            message: 'should be string'
                        };
                        if (vErrors === null)
                            vErrors = [err];
                        else
                            vErrors.push(err);
                        errors++;
                    }
                    var valid1 = errors === errs_1;
                }
                var data1 = data.layout;
                if (data1 !== undefined) {
                    var errs_1 = errors;
                    var errs_2 = errors;
                    if ((data1 && typeof data1 === "object" && !Array.isArray(data1))) {
                        var errs__2 = errors;
                        var valid3 = true;
                        for (var key2 in data1) {
                            var isAdditional2 = !(false || key2 == 'layoutVariable' || key2 == 'allowPositioning');
                            if (isAdditional2) {
                                valid3 = false;
                                var err = {
                                    keyword: 'additionalProperties',
                                    dataPath: (dataPath || '') + '.layout',
                                    schemaPath: '#/definitions/Layout/additionalProperties',
                                    params: {
                                        additionalProperty: '' + key2 + ''
                                    },
                                    message: 'should NOT have additional properties'
                                };
                                if (vErrors === null)
                                    vErrors = [err];
                                else
                                    vErrors.push(err);
                                errors++;
                            }
                        }
                        if (data1.layoutVariable === undefined) {
                            valid3 = false;
                            var err = {
                                keyword: 'required',
                                dataPath: (dataPath || '') + '.layout',
                                schemaPath: '#/definitions/Layout/required',
                                params: {
                                    missingProperty: 'layoutVariable'
                                },
                                message: 'should have required property \'layoutVariable\''
                            };
                            if (vErrors === null)
                                vErrors = [err];
                            else
                                vErrors.push(err);
                            errors++;
                        }
                        else {
                            var errs_3 = errors;
                            if (typeof data1.layoutVariable !== "string") {
                                var err = {
                                    keyword: 'type',
                                    dataPath: (dataPath || '') + '.layout.layoutVariable',
                                    schemaPath: '#/definitions/Layout/properties/layoutVariable/type',
                                    params: {
                                        type: 'string'
                                    },
                                    message: 'should be string'
                                };
                                if (vErrors === null)
                                    vErrors = [err];
                                else
                                    vErrors.push(err);
                                errors++;
                            }
                            var valid3 = errors === errs_3;
                        }
                        if (data1.allowPositioning !== undefined) {
                            var errs_3 = errors;
                            if (typeof data1.allowPositioning !== "boolean") {
                                var err = {
                                    keyword: 'type',
                                    dataPath: (dataPath || '') + '.layout.allowPositioning',
                                    schemaPath: '#/definitions/Layout/properties/allowPositioning/type',
                                    params: {
                                        type: 'boolean'
                                    },
                                    message: 'should be boolean'
                                };
                                if (vErrors === null)
                                    vErrors = [err];
                                else
                                    vErrors.push(err);
                                errors++;
                            }
                            var valid3 = errors === errs_3;
                        }
                    }
                    else {
                        var err = {
                            keyword: 'type',
                            dataPath: (dataPath || '') + '.layout',
                            schemaPath: '#/definitions/Layout/type',
                            params: {
                                type: 'object'
                            },
                            message: 'should be object'
                        };
                        if (vErrors === null)
                            vErrors = [err];
                        else
                            vErrors.push(err);
                        errors++;
                    }
                    var valid2 = errors === errs_2;
                    var valid1 = errors === errs_1;
                }
                var data1 = data.edges;
                if (data1 !== undefined) {
                    var errs_1 = errors;
                    var errs_2 = errors;
                    if ((data1 && typeof data1 === "object" && !Array.isArray(data1))) {
                        var errs__2 = errors;
                        var valid3 = true;
                        for (var key2 in data1) {
                            var isAdditional2 = !(false || key2 == 'display' || key2 == 'create');
                            if (isAdditional2) {
                                valid3 = false;
                                var err = {
                                    keyword: 'additionalProperties',
                                    dataPath: (dataPath || '') + '.edges',
                                    schemaPath: '#/definitions/Edges/additionalProperties',
                                    params: {
                                        additionalProperty: '' + key2 + ''
                                    },
                                    message: 'should NOT have additional properties'
                                };
                                if (vErrors === null)
                                    vErrors = [err];
                                else
                                    vErrors.push(err);
                                errors++;
                            }
                        }
                        var data2 = data1.display;
                        if (data2 !== undefined) {
                            var errs_3 = errors;
                            if (Array.isArray(data2)) {
                                var errs__3 = errors;
                                var valid3;
                                for (var i3 = 0; i3 < data2.length; i3++) {
                                    var errs_4 = errors;
                                    if (typeof data2[i3] !== "string") {
                                        var err = {
                                            keyword: 'type',
                                            dataPath: (dataPath || '') + '.edges.display[' + i3 + ']',
                                            schemaPath: '#/definitions/Edges/properties/display/items/type',
                                            params: {
                                                type: 'string'
                                            },
                                            message: 'should be string'
                                        };
                                        if (vErrors === null)
                                            vErrors = [err];
                                        else
                                            vErrors.push(err);
                                        errors++;
                                    }
                                    var valid4 = errors === errs_4;
                                }
                            }
                            else {
                                var err = {
                                    keyword: 'type',
                                    dataPath: (dataPath || '') + '.edges.display',
                                    schemaPath: '#/definitions/Edges/properties/display/type',
                                    params: {
                                        type: 'array'
                                    },
                                    message: 'should be array'
                                };
                                if (vErrors === null)
                                    vErrors = [err];
                                else
                                    vErrors.push(err);
                                errors++;
                            }
                            var valid3 = errors === errs_3;
                        }
                        if (data1.create !== undefined) {
                            var errs_3 = errors;
                            if (typeof data1.create !== "string") {
                                var err = {
                                    keyword: 'type',
                                    dataPath: (dataPath || '') + '.edges.create',
                                    schemaPath: '#/definitions/Edges/properties/create/type',
                                    params: {
                                        type: 'string'
                                    },
                                    message: 'should be string'
                                };
                                if (vErrors === null)
                                    vErrors = [err];
                                else
                                    vErrors.push(err);
                                errors++;
                            }
                            var valid3 = errors === errs_3;
                        }
                    }
                    else {
                        var err = {
                            keyword: 'type',
                            dataPath: (dataPath || '') + '.edges',
                            schemaPath: '#/definitions/Edges/type',
                            params: {
                                type: 'object'
                            },
                            message: 'should be object'
                        };
                        if (vErrors === null)
                            vErrors = [err];
                        else
                            vErrors.push(err);
                        errors++;
                    }
                    var valid2 = errors === errs_2;
                    var valid1 = errors === errs_1;
                }
                var data1 = data.highlight;
                if (data1 !== undefined) {
                    var errs_1 = errors;
                    var errs_2 = errors;
                    if ((data1 && typeof data1 === "object" && !Array.isArray(data1))) {
                        var errs__2 = errors;
                        var valid3 = true;
                        for (var key2 in data1) {
                            var isAdditional2 = !(false || key2 == 'variable' || key2 == 'allowHighlighting');
                            if (isAdditional2) {
                                valid3 = false;
                                var err = {
                                    keyword: 'additionalProperties',
                                    dataPath: (dataPath || '') + '.highlight',
                                    schemaPath: '#/definitions/Highlight/additionalProperties',
                                    params: {
                                        additionalProperty: '' + key2 + ''
                                    },
                                    message: 'should NOT have additional properties'
                                };
                                if (vErrors === null)
                                    vErrors = [err];
                                else
                                    vErrors.push(err);
                                errors++;
                            }
                        }
                        if (data1.variable !== undefined) {
                            var errs_3 = errors;
                            if (typeof data1.variable !== "string") {
                                var err = {
                                    keyword: 'type',
                                    dataPath: (dataPath || '') + '.highlight.variable',
                                    schemaPath: '#/definitions/Highlight/properties/variable/type',
                                    params: {
                                        type: 'string'
                                    },
                                    message: 'should be string'
                                };
                                if (vErrors === null)
                                    vErrors = [err];
                                else
                                    vErrors.push(err);
                                errors++;
                            }
                            var valid3 = errors === errs_3;
                        }
                        if (data1.allowHighlighting === undefined) {
                            valid3 = false;
                            var err = {
                                keyword: 'required',
                                dataPath: (dataPath || '') + '.highlight',
                                schemaPath: '#/definitions/Highlight/required',
                                params: {
                                    missingProperty: 'allowHighlighting'
                                },
                                message: 'should have required property \'allowHighlighting\''
                            };
                            if (vErrors === null)
                                vErrors = [err];
                            else
                                vErrors.push(err);
                            errors++;
                        }
                        else {
                            var errs_3 = errors;
                            if (typeof data1.allowHighlighting !== "boolean") {
                                var err = {
                                    keyword: 'type',
                                    dataPath: (dataPath || '') + '.highlight.allowHighlighting',
                                    schemaPath: '#/definitions/Highlight/properties/allowHighlighting/type',
                                    params: {
                                        type: 'boolean'
                                    },
                                    message: 'should be boolean'
                                };
                                if (vErrors === null)
                                    vErrors = [err];
                                else
                                    vErrors.push(err);
                                errors++;
                            }
                            var valid3 = errors === errs_3;
                        }
                    }
                    else {
                        var err = {
                            keyword: 'type',
                            dataPath: (dataPath || '') + '.highlight',
                            schemaPath: '#/definitions/Highlight/type',
                            params: {
                                type: 'object'
                            },
                            message: 'should be object'
                        };
                        if (vErrors === null)
                            vErrors = [err];
                        else
                            vErrors.push(err);
                        errors++;
                    }
                    var valid2 = errors === errs_2;
                    var valid1 = errors === errs_1;
                }
                if (data.createEdge !== undefined) {
                    var errs_1 = errors;
                    if (typeof data.createEdge !== "string") {
                        var err = {
                            keyword: 'type',
                            dataPath: (dataPath || '') + '.createEdge',
                            schemaPath: '#/properties/createEdge/type',
                            params: {
                                type: 'string'
                            },
                            message: 'should be string'
                        };
                        if (vErrors === null)
                            vErrors = [err];
                        else
                            vErrors.push(err);
                        errors++;
                    }
                    var valid1 = errors === errs_1;
                }
            }
            else {
                var err = {
                    keyword: 'type',
                    dataPath: (dataPath || '') + "",
                    schemaPath: '#/type',
                    params: {
                        type: 'object'
                    },
                    message: 'should be object'
                };
                if (vErrors === null)
                    vErrors = [err];
                else
                    vErrors.push(err);
                errors++;
            }
            validate.errors = vErrors;
            return errors === 0;
        };
    })();
    refVal24.schema = {
        "type": "object",
        "additionalProperties": false,
        "properties": {
            "id": {
                "type": "string"
            },
            "text": {
                "type": "string"
            },
            "additionalAttributes": {
                "$ref": "#/definitions/AdditionalAttributes"
            },
            "variable": {
                "type": "string"
            },
            "edgeVariable": {
                "type": "string"
            },
            "negativeLabel": {
                "type": "string"
            },
            "otherVariable": {
                "type": "string"
            },
            "otherVariablePrompt": {
                "type": "string"
            },
            "otherOptionLabel": {
                "type": "string"
            },
            "bucketSortOrder": {
                "type": "array",
                "items": {
                    "$ref": "#/definitions/SortOrder"
                }
            },
            "binSortOrder": {
                "type": "array",
                "items": {
                    "$ref": "#/definitions/SortOrder"
                }
            },
            "sortOrder": {
                "type": "array",
                "items": {
                    "$ref": "#/definitions/SortOrder"
                }
            },
            "color": {
                "type": "string"
            },
            "layout": {
                "$ref": "#/definitions/Layout"
            },
            "edges": {
                "$ref": "#/definitions/Edges"
            },
            "highlight": {
                "$ref": "#/definitions/Highlight"
            },
            "createEdge": {
                "type": "string"
            }
        },
        "required": ["id", "text"],
        "title": "Prompt"
    };
    refVal24.errors = null;
    refVal[24] = refVal24;
    var refVal25 = (function () {
        var pattern0 = new RegExp('.+');
        var pattern1 = new RegExp('^[a-zA-Z0-9._:-]+$');
        return function validate(data, dataPath, parentData, parentDataProperty, rootData) {
            'use strict';
            var vErrors = null;
            var errors = 0;
            if (Array.isArray(data)) {
                var errs__0 = errors;
                var valid0;
                for (var i0 = 0; i0 < data.length; i0++) {
                    var data1 = data[i0];
                    var errs_1 = errors;
                    var errs_2 = errors;
                    if ((data1 && typeof data1 === "object" && !Array.isArray(data1))) {
                        var errs__2 = errors;
                        var valid3 = true;
                        for (var key2 in data1) {
                            var isAdditional2 = !(false || key2 == 'variable' || key2 == 'value');
                            if (isAdditional2) {
                                valid3 = false;
                                var err = {
                                    keyword: 'additionalProperties',
                                    dataPath: (dataPath || '') + '[' + i0 + ']',
                                    schemaPath: '#/definitions/AdditionalAttribute/additionalProperties',
                                    params: {
                                        additionalProperty: '' + key2 + ''
                                    },
                                    message: 'should NOT have additional properties'
                                };
                                if (vErrors === null)
                                    vErrors = [err];
                                else
                                    vErrors.push(err);
                                errors++;
                            }
                        }
                        if (data1.variable === undefined) {
                            valid3 = false;
                            var err = {
                                keyword: 'required',
                                dataPath: (dataPath || '') + '[' + i0 + ']',
                                schemaPath: '#/definitions/AdditionalAttribute/required',
                                params: {
                                    missingProperty: 'variable'
                                },
                                message: 'should have required property \'variable\''
                            };
                            if (vErrors === null)
                                vErrors = [err];
                            else
                                vErrors.push(err);
                            errors++;
                        }
                        else {
                            var errs_3 = errors;
                            if (typeof data1.variable !== "string") {
                                var err = {
                                    keyword: 'type',
                                    dataPath: (dataPath || '') + '[' + i0 + '].variable',
                                    schemaPath: '#/definitions/AdditionalAttribute/properties/variable/type',
                                    params: {
                                        type: 'string'
                                    },
                                    message: 'should be string'
                                };
                                if (vErrors === null)
                                    vErrors = [err];
                                else
                                    vErrors.push(err);
                                errors++;
                            }
                            var valid3 = errors === errs_3;
                        }
                        if (data1.value === undefined) {
                            valid3 = false;
                            var err = {
                                keyword: 'required',
                                dataPath: (dataPath || '') + '[' + i0 + ']',
                                schemaPath: '#/definitions/AdditionalAttribute/required',
                                params: {
                                    missingProperty: 'value'
                                },
                                message: 'should have required property \'value\''
                            };
                            if (vErrors === null)
                                vErrors = [err];
                            else
                                vErrors.push(err);
                            errors++;
                        }
                        else {
                            var errs_3 = errors;
                            if (typeof data1.value !== "boolean") {
                                var err = {
                                    keyword: 'type',
                                    dataPath: (dataPath || '') + '[' + i0 + '].value',
                                    schemaPath: '#/definitions/AdditionalAttribute/properties/value/type',
                                    params: {
                                        type: 'boolean'
                                    },
                                    message: 'should be boolean'
                                };
                                if (vErrors === null)
                                    vErrors = [err];
                                else
                                    vErrors.push(err);
                                errors++;
                            }
                            var valid3 = errors === errs_3;
                        }
                    }
                    else {
                        var err = {
                            keyword: 'type',
                            dataPath: (dataPath || '') + '[' + i0 + ']',
                            schemaPath: '#/definitions/AdditionalAttribute/type',
                            params: {
                                type: 'object'
                            },
                            message: 'should be object'
                        };
                        if (vErrors === null)
                            vErrors = [err];
                        else
                            vErrors.push(err);
                        errors++;
                    }
                    var valid2 = errors === errs_2;
                    var valid1 = errors === errs_1;
                }
            }
            else {
                var err = {
                    keyword: 'type',
                    dataPath: (dataPath || '') + "",
                    schemaPath: '#/type',
                    params: {
                        type: 'array'
                    },
                    message: 'should be array'
                };
                if (vErrors === null)
                    vErrors = [err];
                else
                    vErrors.push(err);
                errors++;
            }
            validate.errors = vErrors;
            return errors === 0;
        };
    })();
    refVal25.schema = {
        "type": "array",
        "title": "AdditionalAttributes",
        "items": {
            "$ref": "#/definitions/AdditionalAttribute"
        }
    };
    refVal25.errors = null;
    refVal[25] = refVal25;
    var refVal26 = {
        "type": "object",
        "additionalProperties": false,
        "properties": {
            "variable": {
                "type": "string"
            },
            "value": {
                "type": ["boolean"]
            }
        },
        "required": ["variable", "value"],
        "title": "AdditionalAttribute"
    };
    refVal[26] = refVal26;
    var refVal27 = (function () {
        var pattern0 = new RegExp('.+');
        var pattern1 = new RegExp('^[a-zA-Z0-9._:-]+$');
        return function validate(data, dataPath, parentData, parentDataProperty, rootData) {
            'use strict';
            var vErrors = null;
            var errors = 0;
            if ((data && typeof data === "object" && !Array.isArray(data))) {
                var errs__0 = errors;
                var valid1 = true;
                for (var key0 in data) {
                    var isAdditional0 = !(false || key0 == 'property' || key0 == 'direction');
                    if (isAdditional0) {
                        valid1 = false;
                        var err = {
                            keyword: 'additionalProperties',
                            dataPath: (dataPath || '') + "",
                            schemaPath: '#/additionalProperties',
                            params: {
                                additionalProperty: '' + key0 + ''
                            },
                            message: 'should NOT have additional properties'
                        };
                        if (vErrors === null)
                            vErrors = [err];
                        else
                            vErrors.push(err);
                        errors++;
                    }
                }
                if (data.property === undefined) {
                    valid1 = false;
                    var err = {
                        keyword: 'required',
                        dataPath: (dataPath || '') + "",
                        schemaPath: '#/required',
                        params: {
                            missingProperty: 'property'
                        },
                        message: 'should have required property \'property\''
                    };
                    if (vErrors === null)
                        vErrors = [err];
                    else
                        vErrors.push(err);
                    errors++;
                }
                else {
                    var errs_1 = errors;
                    if (typeof data.property !== "string") {
                        var err = {
                            keyword: 'type',
                            dataPath: (dataPath || '') + '.property',
                            schemaPath: '#/properties/property/type',
                            params: {
                                type: 'string'
                            },
                            message: 'should be string'
                        };
                        if (vErrors === null)
                            vErrors = [err];
                        else
                            vErrors.push(err);
                        errors++;
                    }
                    var valid1 = errors === errs_1;
                }
                var data1 = data.direction;
                if (data1 === undefined) {
                    valid1 = false;
                    var err = {
                        keyword: 'required',
                        dataPath: (dataPath || '') + "",
                        schemaPath: '#/required',
                        params: {
                            missingProperty: 'direction'
                        },
                        message: 'should have required property \'direction\''
                    };
                    if (vErrors === null)
                        vErrors = [err];
                    else
                        vErrors.push(err);
                    errors++;
                }
                else {
                    var errs_1 = errors;
                    var errs_2 = errors;
                    if (typeof data1 !== "string") {
                        var err = {
                            keyword: 'type',
                            dataPath: (dataPath || '') + '.direction',
                            schemaPath: '#/definitions/Direction/type',
                            params: {
                                type: 'string'
                            },
                            message: 'should be string'
                        };
                        if (vErrors === null)
                            vErrors = [err];
                        else
                            vErrors.push(err);
                        errors++;
                    }
                    var schema2 = refVal28.enum;
                    var valid2;
                    valid2 = false;
                    for (var i2 = 0; i2 < schema2.length; i2++)
                        if (equal(data1, schema2[i2])) {
                            valid2 = true;
                            break;
                        }
                    if (!valid2) {
                        var err = {
                            keyword: 'enum',
                            dataPath: (dataPath || '') + '.direction',
                            schemaPath: '#/definitions/Direction/enum',
                            params: {
                                allowedValues: schema2
                            },
                            message: 'should be equal to one of the allowed values'
                        };
                        if (vErrors === null)
                            vErrors = [err];
                        else
                            vErrors.push(err);
                        errors++;
                    }
                    var valid2 = errors === errs_2;
                    var valid1 = errors === errs_1;
                }
            }
            else {
                var err = {
                    keyword: 'type',
                    dataPath: (dataPath || '') + "",
                    schemaPath: '#/type',
                    params: {
                        type: 'object'
                    },
                    message: 'should be object'
                };
                if (vErrors === null)
                    vErrors = [err];
                else
                    vErrors.push(err);
                errors++;
            }
            validate.errors = vErrors;
            return errors === 0;
        };
    })();
    refVal27.schema = {
        "type": "object",
        "additionalProperties": false,
        "properties": {
            "property": {
                "type": "string"
            },
            "direction": {
                "$ref": "#/definitions/Direction"
            }
        },
        "required": ["direction", "property"],
        "title": "SortOrder"
    };
    refVal27.errors = null;
    refVal[27] = refVal27;
    var refVal28 = {
        "type": "string",
        "enum": ["desc", "asc"],
        "title": "Direction"
    };
    refVal[28] = refVal28;
    var refVal29 = {
        "type": "object",
        "additionalProperties": false,
        "properties": {
            "layoutVariable": {
                "type": "string"
            },
            "allowPositioning": {
                "type": "boolean"
            }
        },
        "required": ["layoutVariable"],
        "title": "Layout"
    };
    refVal[29] = refVal29;
    var refVal30 = {
        "type": "object",
        "additionalProperties": false,
        "properties": {
            "display": {
                "type": "array",
                "items": {
                    "type": "string"
                }
            },
            "create": {
                "type": "string"
            }
        },
        "required": [],
        "title": "Edges"
    };
    refVal[30] = refVal30;
    var refVal31 = {
        "type": "object",
        "additionalProperties": false,
        "properties": {
            "variable": {
                "type": "string"
            },
            "allowHighlighting": {
                "type": "boolean"
            }
        },
        "required": ["allowHighlighting"],
        "title": "Highlight"
    };
    refVal[31] = refVal31;
    var refVal32 = (function () {
        var pattern0 = new RegExp('.+');
        var pattern1 = new RegExp('^[a-zA-Z0-9._:-]+$');
        return function validate(data, dataPath, parentData, parentDataProperty, rootData) {
            'use strict';
            var vErrors = null;
            var errors = 0;
            if ((data && typeof data === "object" && !Array.isArray(data))) {
                var errs__0 = errors;
                var valid1 = true;
                for (var key0 in data) {
                    var isAdditional0 = !(false || key0 == 'id' || key0 == 'label' || key0 == 'layoutVariable' || key0 == 'groupVariable' || key0 == 'edges' || key0 == 'highlight');
                    if (isAdditional0) {
                        valid1 = false;
                        var err = {
                            keyword: 'additionalProperties',
                            dataPath: (dataPath || '') + "",
                            schemaPath: '#/additionalProperties',
                            params: {
                                additionalProperty: '' + key0 + ''
                            },
                            message: 'should NOT have additional properties'
                        };
                        if (vErrors === null)
                            vErrors = [err];
                        else
                            vErrors.push(err);
                        errors++;
                    }
                }
                if (data.id === undefined) {
                    valid1 = false;
                    var err = {
                        keyword: 'required',
                        dataPath: (dataPath || '') + "",
                        schemaPath: '#/required',
                        params: {
                            missingProperty: 'id'
                        },
                        message: 'should have required property \'id\''
                    };
                    if (vErrors === null)
                        vErrors = [err];
                    else
                        vErrors.push(err);
                    errors++;
                }
                else {
                    var errs_1 = errors;
                    if (typeof data.id !== "string") {
                        var err = {
                            keyword: 'type',
                            dataPath: (dataPath || '') + '.id',
                            schemaPath: '#/properties/id/type',
                            params: {
                                type: 'string'
                            },
                            message: 'should be string'
                        };
                        if (vErrors === null)
                            vErrors = [err];
                        else
                            vErrors.push(err);
                        errors++;
                    }
                    var valid1 = errors === errs_1;
                }
                if (data.label === undefined) {
                    valid1 = false;
                    var err = {
                        keyword: 'required',
                        dataPath: (dataPath || '') + "",
                        schemaPath: '#/required',
                        params: {
                            missingProperty: 'label'
                        },
                        message: 'should have required property \'label\''
                    };
                    if (vErrors === null)
                        vErrors = [err];
                    else
                        vErrors.push(err);
                    errors++;
                }
                else {
                    var errs_1 = errors;
                    if (typeof data.label !== "string") {
                        var err = {
                            keyword: 'type',
                            dataPath: (dataPath || '') + '.label',
                            schemaPath: '#/properties/label/type',
                            params: {
                                type: 'string'
                            },
                            message: 'should be string'
                        };
                        if (vErrors === null)
                            vErrors = [err];
                        else
                            vErrors.push(err);
                        errors++;
                    }
                    var valid1 = errors === errs_1;
                }
                if (data.layoutVariable === undefined) {
                    valid1 = false;
                    var err = {
                        keyword: 'required',
                        dataPath: (dataPath || '') + "",
                        schemaPath: '#/required',
                        params: {
                            missingProperty: 'layoutVariable'
                        },
                        message: 'should have required property \'layoutVariable\''
                    };
                    if (vErrors === null)
                        vErrors = [err];
                    else
                        vErrors.push(err);
                    errors++;
                }
                else {
                    var errs_1 = errors;
                    if (typeof data.layoutVariable !== "string") {
                        var err = {
                            keyword: 'type',
                            dataPath: (dataPath || '') + '.layoutVariable',
                            schemaPath: '#/properties/layoutVariable/type',
                            params: {
                                type: 'string'
                            },
                            message: 'should be string'
                        };
                        if (vErrors === null)
                            vErrors = [err];
                        else
                            vErrors.push(err);
                        errors++;
                    }
                    var valid1 = errors === errs_1;
                }
                if (data.groupVariable !== undefined) {
                    var errs_1 = errors;
                    if (typeof data.groupVariable !== "string") {
                        var err = {
                            keyword: 'type',
                            dataPath: (dataPath || '') + '.groupVariable',
                            schemaPath: '#/properties/groupVariable/type',
                            params: {
                                type: 'string'
                            },
                            message: 'should be string'
                        };
                        if (vErrors === null)
                            vErrors = [err];
                        else
                            vErrors.push(err);
                        errors++;
                    }
                    var valid1 = errors === errs_1;
                }
                var data1 = data.edges;
                if (data1 !== undefined) {
                    var errs_1 = errors;
                    var errs_2 = errors;
                    if ((data1 && typeof data1 === "object" && !Array.isArray(data1))) {
                        var errs__2 = errors;
                        var valid3 = true;
                        for (var key2 in data1) {
                            var isAdditional2 = !(false || key2 == 'display' || key2 == 'create');
                            if (isAdditional2) {
                                valid3 = false;
                                var err = {
                                    keyword: 'additionalProperties',
                                    dataPath: (dataPath || '') + '.edges',
                                    schemaPath: '#/definitions/Edges/additionalProperties',
                                    params: {
                                        additionalProperty: '' + key2 + ''
                                    },
                                    message: 'should NOT have additional properties'
                                };
                                if (vErrors === null)
                                    vErrors = [err];
                                else
                                    vErrors.push(err);
                                errors++;
                            }
                        }
                        var data2 = data1.display;
                        if (data2 !== undefined) {
                            var errs_3 = errors;
                            if (Array.isArray(data2)) {
                                var errs__3 = errors;
                                var valid3;
                                for (var i3 = 0; i3 < data2.length; i3++) {
                                    var errs_4 = errors;
                                    if (typeof data2[i3] !== "string") {
                                        var err = {
                                            keyword: 'type',
                                            dataPath: (dataPath || '') + '.edges.display[' + i3 + ']',
                                            schemaPath: '#/definitions/Edges/properties/display/items/type',
                                            params: {
                                                type: 'string'
                                            },
                                            message: 'should be string'
                                        };
                                        if (vErrors === null)
                                            vErrors = [err];
                                        else
                                            vErrors.push(err);
                                        errors++;
                                    }
                                    var valid4 = errors === errs_4;
                                }
                            }
                            else {
                                var err = {
                                    keyword: 'type',
                                    dataPath: (dataPath || '') + '.edges.display',
                                    schemaPath: '#/definitions/Edges/properties/display/type',
                                    params: {
                                        type: 'array'
                                    },
                                    message: 'should be array'
                                };
                                if (vErrors === null)
                                    vErrors = [err];
                                else
                                    vErrors.push(err);
                                errors++;
                            }
                            var valid3 = errors === errs_3;
                        }
                        if (data1.create !== undefined) {
                            var errs_3 = errors;
                            if (typeof data1.create !== "string") {
                                var err = {
                                    keyword: 'type',
                                    dataPath: (dataPath || '') + '.edges.create',
                                    schemaPath: '#/definitions/Edges/properties/create/type',
                                    params: {
                                        type: 'string'
                                    },
                                    message: 'should be string'
                                };
                                if (vErrors === null)
                                    vErrors = [err];
                                else
                                    vErrors.push(err);
                                errors++;
                            }
                            var valid3 = errors === errs_3;
                        }
                    }
                    else {
                        var err = {
                            keyword: 'type',
                            dataPath: (dataPath || '') + '.edges',
                            schemaPath: '#/definitions/Edges/type',
                            params: {
                                type: 'object'
                            },
                            message: 'should be object'
                        };
                        if (vErrors === null)
                            vErrors = [err];
                        else
                            vErrors.push(err);
                        errors++;
                    }
                    var valid2 = errors === errs_2;
                    var valid1 = errors === errs_1;
                }
                var data1 = data.highlight;
                if (data1 !== undefined) {
                    var errs_1 = errors;
                    var errs_2 = errors;
                    if (Array.isArray(data1)) {
                        var errs__2 = errors;
                        var valid2;
                        for (var i2 = 0; i2 < data1.length; i2++) {
                            var errs_3 = errors;
                            if (typeof data1[i2] !== "string") {
                                var err = {
                                    keyword: 'type',
                                    dataPath: (dataPath || '') + '.highlight[' + i2 + ']',
                                    schemaPath: '#/definitions/NarrativeHighlight/items/type',
                                    params: {
                                        type: 'string'
                                    },
                                    message: 'should be string'
                                };
                                if (vErrors === null)
                                    vErrors = [err];
                                else
                                    vErrors.push(err);
                                errors++;
                            }
                            var valid3 = errors === errs_3;
                        }
                    }
                    else {
                        var err = {
                            keyword: 'type',
                            dataPath: (dataPath || '') + '.highlight',
                            schemaPath: '#/definitions/NarrativeHighlight/type',
                            params: {
                                type: 'array'
                            },
                            message: 'should be array'
                        };
                        if (vErrors === null)
                            vErrors = [err];
                        else
                            vErrors.push(err);
                        errors++;
                    }
                    if ((data1 && typeof data1 === "object" && !Array.isArray(data1))) {
                        var errs__2 = errors;
                        var valid3 = true;
                        for (var key2 in data1) {
                            valid3 = false;
                            var err = {
                                keyword: 'additionalProperties',
                                dataPath: (dataPath || '') + '.highlight',
                                schemaPath: '#/definitions/NarrativeHighlight/additionalProperties',
                                params: {
                                    additionalProperty: '' + key2 + ''
                                },
                                message: 'should NOT have additional properties'
                            };
                            if (vErrors === null)
                                vErrors = [err];
                            else
                                vErrors.push(err);
                            errors++;
                        }
                    }
                    var valid2 = errors === errs_2;
                    var valid1 = errors === errs_1;
                }
            }
            else {
                var err = {
                    keyword: 'type',
                    dataPath: (dataPath || '') + "",
                    schemaPath: '#/type',
                    params: {
                        type: 'object'
                    },
                    message: 'should be object'
                };
                if (vErrors === null)
                    vErrors = [err];
                else
                    vErrors.push(err);
                errors++;
            }
            validate.errors = vErrors;
            return errors === 0;
        };
    })();
    refVal32.schema = {
        "type": "object",
        "additionalProperties": false,
        "properties": {
            "id": {
                "type": "string"
            },
            "label": {
                "type": "string"
            },
            "layoutVariable": {
                "type": "string"
            },
            "groupVariable": {
                "type": "string"
            },
            "edges": {
                "$ref": "#/definitions/Edges"
            },
            "highlight": {
                "$ref": "#/definitions/NarrativeHighlight"
            }
        },
        "required": ["id", "label", "layoutVariable"],
        "title": "Preset"
    };
    refVal32.errors = null;
    refVal[32] = refVal32;
    var refVal33 = {
        "type": "array",
        "additionalProperties": false,
        "items": {
            "type": "string"
        },
        "title": "NarrativeHighlight"
    };
    refVal[33] = refVal33;
    var refVal34 = {
        "type": "object",
        "additionalProperties": false,
        "properties": {
            "image": {
                "type": "string"
            },
            "concentricCircles": {
                "type": "integer"
            },
            "skewedTowardCenter": {
                "type": "boolean"
            }
        },
        "required": ["concentricCircles", "skewedTowardCenter"],
        "title": "Background"
    };
    refVal[34] = refVal34;
    var refVal35 = (function () {
        var pattern0 = new RegExp('.+');
        var pattern1 = new RegExp('^[a-zA-Z0-9._:-]+$');
        return function validate(data, dataPath, parentData, parentDataProperty, rootData) {
            'use strict';
            var vErrors = null;
            var errors = 0;
            if (rootData === undefined)
                rootData = data;
            if ((data && typeof data === "object" && !Array.isArray(data))) {
                var errs__0 = errors;
                var valid1 = true;
                for (var key0 in data) {
                    var isAdditional0 = !(false || key0 == 'sortOrder' || key0 == 'sortableProperties');
                    if (isAdditional0) {
                        valid1 = false;
                        var err = {
                            keyword: 'additionalProperties',
                            dataPath: (dataPath || '') + "",
                            schemaPath: '#/additionalProperties',
                            params: {
                                additionalProperty: '' + key0 + ''
                            },
                            message: 'should NOT have additional properties'
                        };
                        if (vErrors === null)
                            vErrors = [err];
                        else
                            vErrors.push(err);
                        errors++;
                    }
                }
                var data1 = data.sortOrder;
                if (data1 === undefined) {
                    valid1 = false;
                    var err = {
                        keyword: 'required',
                        dataPath: (dataPath || '') + "",
                        schemaPath: '#/required',
                        params: {
                            missingProperty: 'sortOrder'
                        },
                        message: 'should have required property \'sortOrder\''
                    };
                    if (vErrors === null)
                        vErrors = [err];
                    else
                        vErrors.push(err);
                    errors++;
                }
                else {
                    var errs_1 = errors;
                    if (Array.isArray(data1)) {
                        var errs__1 = errors;
                        var valid1;
                        for (var i1 = 0; i1 < data1.length; i1++) {
                            var errs_2 = errors;
                            if (!refVal[27](data1[i1], (dataPath || '') + '.sortOrder[' + i1 + ']', data1, i1, rootData)) {
                                if (vErrors === null)
                                    vErrors = refVal[27].errors;
                                else
                                    vErrors = vErrors.concat(refVal[27].errors);
                                errors = vErrors.length;
                            }
                            var valid2 = errors === errs_2;
                        }
                    }
                    else {
                        var err = {
                            keyword: 'type',
                            dataPath: (dataPath || '') + '.sortOrder',
                            schemaPath: '#/properties/sortOrder/type',
                            params: {
                                type: 'array'
                            },
                            message: 'should be array'
                        };
                        if (vErrors === null)
                            vErrors = [err];
                        else
                            vErrors.push(err);
                        errors++;
                    }
                    var valid1 = errors === errs_1;
                }
                var data1 = data.sortableProperties;
                if (data1 === undefined) {
                    valid1 = false;
                    var err = {
                        keyword: 'required',
                        dataPath: (dataPath || '') + "",
                        schemaPath: '#/required',
                        params: {
                            missingProperty: 'sortableProperties'
                        },
                        message: 'should have required property \'sortableProperties\''
                    };
                    if (vErrors === null)
                        vErrors = [err];
                    else
                        vErrors.push(err);
                    errors++;
                }
                else {
                    var errs_1 = errors;
                    if (Array.isArray(data1)) {
                        var errs__1 = errors;
                        var valid1;
                        for (var i1 = 0; i1 < data1.length; i1++) {
                            var data2 = data1[i1];
                            var errs_2 = errors;
                            var errs_3 = errors;
                            if ((data2 && typeof data2 === "object" && !Array.isArray(data2))) {
                                var errs__3 = errors;
                                var valid4 = true;
                                for (var key3 in data2) {
                                    var isAdditional3 = !(false || key3 == 'label' || key3 == 'variable');
                                    if (isAdditional3) {
                                        valid4 = false;
                                        var err = {
                                            keyword: 'additionalProperties',
                                            dataPath: (dataPath || '') + '.sortableProperties[' + i1 + ']',
                                            schemaPath: '#/definitions/Property/additionalProperties',
                                            params: {
                                                additionalProperty: '' + key3 + ''
                                            },
                                            message: 'should NOT have additional properties'
                                        };
                                        if (vErrors === null)
                                            vErrors = [err];
                                        else
                                            vErrors.push(err);
                                        errors++;
                                    }
                                }
                                if (data2.label === undefined) {
                                    valid4 = false;
                                    var err = {
                                        keyword: 'required',
                                        dataPath: (dataPath || '') + '.sortableProperties[' + i1 + ']',
                                        schemaPath: '#/definitions/Property/required',
                                        params: {
                                            missingProperty: 'label'
                                        },
                                        message: 'should have required property \'label\''
                                    };
                                    if (vErrors === null)
                                        vErrors = [err];
                                    else
                                        vErrors.push(err);
                                    errors++;
                                }
                                else {
                                    var errs_4 = errors;
                                    if (typeof data2.label !== "string") {
                                        var err = {
                                            keyword: 'type',
                                            dataPath: (dataPath || '') + '.sortableProperties[' + i1 + '].label',
                                            schemaPath: '#/definitions/Property/properties/label/type',
                                            params: {
                                                type: 'string'
                                            },
                                            message: 'should be string'
                                        };
                                        if (vErrors === null)
                                            vErrors = [err];
                                        else
                                            vErrors.push(err);
                                        errors++;
                                    }
                                    var valid4 = errors === errs_4;
                                }
                                if (data2.variable === undefined) {
                                    valid4 = false;
                                    var err = {
                                        keyword: 'required',
                                        dataPath: (dataPath || '') + '.sortableProperties[' + i1 + ']',
                                        schemaPath: '#/definitions/Property/required',
                                        params: {
                                            missingProperty: 'variable'
                                        },
                                        message: 'should have required property \'variable\''
                                    };
                                    if (vErrors === null)
                                        vErrors = [err];
                                    else
                                        vErrors.push(err);
                                    errors++;
                                }
                                else {
                                    var errs_4 = errors;
                                    if (typeof data2.variable !== "string") {
                                        var err = {
                                            keyword: 'type',
                                            dataPath: (dataPath || '') + '.sortableProperties[' + i1 + '].variable',
                                            schemaPath: '#/definitions/Property/properties/variable/type',
                                            params: {
                                                type: 'string'
                                            },
                                            message: 'should be string'
                                        };
                                        if (vErrors === null)
                                            vErrors = [err];
                                        else
                                            vErrors.push(err);
                                        errors++;
                                    }
                                    var valid4 = errors === errs_4;
                                }
                            }
                            else {
                                var err = {
                                    keyword: 'type',
                                    dataPath: (dataPath || '') + '.sortableProperties[' + i1 + ']',
                                    schemaPath: '#/definitions/Property/type',
                                    params: {
                                        type: 'object'
                                    },
                                    message: 'should be object'
                                };
                                if (vErrors === null)
                                    vErrors = [err];
                                else
                                    vErrors.push(err);
                                errors++;
                            }
                            var valid3 = errors === errs_3;
                            var valid2 = errors === errs_2;
                        }
                    }
                    else {
                        var err = {
                            keyword: 'type',
                            dataPath: (dataPath || '') + '.sortableProperties',
                            schemaPath: '#/properties/sortableProperties/type',
                            params: {
                                type: 'array'
                            },
                            message: 'should be array'
                        };
                        if (vErrors === null)
                            vErrors = [err];
                        else
                            vErrors.push(err);
                        errors++;
                    }
                    var valid1 = errors === errs_1;
                }
            }
            else {
                var err = {
                    keyword: 'type',
                    dataPath: (dataPath || '') + "",
                    schemaPath: '#/type',
                    params: {
                        type: 'object'
                    },
                    message: 'should be object'
                };
                if (vErrors === null)
                    vErrors = [err];
                else
                    vErrors.push(err);
                errors++;
            }
            validate.errors = vErrors;
            return errors === 0;
        };
    })();
    refVal35.schema = {
        "type": "object",
        "additionalProperties": false,
        "properties": {
            "sortOrder": {
                "type": "array",
                "items": {
                    "$ref": "#/definitions/SortOrder"
                }
            },
            "sortableProperties": {
                "type": "array",
                "items": {
                    "$ref": "#/definitions/Property"
                }
            }
        },
        "required": ["sortOrder", "sortableProperties"],
        "title": "SortOptions"
    };
    refVal35.errors = null;
    refVal[35] = refVal35;
    var refVal36 = {
        "type": "object",
        "additionalProperties": false,
        "properties": {
            "label": {
                "type": "string"
            },
            "variable": {
                "type": "string"
            }
        },
        "required": ["label", "variable"],
        "title": "Property"
    };
    refVal[36] = refVal36;
    var refVal37 = (function () {
        var pattern0 = new RegExp('.+');
        var pattern1 = new RegExp('^[a-zA-Z0-9._:-]+$');
        return function validate(data, dataPath, parentData, parentDataProperty, rootData) {
            'use strict';
            var vErrors = null;
            var errors = 0;
            if ((data && typeof data === "object" && !Array.isArray(data))) {
                var errs__0 = errors;
                var valid1 = true;
                for (var key0 in data) {
                    var isAdditional0 = !(false || key0 == 'displayLabel' || key0 == 'additionalProperties');
                    if (isAdditional0) {
                        valid1 = false;
                        var err = {
                            keyword: 'additionalProperties',
                            dataPath: (dataPath || '') + "",
                            schemaPath: '#/additionalProperties',
                            params: {
                                additionalProperty: '' + key0 + ''
                            },
                            message: 'should NOT have additional properties'
                        };
                        if (vErrors === null)
                            vErrors = [err];
                        else
                            vErrors.push(err);
                        errors++;
                    }
                }
                if (data.displayLabel === undefined) {
                    valid1 = false;
                    var err = {
                        keyword: 'required',
                        dataPath: (dataPath || '') + "",
                        schemaPath: '#/required',
                        params: {
                            missingProperty: 'displayLabel'
                        },
                        message: 'should have required property \'displayLabel\''
                    };
                    if (vErrors === null)
                        vErrors = [err];
                    else
                        vErrors.push(err);
                    errors++;
                }
                else {
                    var errs_1 = errors;
                    if (typeof data.displayLabel !== "string") {
                        var err = {
                            keyword: 'type',
                            dataPath: (dataPath || '') + '.displayLabel',
                            schemaPath: '#/properties/displayLabel/type',
                            params: {
                                type: 'string'
                            },
                            message: 'should be string'
                        };
                        if (vErrors === null)
                            vErrors = [err];
                        else
                            vErrors.push(err);
                        errors++;
                    }
                    var valid1 = errors === errs_1;
                }
                var data1 = data.additionalProperties;
                if (data1 !== undefined) {
                    var errs_1 = errors;
                    if (Array.isArray(data1)) {
                        var errs__1 = errors;
                        var valid1;
                        for (var i1 = 0; i1 < data1.length; i1++) {
                            var data2 = data1[i1];
                            var errs_2 = errors;
                            var errs_3 = errors;
                            if ((data2 && typeof data2 === "object" && !Array.isArray(data2))) {
                                var errs__3 = errors;
                                var valid4 = true;
                                for (var key3 in data2) {
                                    var isAdditional3 = !(false || key3 == 'label' || key3 == 'variable');
                                    if (isAdditional3) {
                                        valid4 = false;
                                        var err = {
                                            keyword: 'additionalProperties',
                                            dataPath: (dataPath || '') + '.additionalProperties[' + i1 + ']',
                                            schemaPath: '#/definitions/Property/additionalProperties',
                                            params: {
                                                additionalProperty: '' + key3 + ''
                                            },
                                            message: 'should NOT have additional properties'
                                        };
                                        if (vErrors === null)
                                            vErrors = [err];
                                        else
                                            vErrors.push(err);
                                        errors++;
                                    }
                                }
                                if (data2.label === undefined) {
                                    valid4 = false;
                                    var err = {
                                        keyword: 'required',
                                        dataPath: (dataPath || '') + '.additionalProperties[' + i1 + ']',
                                        schemaPath: '#/definitions/Property/required',
                                        params: {
                                            missingProperty: 'label'
                                        },
                                        message: 'should have required property \'label\''
                                    };
                                    if (vErrors === null)
                                        vErrors = [err];
                                    else
                                        vErrors.push(err);
                                    errors++;
                                }
                                else {
                                    var errs_4 = errors;
                                    if (typeof data2.label !== "string") {
                                        var err = {
                                            keyword: 'type',
                                            dataPath: (dataPath || '') + '.additionalProperties[' + i1 + '].label',
                                            schemaPath: '#/definitions/Property/properties/label/type',
                                            params: {
                                                type: 'string'
                                            },
                                            message: 'should be string'
                                        };
                                        if (vErrors === null)
                                            vErrors = [err];
                                        else
                                            vErrors.push(err);
                                        errors++;
                                    }
                                    var valid4 = errors === errs_4;
                                }
                                if (data2.variable === undefined) {
                                    valid4 = false;
                                    var err = {
                                        keyword: 'required',
                                        dataPath: (dataPath || '') + '.additionalProperties[' + i1 + ']',
                                        schemaPath: '#/definitions/Property/required',
                                        params: {
                                            missingProperty: 'variable'
                                        },
                                        message: 'should have required property \'variable\''
                                    };
                                    if (vErrors === null)
                                        vErrors = [err];
                                    else
                                        vErrors.push(err);
                                    errors++;
                                }
                                else {
                                    var errs_4 = errors;
                                    if (typeof data2.variable !== "string") {
                                        var err = {
                                            keyword: 'type',
                                            dataPath: (dataPath || '') + '.additionalProperties[' + i1 + '].variable',
                                            schemaPath: '#/definitions/Property/properties/variable/type',
                                            params: {
                                                type: 'string'
                                            },
                                            message: 'should be string'
                                        };
                                        if (vErrors === null)
                                            vErrors = [err];
                                        else
                                            vErrors.push(err);
                                        errors++;
                                    }
                                    var valid4 = errors === errs_4;
                                }
                            }
                            else {
                                var err = {
                                    keyword: 'type',
                                    dataPath: (dataPath || '') + '.additionalProperties[' + i1 + ']',
                                    schemaPath: '#/definitions/Property/type',
                                    params: {
                                        type: 'object'
                                    },
                                    message: 'should be object'
                                };
                                if (vErrors === null)
                                    vErrors = [err];
                                else
                                    vErrors.push(err);
                                errors++;
                            }
                            var valid3 = errors === errs_3;
                            var valid2 = errors === errs_2;
                        }
                    }
                    else {
                        var err = {
                            keyword: 'type',
                            dataPath: (dataPath || '') + '.additionalProperties',
                            schemaPath: '#/properties/additionalProperties/type',
                            params: {
                                type: 'array'
                            },
                            message: 'should be array'
                        };
                        if (vErrors === null)
                            vErrors = [err];
                        else
                            vErrors.push(err);
                        errors++;
                    }
                    var valid1 = errors === errs_1;
                }
            }
            else {
                var err = {
                    keyword: 'type',
                    dataPath: (dataPath || '') + "",
                    schemaPath: '#/type',
                    params: {
                        type: 'object'
                    },
                    message: 'should be object'
                };
                if (vErrors === null)
                    vErrors = [err];
                else
                    vErrors.push(err);
                errors++;
            }
            validate.errors = vErrors;
            return errors === 0;
        };
    })();
    refVal37.schema = {
        "type": "object",
        "additionalProperties": false,
        "properties": {
            "displayLabel": {
                "type": "string"
            },
            "additionalProperties": {
                "type": "array",
                "items": {
                    "$ref": "#/definitions/Property"
                }
            }
        },
        "required": ["displayLabel"],
        "title": "CardOptions"
    };
    refVal37.errors = null;
    refVal[37] = refVal37;
    var refVal38 = {
        "type": "object",
        "additionalProperties": false,
        "properties": {
            "fuzziness": {
                "type": "number"
            },
            "matchProperties": {
                "type": "array",
                "items": {
                    "type": "string"
                }
            }
        },
        "required": ["fuzziness", "matchProperties"],
        "title": "SearchOptions"
    };
    refVal[38] = refVal38;
    var refVal39 = {
        "type": "object",
        "additionalProperties": false,
        "properties": {
            "freeDraw": {
                "type": "boolean"
            },
            "featureNode": {
                "type": "boolean"
            },
            "allowRepositioning": {
                "type": "boolean"
            }
        },
        "required": [],
        "title": "Behaviours"
    };
    refVal[39] = refVal39;
    var refVal40 = {
        "type": "object",
        "additionalProperties": false,
        "properties": {
            "id": {
                "type": "string"
            },
            "type": {
                "type": "string",
                "enum": ["text", "asset"]
            },
            "content": {
                "type": "string"
            },
            "description": {
                "type": "string"
            },
            "size": {
                "type": "string"
            },
            "loop": {
                "type": "boolean"
            }
        },
        "required": ["content", "id", "type"],
        "title": "Item"
    };
    refVal[40] = refVal40;
    var refVal41 = {
        "type": "object",
        "additionalProperties": false,
        "properties": {
            "title": {
                "type": "string"
            },
            "text": {
                "type": "string"
            }
        },
        "required": ["title", "text"]
    };
    refVal[41] = refVal41;
    var refVal42 = (function () {
        var pattern0 = new RegExp('.+');
        var pattern1 = new RegExp('^[a-zA-Z0-9._:-]+$');
        return function validate(data, dataPath, parentData, parentDataProperty, rootData) {
            'use strict';
            var vErrors = null;
            var errors = 0;
            if (rootData === undefined)
                rootData = data;
            if ((data && typeof data === "object" && !Array.isArray(data))) {
                var errs__0 = errors;
                var valid1 = true;
                for (var key0 in data) {
                    var isAdditional0 = !(false || key0 == 'action' || key0 == 'filter');
                    if (isAdditional0) {
                        valid1 = false;
                        var err = {
                            keyword: 'additionalProperties',
                            dataPath: (dataPath || '') + "",
                            schemaPath: '#/additionalProperties',
                            params: {
                                additionalProperty: '' + key0 + ''
                            },
                            message: 'should NOT have additional properties'
                        };
                        if (vErrors === null)
                            vErrors = [err];
                        else
                            vErrors.push(err);
                        errors++;
                    }
                }
                var data1 = data.action;
                if (data1 === undefined) {
                    valid1 = false;
                    var err = {
                        keyword: 'required',
                        dataPath: (dataPath || '') + "",
                        schemaPath: '#/required',
                        params: {
                            missingProperty: 'action'
                        },
                        message: 'should have required property \'action\''
                    };
                    if (vErrors === null)
                        vErrors = [err];
                    else
                        vErrors.push(err);
                    errors++;
                }
                else {
                    var errs_1 = errors;
                    if (typeof data1 !== "string") {
                        var err = {
                            keyword: 'type',
                            dataPath: (dataPath || '') + '.action',
                            schemaPath: '#/properties/action/type',
                            params: {
                                type: 'string'
                            },
                            message: 'should be string'
                        };
                        if (vErrors === null)
                            vErrors = [err];
                        else
                            vErrors.push(err);
                        errors++;
                    }
                    var schema1 = validate.schema.properties.action.enum;
                    var valid1;
                    valid1 = false;
                    for (var i1 = 0; i1 < schema1.length; i1++)
                        if (equal(data1, schema1[i1])) {
                            valid1 = true;
                            break;
                        }
                    if (!valid1) {
                        var err = {
                            keyword: 'enum',
                            dataPath: (dataPath || '') + '.action',
                            schemaPath: '#/properties/action/enum',
                            params: {
                                allowedValues: schema1
                            },
                            message: 'should be equal to one of the allowed values'
                        };
                        if (vErrors === null)
                            vErrors = [err];
                        else
                            vErrors.push(err);
                        errors++;
                    }
                    var valid1 = errors === errs_1;
                }
                if (data.filter === undefined) {
                    valid1 = false;
                    var err = {
                        keyword: 'required',
                        dataPath: (dataPath || '') + "",
                        schemaPath: '#/required',
                        params: {
                            missingProperty: 'filter'
                        },
                        message: 'should have required property \'filter\''
                    };
                    if (vErrors === null)
                        vErrors = [err];
                    else
                        vErrors.push(err);
                    errors++;
                }
                else {
                    var errs_1 = errors;
                    if (!refVal[21](data.filter, (dataPath || '') + '.filter', data, 'filter', rootData)) {
                        if (vErrors === null)
                            vErrors = refVal[21].errors;
                        else
                            vErrors = vErrors.concat(refVal[21].errors);
                        errors = vErrors.length;
                    }
                    var valid1 = errors === errs_1;
                }
            }
            else {
                var err = {
                    keyword: 'type',
                    dataPath: (dataPath || '') + "",
                    schemaPath: '#/type',
                    params: {
                        type: 'object'
                    },
                    message: 'should be object'
                };
                if (vErrors === null)
                    vErrors = [err];
                else
                    vErrors.push(err);
                errors++;
            }
            validate.errors = vErrors;
            return errors === 0;
        };
    })();
    refVal42.schema = {
        "type": "object",
        "additionalProperties": false,
        "properties": {
            "action": {
                "type": "string",
                "enum": ["SHOW", "SKIP"]
            },
            "filter": {
                "$ref": "#/definitions/Filter"
            }
        },
        "required": ["action", "filter"],
        "title": "SkipLogic"
    };
    refVal42.errors = null;
    refVal[42] = refVal42;
    return function validate(data, dataPath, parentData, parentDataProperty, rootData) {
        'use strict';
        var vErrors = null;
        var errors = 0;
        if (rootData === undefined)
            rootData = data;
        if (!refVal1(data, (dataPath || ''), parentData, parentDataProperty, rootData)) {
            if (vErrors === null)
                vErrors = refVal1.errors;
            else
                vErrors = vErrors.concat(refVal1.errors);
            errors = vErrors.length;
        }
        validate.errors = vErrors;
        return errors === 0;
    };
})();
validate.schema = {
    "$schema": "http://json-schema.org/draft-07/schema#",
    "$ref": "#/definitions/Protocol",
    "definitions": {
        "Protocol": {
            "type": "object",
            "additionalProperties": false,
            "properties": {
                "name": {
                    "type": "string"
                },
                "description": {
                    "type": "string"
                },
                "lastModified": {
                    "type": "string",
                    "format": "date-time"
                },
                "schemaVersion": {
                    "type": "number"
                },
                "codebook": {
                    "$ref": "#/definitions/codebook"
                },
                "assetManifest": {
                    "$ref": "#/definitions/AssetManifest"
                },
                "stages": {
                    "type": "array",
                    "items": {
                        "$ref": "#/definitions/Stage"
                    }
                }
            },
            "required": ["stages", "codebook"],
            "title": "Protocol"
        },
        "AssetManifest": {
            "type": "object",
            "title": "AssetManifest"
        },
        "Form": {
            "type": ["object", "null"],
            "additionalProperties": false,
            "properties": {
                "title": {
                    "type": "string"
                },
                "fields": {
                    "type": "array",
                    "items": {
                        "$ref": "#/definitions/Field"
                    }
                }
            },
            "required": ["fields"],
            "title": "Form"
        },
        "Field": {
            "type": "object",
            "additionalProperties": false,
            "properties": {
                "variable": {
                    "type": "string"
                },
                "prompt": {
                    "type": "string"
                }
            },
            "required": ["variable", "prompt"],
            "title": "Field"
        },
        "Stage": {
            "type": "object",
            "additionalProperties": false,
            "properties": {
                "id": {
                    "type": "string"
                },
                "interviewScript": {
                    "type": "string"
                },
                "type": {
                    "type": "string",
                    "enum": ["Narrative", "AlterForm", "AlterEdgeForm", "EgoForm", "NameGenerator", "NameGeneratorQuickAdd", "NameGeneratorList", "NameGeneratorAutoComplete", "Sociogram", "DyadCensus", "TieStrengthCensus", "Information", "OrdinalBin", "CategoricalBin"]
                },
                "label": {
                    "type": "string"
                },
                "form": {
                    "$ref": "#/definitions/Form"
                },
                "quickAdd": {
                    "type": ["string", "null"]
                },
                "createEdge": {
                    "type": "string"
                },
                "dataSource": {
                    "type": ["string", "null"]
                },
                "subject": {
                    "$ref": "#/definitions/Subject"
                },
                "panels": {
                    "type": "array",
                    "items": {
                        "$ref": "#/definitions/Panel"
                    }
                },
                "prompts": {
                    "type": "array",
                    "items": {
                        "$ref": "#/definitions/Prompt"
                    },
                    "minItems": 1
                },
                "presets": {
                    "type": "array",
                    "items": {
                        "$ref": "#/definitions/Preset"
                    },
                    "minItems": 1
                },
                "background": {
                    "type": "object",
                    "items": {
                        "$ref": "#/definitions/Background"
                    },
                    "minItems": 1
                },
                "sortOptions": {
                    "type": "object",
                    "items": {
                        "$ref": "#/definitions/SortOptions"
                    }
                },
                "cardOptions": {
                    "type": "object",
                    "items": {
                        "$ref": "#/definitions/CardOptions"
                    }
                },
                "searchOptions": {
                    "type": "object",
                    "items": {
                        "$ref": "#/definitions/SearchOptions"
                    }
                },
                "behaviours": {
                    "type": "object",
                    "items": {
                        "$ref": "#/definitions/Behaviours"
                    },
                    "minItems": 1
                },
                "showExistingNodes": {
                    "type": "boolean"
                },
                "title": {
                    "type": "string"
                },
                "items": {
                    "type": "array",
                    "items": {
                        "$ref": "#/definitions/Item"
                    }
                },
                "introductionPanel": {
                    "$ref": "#/definitions/IntroductionPanel"
                },
                "skipLogic": {
                    "$ref": "#/definitions/SkipLogic"
                },
                "filter": {
                    "$ref": "#/definitions/Filter"
                }
            },
            "required": ["id", "label", "type"],
            "title": "Interface",
            "anyOf": [{
                    "properties": {
                        "type": {
                            "const": "EgoForm"
                        }
                    },
                    "required": ["form"]
                }, {
                    "properties": {
                        "type": {
                            "const": "DyadCensus"
                        }
                    },
                    "required": ["subject", "prompts"]
                }, {
                    "properties": {
                        "type": {
                            "const": "TieStrengthCensus"
                        }
                    },
                    "required": ["subject", "prompts"]
                }, {
                    "properties": {
                        "type": {
                            "const": "AlterForm"
                        }
                    },
                    "required": ["form"]
                }, {
                    "properties": {
                        "type": {
                            "const": "AlterEdgeForm"
                        }
                    },
                    "required": ["form"]
                }, {
                    "properties": {
                        "type": {
                            "const": "Information"
                        }
                    },
                    "required": ["items"]
                }, {
                    "properties": {
                        "type": {
                            "const": "Narrative"
                        }
                    },
                    "required": ["presets", "background"]
                }, {
                    "properties": {
                        "type": {
                            "enum": ["NameGenerator", "NameGeneratorQuickAdd", "NameGeneratorList", "NameGeneratorAutoComplete", "Sociogram", "OrdinalBin", "CategoricalBin", "DyadCensus"]
                        }
                    },
                    "required": ["prompts"]
                }]
        },
        "Item": {
            "type": "object",
            "additionalProperties": false,
            "properties": {
                "id": {
                    "type": "string"
                },
                "type": {
                    "type": "string",
                    "enum": ["text", "asset"]
                },
                "content": {
                    "type": "string"
                },
                "description": {
                    "type": "string"
                },
                "size": {
                    "type": "string"
                },
                "loop": {
                    "type": "boolean"
                }
            },
            "required": ["content", "id", "type"],
            "title": "Item"
        },
        "IntroductionPanel": {
            "type": "object",
            "additionalProperties": false,
            "properties": {
                "title": {
                    "type": "string"
                },
                "text": {
                    "type": "string"
                }
            },
            "required": ["title", "text"]
        },
        "Panel": {
            "type": "object",
            "additionalProperties": false,
            "properties": {
                "id": {
                    "type": "string"
                },
                "title": {
                    "type": "string"
                },
                "filter": {
                    "$ref": "#/definitions/Filter"
                },
                "dataSource": {
                    "type": ["string", "null"]
                }
            },
            "required": ["id", "title", "dataSource"],
            "title": "Panel"
        },
        "Filter": {
            "type": ["object", "null"],
            "additionalProperties": false,
            "properties": {
                "join": {
                    "type": "string",
                    "enum": ["OR", "AND"]
                },
                "rules": {
                    "type": "array",
                    "items": {
                        "$ref": "#/definitions/Rule"
                    }
                }
            },
            "title": "Filter"
        },
        "Rule": {
            "type": "object",
            "additionalProperties": false,
            "properties": {
                "type": {
                    "type": "string",
                    "enum": ["alter", "ego", "edge"]
                },
                "id": {
                    "type": "string"
                },
                "options": {
                    "$ref": "#/definitions/Options"
                }
            },
            "required": ["id", "options", "type"],
            "title": "Rule"
        },
        "Options": {
            "type": "object",
            "additionalProperties": false,
            "properties": {
                "type": {
                    "type": "string"
                },
                "attribute": {
                    "type": "string"
                },
                "operator": {
                    "type": "string",
                    "enum": ["EXISTS", "NOT_EXISTS", "EXACTLY", "NOT", "GREATER_THAN", "GREATER_THAN_OR_EQUAL", "LESS_THAN", "LESS_THAN_OR_EQUAL", "INCLUDES", "EXCLUDES"]
                },
                "value": {
                    "type": ["integer", "string", "boolean"]
                }
            },
            "required": ["operator"],
            "title": "Rule Options",
            "allOf": [{
                    "if": {
                        "properties": {
                            "operator": {
                                "enum": ["EXACTLY", "NOT", "GREATER_THAN", "GREATER_THAN_OR_EQUAL", "LESS_THAN", "LESS_THAN_OR_EQUAL", "INCLUDES", "EXCLUDES"]
                            }
                        }
                    },
                    "then": {
                        "required": ["value"]
                    }
                }]
        },
        "Prompt": {
            "type": "object",
            "additionalProperties": false,
            "properties": {
                "id": {
                    "type": "string"
                },
                "text": {
                    "type": "string"
                },
                "additionalAttributes": {
                    "$ref": "#/definitions/AdditionalAttributes"
                },
                "variable": {
                    "type": "string"
                },
                "edgeVariable": {
                    "type": "string"
                },
                "negativeLabel": {
                    "type": "string"
                },
                "otherVariable": {
                    "type": "string"
                },
                "otherVariablePrompt": {
                    "type": "string"
                },
                "otherOptionLabel": {
                    "type": "string"
                },
                "bucketSortOrder": {
                    "type": "array",
                    "items": {
                        "$ref": "#/definitions/SortOrder"
                    }
                },
                "binSortOrder": {
                    "type": "array",
                    "items": {
                        "$ref": "#/definitions/SortOrder"
                    }
                },
                "sortOrder": {
                    "type": "array",
                    "items": {
                        "$ref": "#/definitions/SortOrder"
                    }
                },
                "color": {
                    "type": "string"
                },
                "layout": {
                    "$ref": "#/definitions/Layout"
                },
                "edges": {
                    "$ref": "#/definitions/Edges"
                },
                "highlight": {
                    "$ref": "#/definitions/Highlight"
                },
                "createEdge": {
                    "type": "string"
                }
            },
            "required": ["id", "text"],
            "title": "Prompt"
        },
        "Preset": {
            "type": "object",
            "additionalProperties": false,
            "properties": {
                "id": {
                    "type": "string"
                },
                "label": {
                    "type": "string"
                },
                "layoutVariable": {
                    "type": "string"
                },
                "groupVariable": {
                    "type": "string"
                },
                "edges": {
                    "$ref": "#/definitions/Edges"
                },
                "highlight": {
                    "$ref": "#/definitions/NarrativeHighlight"
                }
            },
            "required": ["id", "label", "layoutVariable"],
            "title": "Preset"
        },
        "Behaviours": {
            "type": "object",
            "additionalProperties": false,
            "properties": {
                "freeDraw": {
                    "type": "boolean"
                },
                "featureNode": {
                    "type": "boolean"
                },
                "allowRepositioning": {
                    "type": "boolean"
                }
            },
            "required": [],
            "title": "Behaviours"
        },
        "AdditionalAttributes": {
            "type": "array",
            "title": "AdditionalAttributes",
            "items": {
                "$ref": "#/definitions/AdditionalAttribute"
            }
        },
        "AdditionalAttribute": {
            "type": "object",
            "additionalProperties": false,
            "properties": {
                "variable": {
                    "type": "string"
                },
                "value": {
                    "type": ["boolean"]
                }
            },
            "required": ["variable", "value"],
            "title": "AdditionalAttribute"
        },
        "Background": {
            "type": "object",
            "additionalProperties": false,
            "properties": {
                "image": {
                    "type": "string"
                },
                "concentricCircles": {
                    "type": "integer"
                },
                "skewedTowardCenter": {
                    "type": "boolean"
                }
            },
            "required": ["concentricCircles", "skewedTowardCenter"],
            "title": "Background"
        },
        "SortOrder": {
            "type": "object",
            "additionalProperties": false,
            "properties": {
                "property": {
                    "type": "string"
                },
                "direction": {
                    "$ref": "#/definitions/Direction"
                }
            },
            "required": ["direction", "property"],
            "title": "SortOrder"
        },
        "CardOptions": {
            "type": "object",
            "additionalProperties": false,
            "properties": {
                "displayLabel": {
                    "type": "string"
                },
                "additionalProperties": {
                    "type": "array",
                    "items": {
                        "$ref": "#/definitions/Property"
                    }
                }
            },
            "required": ["displayLabel"],
            "title": "CardOptions"
        },
        "Property": {
            "type": "object",
            "additionalProperties": false,
            "properties": {
                "label": {
                    "type": "string"
                },
                "variable": {
                    "type": "string"
                }
            },
            "required": ["label", "variable"],
            "title": "Property"
        },
        "Edges": {
            "type": "object",
            "additionalProperties": false,
            "properties": {
                "display": {
                    "type": "array",
                    "items": {
                        "type": "string"
                    }
                },
                "create": {
                    "type": "string"
                }
            },
            "required": [],
            "title": "Edges"
        },
        "NarrativeHighlight": {
            "type": "array",
            "additionalProperties": false,
            "items": {
                "type": "string"
            },
            "title": "NarrativeHighlight"
        },
        "Highlight": {
            "type": "object",
            "additionalProperties": false,
            "properties": {
                "variable": {
                    "type": "string"
                },
                "allowHighlighting": {
                    "type": "boolean"
                }
            },
            "required": ["allowHighlighting"],
            "title": "Highlight"
        },
        "Layout": {
            "type": "object",
            "additionalProperties": false,
            "properties": {
                "layoutVariable": {
                    "type": "string"
                },
                "allowPositioning": {
                    "type": "boolean"
                }
            },
            "required": ["layoutVariable"],
            "title": "Layout"
        },
        "SearchOptions": {
            "type": "object",
            "additionalProperties": false,
            "properties": {
                "fuzziness": {
                    "type": "number"
                },
                "matchProperties": {
                    "type": "array",
                    "items": {
                        "type": "string"
                    }
                }
            },
            "required": ["fuzziness", "matchProperties"],
            "title": "SearchOptions"
        },
        "SortOptions": {
            "type": "object",
            "additionalProperties": false,
            "properties": {
                "sortOrder": {
                    "type": "array",
                    "items": {
                        "$ref": "#/definitions/SortOrder"
                    }
                },
                "sortableProperties": {
                    "type": "array",
                    "items": {
                        "$ref": "#/definitions/Property"
                    }
                }
            },
            "required": ["sortOrder", "sortableProperties"],
            "title": "SortOptions"
        },
        "Subject": {
            "type": "object",
            "additionalProperties": false,
            "properties": {
                "entity": {
                    "$ref": "#/definitions/Entity"
                },
                "type": {
                    "type": "string"
                }
            },
            "required": ["entity", "type"],
            "title": "Subject"
        },
        "SkipLogic": {
            "type": "object",
            "additionalProperties": false,
            "properties": {
                "action": {
                    "type": "string",
                    "enum": ["SHOW", "SKIP"]
                },
                "filter": {
                    "$ref": "#/definitions/Filter"
                }
            },
            "required": ["action", "filter"],
            "title": "SkipLogic"
        },
        "codebook": {
            "type": "object",
            "additionalProperties": false,
            "properties": {
                "node": {
                    "$ref": "#/definitions/Node"
                },
                "edge": {
                    "$ref": "#/definitions/Edge"
                },
                "ego": {
                    "$ref": "#/definitions/Ego"
                }
            },
            "required": [],
            "title": "codebook"
        },
        "Edge": {
            "type": "object",
            "additionalProperties": false,
            "title": "Edge",
            "patternProperties": {
                ".+": {
                    "$ref": "#/definitions/EdgeTypeDef"
                }
            }
        },
        "EdgeTypeDef": {
            "type": "object",
            "additionalProperties": false,
            "properties": {
                "name": {
                    "type": "string"
                },
                "color": {
                    "type": "string"
                },
                "variables": {
                    "$ref": "#/definitions/Variables"
                }
            },
            "required": ["name", "color"],
            "title": "EdgeTypeDef"
        },
        "Variables": {
            "type": "object",
            "additionalProperties": false,
            "title": "Variables",
            "patternProperties": {
                ".+": {
                    "$ref": "#/definitions/Variable"
                }
            }
        },
        "Variable": {
            "type": "object",
            "additionalProperties": false,
            "properties": {
                "name": {
                    "type": "string",
                    "pattern": "^[a-zA-Z0-9._:-]+$"
                },
                "type": {
                    "type": "string",
                    "enum": ["boolean", "text", "number", "datetime", "ordinal", "scalar", "categorical", "layout", "location"]
                },
                "component": {
                    "type": "string",
                    "enum": ["Boolean", "CheckboxGroup", "Number", "RadioGroup", "Text", "TextArea", "Toggle", "ToggleButtonGroup", "Slider", "VisualAnalogScale", "LikertScale", "DatePicker", "RelativeDatePicker"]
                },
                "options": {
                    "type": "array",
                    "items": {
                        "$ref": "#/definitions/OptionElement"
                    }
                },
                "parameters": {
                    "type": "object"
                },
                "validation": {
                    "$ref": "#/definitions/Validation"
                }
            },
            "required": ["type", "name"],
            "title": "Variable"
        },
        "OptionClass": {
            "type": "object",
            "additionalProperties": false,
            "properties": {
                "label": {
                    "type": "string"
                },
                "value": {
                    "$ref": "#/definitions/Value"
                },
                "negative": {
                    "type": "boolean"
                }
            },
            "required": ["label", "value"],
            "title": "OptionClass"
        },
        "Validation": {
            "type": "object",
            "additionalProperties": false,
            "properties": {
                "required": {
                    "type": "boolean"
                },
                "requiredAcceptsNull": {
                    "type": "boolean"
                },
                "minLength": {
                    "type": "integer"
                },
                "maxLength": {
                    "type": "integer"
                },
                "minValue": {
                    "type": "integer"
                },
                "maxValue": {
                    "type": "integer"
                },
                "minSelected": {
                    "type": "integer"
                },
                "maxSelected": {
                    "type": "integer"
                },
                "unique": {
                    "type": "boolean"
                },
                "differentFrom": {
                    "type": "string"
                },
                "sameAs": {
                    "type": "string"
                }
            },
            "title": "Validation"
        },
        "Node": {
            "type": "object",
            "additionalProperties": false,
            "title": "Node",
            "patternProperties": {
                ".+": {
                    "$ref": "#/definitions/NodeTypeDef"
                }
            }
        },
        "NodeTypeDef": {
            "type": "object",
            "additionalProperties": false,
            "properties": {
                "name": {
                    "type": "string"
                },
                "displayVariable": {
                    "type": "string"
                },
                "iconVariant": {
                    "type": "string"
                },
                "variables": {
                    "$ref": "#/definitions/Variables"
                },
                "color": {
                    "type": "string"
                }
            },
            "required": ["name", "color"],
            "title": "NodeTypeDef"
        },
        "Ego": {
            "type:": "object",
            "additionalProperties": false,
            "properties": {
                "variables": {
                    "$ref": "#/definitions/Variables"
                }
            }
        },
        "OptionElement": {
            "anyOf": [{
                    "$ref": "#/definitions/OptionClass"
                }, {
                    "type": "integer"
                }, {
                    "type": "string"
                }],
            "title": "Variable Option"
        },
        "Value": {
            "anyOf": [{
                    "type": "integer"
                }, {
                    "type": "string",
                    "pattern": "^[a-zA-Z0-9._:-]+$"
                }, {
                    "type": "boolean"
                }],
            "title": "Value"
        },
        "Entity": {
            "type": "string",
            "enum": ["edge", "node", "ego"],
            "title": "Entity"
        },
        "Direction": {
            "type": "string",
            "enum": ["desc", "asc"],
            "title": "Direction"
        }
    }
};
validate.errors = null;
module.exports = validate;
