"use strict";
export const validate = validate10;
export default validate10;
const schema11 = { "$schema": "http://json-schema.org/draft-07/schema#", "$ref": "#/definitions/Protocol", "definitions": { "Protocol": { "type": "object", "additionalProperties": false, "properties": { "name": { "type": "string" }, "description": { "type": "string" }, "lastModified": { "type": "string", "format": "date-time" }, "schemaVersion": { "type": "string" }, "codebook": { "$ref": "#/definitions/codebook" }, "assetManifest": { "$ref": "#/definitions/AssetManifest" }, "stages": { "type": "array", "items": { "$ref": "#/definitions/Stage" }, "minItems": 1 } }, "required": ["stages", "codebook"], "title": "Protocol" }, "AssetManifest": { "type": "object", "title": "AssetManifest" }, "Form": { "type": ["object", "null"], "additionalProperties": false, "properties": { "title": { "type": "string" }, "fields": { "type": "array", "items": { "$ref": "#/definitions/Field" } } }, "required": ["fields"], "title": "Form" }, "Field": { "type": "object", "additionalProperties": false, "properties": { "variable": { "type": "string" }, "prompt": { "type": "string" } }, "required": ["variable", "prompt"], "title": "Field" }, "Stage": { "type": "object", "additionalProperties": false, "properties": { "id": { "type": "string" }, "type": { "type": "string", "enum": ["Narrative", "AlterForm", "AlterEdgeForm", "EgoForm", "NameGenerator", "NameGeneratorQuickAdd", "NameGeneratorList", "NameGeneratorAutoComplete", "Sociogram", "Information", "OrdinalBin", "CategoricalBin"] }, "label": { "type": "string" }, "form": { "$ref": "#/definitions/Form" }, "quickAdd": { "type": ["string", "null"] }, "dataSource": { "type": ["string", "null"] }, "subject": { "$ref": "#/definitions/Subject" }, "panels": { "type": "array", "items": { "$ref": "#/definitions/Panel" } }, "prompts": { "type": "array", "items": { "$ref": "#/definitions/Prompt" }, "minItems": 1 }, "presets": { "type": "array", "items": { "$ref": "#/definitions/Preset" }, "minItems": 1 }, "background": { "type": "object", "properties": { "image": { "type": "string" }, "concentricCircles": { "type": "integer" }, "skewedTowardCenter": { "type": "boolean" } }, "additionalProperties": false, "required": ["concentricCircles", "skewedTowardCenter"] }, "sortOptions": { "$ref": "#/definitions/SortOptions" }, "cardOptions": { "type": "object", "patternProperties": { "^[0-9]{2,6}$": { "$ref": "#/definitions/CardOptions" } } }, "searchOptions": { "$ref": "#/definitions/SearchOptions" }, "behaviours": { "$ref": "#/definitions/Behaviours" }, "showExistingNodes": { "type": "boolean" }, "title": { "type": "string" }, "items": { "type": "array", "items": { "$ref": "#/definitions/Item" } }, "introductionPanel": { "$ref": "#/definitions/IntroductionPanel" }, "skipLogic": { "$ref": "#/definitions/SkipLogic" } }, "required": ["id", "label", "type"], "title": "Interface", "anyOf": [{ "properties": { "type": { "const": "EgoForm" } }, "required": ["form", "introductionPanel"] }, { "properties": { "type": { "const": "AlterForm" } }, "required": ["form", "introductionPanel"] }, { "properties": { "type": { "const": "AlterEdgeForm" } }, "required": ["form", "introductionPanel"] }, { "properties": { "type": { "const": "Information" } }, "required": ["items"] }, { "properties": { "type": { "const": "Narrative" } }, "required": ["presets", "background"] }, { "properties": { "type": { "enum": ["NameGenerator", "NameGeneratorQuickAdd", "NameGeneratorList", "NameGeneratorAutoComplete", "Sociogram", "OrdinalBin", "CategoricalBin"] } }, "required": ["prompts"] }] }, "Item": { "type": "object", "additionalProperties": false, "properties": { "id": { "type": "string" }, "type": { "type": "string", "enum": ["text", "asset"] }, "content": { "type": "string" }, "description": { "type": "string" }, "size": { "type": "string" }, "loop": { "type": "boolean" } }, "required": ["content", "id", "type"], "title": "Item" }, "IntroductionPanel": { "type": "object", "additionalProperties": false, "properties": { "title": { "type": "string" }, "text": { "type": "string" } }, "required": ["title", "text"] }, "Panel": { "type": "object", "additionalProperties": false, "properties": { "id": { "type": "string" }, "title": { "type": "string" }, "filter": { "$ref": "#/definitions/Filter" }, "dataSource": { "type": ["string", "null"] } }, "required": ["id", "title", "dataSource"], "title": "Panel" }, "Filter": { "type": ["object", "null"], "additionalProperties": false, "properties": { "join": { "type": "string", "enum": ["OR", "AND"] }, "rules": { "type": "array", "items": { "$ref": "#/definitions/Rule" } } }, "title": "Filter" }, "Rule": { "type": "object", "additionalProperties": false, "properties": { "type": { "type": "string", "enum": ["alter", "ego", "edge"] }, "id": { "type": "string" }, "options": { "$ref": "#/definitions/Options" } }, "required": ["id", "options", "type"], "title": "Rule" }, "Options": { "type": "object", "additionalProperties": false, "properties": { "type": { "type": "string" }, "attribute": { "type": "string" }, "operator": { "type": "string", "enum": ["EXISTS", "NOT_EXISTS", "EXACTLY", "NOT", "GREATER_THAN", "GREATER_THAN_OR_EQUAL", "LESS_THAN", "LESS_THAN_OR_EQUAL"] }, "value": { "type": ["integer", "string", "array", "boolean"] } }, "required": ["operator"], "title": "Rule Options", "allOf": [{ "if": { "properties": { "operator": { "enum": ["EXACTLY", "NOT", "GREATER_THAN", "GREATER_THAN_OR_EQUAL", "LESS_THAN", "LESS_THAN_OR_EQUAL"] } } }, "then": { "required": ["value"] } }] }, "Prompt": { "type": "object", "additionalProperties": false, "properties": { "id": { "type": "string" }, "text": { "type": "string" }, "additionalAttributes": { "$ref": "#/definitions/AdditionalAttributes" }, "variable": { "type": "string" }, "bucketSortOrder": { "type": "array", "items": { "$ref": "#/definitions/SortOrder" } }, "binSortOrder": { "type": "array", "items": { "$ref": "#/definitions/SortOrder" } }, "sortOrder": { "type": "array", "items": { "$ref": "#/definitions/SortOrder" } }, "color": { "type": "string" }, "layout": { "$ref": "#/definitions/Layout" }, "edges": { "$ref": "#/definitions/Edges" }, "highlight": { "$ref": "#/definitions/Highlight" } }, "required": ["id", "text"], "title": "Prompt" }, "Preset": { "type": "object", "additionalProperties": false, "properties": { "id": { "type": "string" }, "label": { "type": "string" }, "layoutVariable": { "type": "string" }, "groupVariable": { "type": "string" }, "edges": { "$ref": "#/definitions/Edges" }, "highlight": { "$ref": "#/definitions/NarrativeHighlight" } }, "required": ["id", "label", "layoutVariable"], "title": "Preset" }, "Behaviours": { "type": "object", "additionalProperties": false, "properties": { "freeDraw": { "type": "boolean" }, "featureNode": { "type": "boolean" }, "allowRepositioning": { "type": "boolean" } }, "required": [], "title": "Behaviours" }, "AdditionalAttributes": { "type": "array", "title": "AdditionalAttributes", "items": { "$ref": "#/definitions/AdditionalAttribute" } }, "AdditionalAttribute": { "type": "object", "additionalProperties": false, "properties": { "variable": { "type": "string" }, "value": { "type": ["integer", "string", "array", "boolean"] } }, "required": ["variable", "value"], "title": "AdditionalAttribute" }, "SortOrder": { "type": "object", "additionalProperties": false, "properties": { "property": { "type": "string" }, "direction": { "$ref": "#/definitions/Direction" } }, "required": ["direction", "property"], "title": "SortOrder" }, "CardOptions": { "type": "object", "additionalProperties": false, "properties": { "displayLabel": { "type": "string" }, "additionalProperties": { "type": "array", "items": { "$ref": "#/definitions/Property" } } }, "required": ["displayLabel"], "title": "CardOptions" }, "Property": { "type": "object", "additionalProperties": false, "properties": { "label": { "type": "string" }, "variable": { "type": "string" } }, "required": ["label", "variable"], "title": "Property" }, "Edges": { "type": "object", "additionalProperties": false, "properties": { "display": { "type": "array", "items": { "type": "string" } }, "create": { "type": "string" } }, "required": [], "title": "Edges" }, "NarrativeHighlight": { "type": "array", "items": { "type": "string" }, "title": "NarrativeHighlight" }, "Highlight": { "type": "object", "additionalProperties": false, "properties": { "variable": { "type": "string" }, "allowHighlighting": { "type": "boolean" } }, "required": ["allowHighlighting"], "title": "Highlight" }, "Layout": { "type": "object", "additionalProperties": false, "properties": { "layoutVariable": { "type": "string" }, "allowPositioning": { "type": "boolean" } }, "required": ["layoutVariable"], "title": "Layout" }, "SearchOptions": { "type": "object", "additionalProperties": false, "properties": { "fuzziness": { "type": "number" }, "matchProperties": { "type": "array", "items": { "type": "string" } } }, "required": ["fuzziness", "matchProperties"], "title": "SearchOptions" }, "SortOptions": { "type": "object", "additionalProperties": false, "properties": { "sortOrder": { "type": "array", "items": { "$ref": "#/definitions/SortOrder" } }, "sortableProperties": { "type": "array", "items": { "$ref": "#/definitions/Property" } } }, "required": ["sortOrder", "sortableProperties"], "title": "SortOptions" }, "Subject": { "type": "object", "additionalProperties": false, "properties": { "entity": { "$ref": "#/definitions/Entity" }, "type": { "type": "string" } }, "required": ["entity", "type"], "title": "Subject" }, "SkipLogic": { "type": "object", "additionalProperties": false, "properties": { "action": { "type": "string", "enum": ["SHOW", "SKIP"] }, "filter": { "$ref": "#/definitions/Filter" } }, "required": ["action", "filter"], "title": "SkipLogic" }, "codebook": { "type": "object", "additionalProperties": false, "properties": { "node": { "$ref": "#/definitions/Node" }, "edge": { "$ref": "#/definitions/Edge" }, "ego": { "$ref": "#/definitions/Ego" } }, "required": [], "title": "codebook" }, "Edge": { "type": "object", "additionalProperties": false, "title": "Edge", "patternProperties": { ".+": { "$ref": "#/definitions/EdgeTypeDef" } } }, "EdgeTypeDef": { "type": "object", "additionalProperties": false, "properties": { "name": { "type": "string" }, "color": { "type": "string" }, "variables": { "$ref": "#/definitions/Variables" } }, "required": ["name", "color"], "title": "EdgeTypeDef" }, "Variables": { "type": "object", "additionalProperties": false, "title": "Variables", "patternProperties": { ".+": { "$ref": "#/definitions/Variable" } } }, "Variable": { "type": "object", "additionalProperties": false, "properties": { "name": { "type": "string" }, "type": { "type": "string", "enum": ["boolean", "text", "number", "datetime", "ordinal", "categorical", "layout", "location"] }, "component": { "type": "string", "enum": ["CheckboxGroup", "Number", "RadioGroup", "Text", "Toggle", "ToggleButtonGroup"] }, "options": { "type": "array", "items": { "$ref": "#/definitions/OptionElement" } }, "validation": { "$ref": "#/definitions/Validation" } }, "required": ["type", "name"], "title": "Variable" }, "OptionClass": { "type": "object", "additionalProperties": false, "properties": { "label": { "type": "string" }, "value": { "$ref": "#/definitions/Value" } }, "required": ["label", "value"], "title": "OptionClass" }, "Validation": { "type": "object", "additionalProperties": false, "properties": { "required": { "type": "boolean" }, "requiredAcceptsNull": { "type": "boolean" }, "minLength": { "type": "integer" }, "maxLength": { "type": "integer" }, "minValue": { "type": "integer" }, "maxValue": { "type": "integer" }, "minSelected": { "type": "integer" }, "maxSelected": { "type": "integer" } }, "title": "Validation" }, "Node": { "type": "object", "additionalProperties": false, "title": "Node", "patternProperties": { ".+": { "$ref": "#/definitions/NodeTypeDef" } } }, "NodeTypeDef": { "type": "object", "additionalProperties": false, "properties": { "name": { "type": "string" }, "displayVariable": { "type": "string" }, "iconVariant": { "type": "string" }, "variables": { "$ref": "#/definitions/Variables" }, "color": { "type": "string" } }, "required": ["name", "color"], "title": "NodeTypeDef" }, "Ego": { "type": "object", "additionalProperties": false, "properties": { "variables": { "$ref": "#/definitions/Variables" } } }, "OptionElement": { "anyOf": [{ "$ref": "#/definitions/OptionClass" }, { "type": "integer" }, { "type": "string" }], "title": "Variable Option" }, "Value": { "anyOf": [{ "type": "integer" }, { "type": "string" }], "title": "Value" }, "Entity": { "type": "string", "enum": ["edge", "node", "ego"], "title": "Entity" }, "Direction": { "type": "string", "enum": ["desc", "asc"], "title": "Direction" } } };
const schema12 = { "type": "object", "additionalProperties": false, "properties": { "name": { "type": "string" }, "description": { "type": "string" }, "lastModified": { "type": "string", "format": "date-time" }, "schemaVersion": { "type": "string" }, "codebook": { "$ref": "#/definitions/codebook" }, "assetManifest": { "$ref": "#/definitions/AssetManifest" }, "stages": { "type": "array", "items": { "$ref": "#/definitions/Stage" }, "minItems": 1 } }, "required": ["stages", "codebook"], "title": "Protocol" };
const schema25 = { "type": "object", "title": "AssetManifest" };
const formats0 = /\d+/;
const schema13 = { "type": "object", "additionalProperties": false, "properties": { "node": { "$ref": "#/definitions/Node" }, "edge": { "$ref": "#/definitions/Edge" }, "ego": { "$ref": "#/definitions/Ego" } }, "required": [], "title": "codebook" };
const schema14 = { "type": "object", "additionalProperties": false, "title": "Node", "patternProperties": { ".+": { "$ref": "#/definitions/NodeTypeDef" } } };
const pattern0 = new RegExp(".+", "u");
const schema15 = { "type": "object", "additionalProperties": false, "properties": { "name": { "type": "string" }, "displayVariable": { "type": "string" }, "iconVariant": { "type": "string" }, "variables": { "$ref": "#/definitions/Variables" }, "color": { "type": "string" } }, "required": ["name", "color"], "title": "NodeTypeDef" };
const schema16 = { "type": "object", "additionalProperties": false, "title": "Variables", "patternProperties": { ".+": { "$ref": "#/definitions/Variable" } } };
const schema17 = { "type": "object", "additionalProperties": false, "properties": { "name": { "type": "string" }, "type": { "type": "string", "enum": ["boolean", "text", "number", "datetime", "ordinal", "categorical", "layout", "location"] }, "component": { "type": "string", "enum": ["CheckboxGroup", "Number", "RadioGroup", "Text", "Toggle", "ToggleButtonGroup"] }, "options": { "type": "array", "items": { "$ref": "#/definitions/OptionElement" } }, "validation": { "$ref": "#/definitions/Validation" } }, "required": ["type", "name"], "title": "Variable" };
const schema21 = { "type": "object", "additionalProperties": false, "properties": { "required": { "type": "boolean" }, "requiredAcceptsNull": { "type": "boolean" }, "minLength": { "type": "integer" }, "maxLength": { "type": "integer" }, "minValue": { "type": "integer" }, "maxValue": { "type": "integer" }, "minSelected": { "type": "integer" }, "maxSelected": { "type": "integer" } }, "title": "Validation" };
const schema18 = { "anyOf": [{ "$ref": "#/definitions/OptionClass" }, { "type": "integer" }, { "type": "string" }], "title": "Variable Option" };
const schema19 = { "type": "object", "additionalProperties": false, "properties": { "label": { "type": "string" }, "value": { "$ref": "#/definitions/Value" } }, "required": ["label", "value"], "title": "OptionClass" };
const schema20 = { "anyOf": [{ "type": "integer" }, { "type": "string" }], "title": "Value" };
function validate18(data, { instancePath = "", parentData, parentDataProperty, rootData = data } = {}) { let vErrors = null; let errors = 0; if (data && typeof data == "object" && !Array.isArray(data)) {
    if (data.label === undefined) {
        const err0 = { instancePath, schemaPath: "#/required", keyword: "required", params: { missingProperty: "label" }, message: "must have required property '" + "label" + "'" };
        if (vErrors === null) {
            vErrors = [err0];
        }
        else {
            vErrors.push(err0);
        }
        errors++;
    }
    if (data.value === undefined) {
        const err1 = { instancePath, schemaPath: "#/required", keyword: "required", params: { missingProperty: "value" }, message: "must have required property '" + "value" + "'" };
        if (vErrors === null) {
            vErrors = [err1];
        }
        else {
            vErrors.push(err1);
        }
        errors++;
    }
    for (const key0 in data) {
        if (!((key0 === "label") || (key0 === "value"))) {
            const err2 = { instancePath, schemaPath: "#/additionalProperties", keyword: "additionalProperties", params: { additionalProperty: key0 }, message: "must NOT have additional properties" };
            if (vErrors === null) {
                vErrors = [err2];
            }
            else {
                vErrors.push(err2);
            }
            errors++;
        }
    }
    if (data.label !== undefined) {
        if (typeof data.label !== "string") {
            const err3 = { instancePath: instancePath + "/label", schemaPath: "#/properties/label/type", keyword: "type", params: { type: "string" }, message: "must be string" };
            if (vErrors === null) {
                vErrors = [err3];
            }
            else {
                vErrors.push(err3);
            }
            errors++;
        }
    }
    if (data.value !== undefined) {
        let data1 = data.value;
        const _errs6 = errors;
        let valid2 = false;
        const _errs7 = errors;
        if (!(((typeof data1 == "number") && (!(data1 % 1) && !isNaN(data1))) && (isFinite(data1)))) {
            const err4 = { instancePath: instancePath + "/value", schemaPath: "#/definitions/Value/anyOf/0/type", keyword: "type", params: { type: "integer" }, message: "must be integer" };
            if (vErrors === null) {
                vErrors = [err4];
            }
            else {
                vErrors.push(err4);
            }
            errors++;
        }
        var _valid0 = _errs7 === errors;
        valid2 = valid2 || _valid0;
        if (!valid2) {
            const _errs9 = errors;
            if (typeof data1 !== "string") {
                const err5 = { instancePath: instancePath + "/value", schemaPath: "#/definitions/Value/anyOf/1/type", keyword: "type", params: { type: "string" }, message: "must be string" };
                if (vErrors === null) {
                    vErrors = [err5];
                }
                else {
                    vErrors.push(err5);
                }
                errors++;
            }
            var _valid0 = _errs9 === errors;
            valid2 = valid2 || _valid0;
        }
        if (!valid2) {
            const err6 = { instancePath: instancePath + "/value", schemaPath: "#/definitions/Value/anyOf", keyword: "anyOf", params: {}, message: "must match a schema in anyOf" };
            if (vErrors === null) {
                vErrors = [err6];
            }
            else {
                vErrors.push(err6);
            }
            errors++;
        }
        else {
            errors = _errs6;
            if (vErrors !== null) {
                if (_errs6) {
                    vErrors.length = _errs6;
                }
                else {
                    vErrors = null;
                }
            }
        }
    }
}
else {
    const err7 = { instancePath, schemaPath: "#/type", keyword: "type", params: { type: "object" }, message: "must be object" };
    if (vErrors === null) {
        vErrors = [err7];
    }
    else {
        vErrors.push(err7);
    }
    errors++;
} validate18.errors = vErrors; return errors === 0; }
function validate17(data, { instancePath = "", parentData, parentDataProperty, rootData = data } = {}) { let vErrors = null; let errors = 0; const _errs0 = errors; let valid0 = false; const _errs1 = errors; if (!(validate18(data, { instancePath, parentData, parentDataProperty, rootData }))) {
    vErrors = vErrors === null ? validate18.errors : vErrors.concat(validate18.errors);
    errors = vErrors.length;
} var _valid0 = _errs1 === errors; valid0 = valid0 || _valid0; if (!valid0) {
    const _errs2 = errors;
    if (!(((typeof data == "number") && (!(data % 1) && !isNaN(data))) && (isFinite(data)))) {
        const err0 = { instancePath, schemaPath: "#/anyOf/1/type", keyword: "type", params: { type: "integer" }, message: "must be integer" };
        if (vErrors === null) {
            vErrors = [err0];
        }
        else {
            vErrors.push(err0);
        }
        errors++;
    }
    var _valid0 = _errs2 === errors;
    valid0 = valid0 || _valid0;
    if (!valid0) {
        const _errs4 = errors;
        if (typeof data !== "string") {
            const err1 = { instancePath, schemaPath: "#/anyOf/2/type", keyword: "type", params: { type: "string" }, message: "must be string" };
            if (vErrors === null) {
                vErrors = [err1];
            }
            else {
                vErrors.push(err1);
            }
            errors++;
        }
        var _valid0 = _errs4 === errors;
        valid0 = valid0 || _valid0;
    }
} if (!valid0) {
    const err2 = { instancePath, schemaPath: "#/anyOf", keyword: "anyOf", params: {}, message: "must match a schema in anyOf" };
    if (vErrors === null) {
        vErrors = [err2];
    }
    else {
        vErrors.push(err2);
    }
    errors++;
}
else {
    errors = _errs0;
    if (vErrors !== null) {
        if (_errs0) {
            vErrors.length = _errs0;
        }
        else {
            vErrors = null;
        }
    }
} validate17.errors = vErrors; return errors === 0; }
function validate16(data, { instancePath = "", parentData, parentDataProperty, rootData = data } = {}) { let vErrors = null; let errors = 0; if (data && typeof data == "object" && !Array.isArray(data)) {
    if (data.type === undefined) {
        const err0 = { instancePath, schemaPath: "#/required", keyword: "required", params: { missingProperty: "type" }, message: "must have required property '" + "type" + "'" };
        if (vErrors === null) {
            vErrors = [err0];
        }
        else {
            vErrors.push(err0);
        }
        errors++;
    }
    if (data.name === undefined) {
        const err1 = { instancePath, schemaPath: "#/required", keyword: "required", params: { missingProperty: "name" }, message: "must have required property '" + "name" + "'" };
        if (vErrors === null) {
            vErrors = [err1];
        }
        else {
            vErrors.push(err1);
        }
        errors++;
    }
    for (const key0 in data) {
        if (!(((((key0 === "name") || (key0 === "type")) || (key0 === "component")) || (key0 === "options")) || (key0 === "validation"))) {
            const err2 = { instancePath, schemaPath: "#/additionalProperties", keyword: "additionalProperties", params: { additionalProperty: key0 }, message: "must NOT have additional properties" };
            if (vErrors === null) {
                vErrors = [err2];
            }
            else {
                vErrors.push(err2);
            }
            errors++;
        }
    }
    if (data.name !== undefined) {
        if (typeof data.name !== "string") {
            const err3 = { instancePath: instancePath + "/name", schemaPath: "#/properties/name/type", keyword: "type", params: { type: "string" }, message: "must be string" };
            if (vErrors === null) {
                vErrors = [err3];
            }
            else {
                vErrors.push(err3);
            }
            errors++;
        }
    }
    if (data.type !== undefined) {
        let data1 = data.type;
        if (typeof data1 !== "string") {
            const err4 = { instancePath: instancePath + "/type", schemaPath: "#/properties/type/type", keyword: "type", params: { type: "string" }, message: "must be string" };
            if (vErrors === null) {
                vErrors = [err4];
            }
            else {
                vErrors.push(err4);
            }
            errors++;
        }
        if (!((((((((data1 === "boolean") || (data1 === "text")) || (data1 === "number")) || (data1 === "datetime")) || (data1 === "ordinal")) || (data1 === "categorical")) || (data1 === "layout")) || (data1 === "location"))) {
            const err5 = { instancePath: instancePath + "/type", schemaPath: "#/properties/type/enum", keyword: "enum", params: { allowedValues: schema17.properties.type.enum }, message: "must be equal to one of the allowed values" };
            if (vErrors === null) {
                vErrors = [err5];
            }
            else {
                vErrors.push(err5);
            }
            errors++;
        }
    }
    if (data.component !== undefined) {
        let data2 = data.component;
        if (typeof data2 !== "string") {
            const err6 = { instancePath: instancePath + "/component", schemaPath: "#/properties/component/type", keyword: "type", params: { type: "string" }, message: "must be string" };
            if (vErrors === null) {
                vErrors = [err6];
            }
            else {
                vErrors.push(err6);
            }
            errors++;
        }
        if (!((((((data2 === "CheckboxGroup") || (data2 === "Number")) || (data2 === "RadioGroup")) || (data2 === "Text")) || (data2 === "Toggle")) || (data2 === "ToggleButtonGroup"))) {
            const err7 = { instancePath: instancePath + "/component", schemaPath: "#/properties/component/enum", keyword: "enum", params: { allowedValues: schema17.properties.component.enum }, message: "must be equal to one of the allowed values" };
            if (vErrors === null) {
                vErrors = [err7];
            }
            else {
                vErrors.push(err7);
            }
            errors++;
        }
    }
    if (data.options !== undefined) {
        let data3 = data.options;
        if (Array.isArray(data3)) {
            const len0 = data3.length;
            for (let i0 = 0; i0 < len0; i0++) {
                if (!(validate17(data3[i0], { instancePath: instancePath + "/options/" + i0, parentData: data3, parentDataProperty: i0, rootData }))) {
                    vErrors = vErrors === null ? validate17.errors : vErrors.concat(validate17.errors);
                    errors = vErrors.length;
                }
            }
        }
        else {
            const err8 = { instancePath: instancePath + "/options", schemaPath: "#/properties/options/type", keyword: "type", params: { type: "array" }, message: "must be array" };
            if (vErrors === null) {
                vErrors = [err8];
            }
            else {
                vErrors.push(err8);
            }
            errors++;
        }
    }
    if (data.validation !== undefined) {
        let data5 = data.validation;
        if (data5 && typeof data5 == "object" && !Array.isArray(data5)) {
            for (const key1 in data5) {
                if (!((((((((key1 === "required") || (key1 === "requiredAcceptsNull")) || (key1 === "minLength")) || (key1 === "maxLength")) || (key1 === "minValue")) || (key1 === "maxValue")) || (key1 === "minSelected")) || (key1 === "maxSelected"))) {
                    const err9 = { instancePath: instancePath + "/validation", schemaPath: "#/definitions/Validation/additionalProperties", keyword: "additionalProperties", params: { additionalProperty: key1 }, message: "must NOT have additional properties" };
                    if (vErrors === null) {
                        vErrors = [err9];
                    }
                    else {
                        vErrors.push(err9);
                    }
                    errors++;
                }
            }
            if (data5.required !== undefined) {
                if (typeof data5.required !== "boolean") {
                    const err10 = { instancePath: instancePath + "/validation/required", schemaPath: "#/definitions/Validation/properties/required/type", keyword: "type", params: { type: "boolean" }, message: "must be boolean" };
                    if (vErrors === null) {
                        vErrors = [err10];
                    }
                    else {
                        vErrors.push(err10);
                    }
                    errors++;
                }
            }
            if (data5.requiredAcceptsNull !== undefined) {
                if (typeof data5.requiredAcceptsNull !== "boolean") {
                    const err11 = { instancePath: instancePath + "/validation/requiredAcceptsNull", schemaPath: "#/definitions/Validation/properties/requiredAcceptsNull/type", keyword: "type", params: { type: "boolean" }, message: "must be boolean" };
                    if (vErrors === null) {
                        vErrors = [err11];
                    }
                    else {
                        vErrors.push(err11);
                    }
                    errors++;
                }
            }
            if (data5.minLength !== undefined) {
                let data8 = data5.minLength;
                if (!(((typeof data8 == "number") && (!(data8 % 1) && !isNaN(data8))) && (isFinite(data8)))) {
                    const err12 = { instancePath: instancePath + "/validation/minLength", schemaPath: "#/definitions/Validation/properties/minLength/type", keyword: "type", params: { type: "integer" }, message: "must be integer" };
                    if (vErrors === null) {
                        vErrors = [err12];
                    }
                    else {
                        vErrors.push(err12);
                    }
                    errors++;
                }
            }
            if (data5.maxLength !== undefined) {
                let data9 = data5.maxLength;
                if (!(((typeof data9 == "number") && (!(data9 % 1) && !isNaN(data9))) && (isFinite(data9)))) {
                    const err13 = { instancePath: instancePath + "/validation/maxLength", schemaPath: "#/definitions/Validation/properties/maxLength/type", keyword: "type", params: { type: "integer" }, message: "must be integer" };
                    if (vErrors === null) {
                        vErrors = [err13];
                    }
                    else {
                        vErrors.push(err13);
                    }
                    errors++;
                }
            }
            if (data5.minValue !== undefined) {
                let data10 = data5.minValue;
                if (!(((typeof data10 == "number") && (!(data10 % 1) && !isNaN(data10))) && (isFinite(data10)))) {
                    const err14 = { instancePath: instancePath + "/validation/minValue", schemaPath: "#/definitions/Validation/properties/minValue/type", keyword: "type", params: { type: "integer" }, message: "must be integer" };
                    if (vErrors === null) {
                        vErrors = [err14];
                    }
                    else {
                        vErrors.push(err14);
                    }
                    errors++;
                }
            }
            if (data5.maxValue !== undefined) {
                let data11 = data5.maxValue;
                if (!(((typeof data11 == "number") && (!(data11 % 1) && !isNaN(data11))) && (isFinite(data11)))) {
                    const err15 = { instancePath: instancePath + "/validation/maxValue", schemaPath: "#/definitions/Validation/properties/maxValue/type", keyword: "type", params: { type: "integer" }, message: "must be integer" };
                    if (vErrors === null) {
                        vErrors = [err15];
                    }
                    else {
                        vErrors.push(err15);
                    }
                    errors++;
                }
            }
            if (data5.minSelected !== undefined) {
                let data12 = data5.minSelected;
                if (!(((typeof data12 == "number") && (!(data12 % 1) && !isNaN(data12))) && (isFinite(data12)))) {
                    const err16 = { instancePath: instancePath + "/validation/minSelected", schemaPath: "#/definitions/Validation/properties/minSelected/type", keyword: "type", params: { type: "integer" }, message: "must be integer" };
                    if (vErrors === null) {
                        vErrors = [err16];
                    }
                    else {
                        vErrors.push(err16);
                    }
                    errors++;
                }
            }
            if (data5.maxSelected !== undefined) {
                let data13 = data5.maxSelected;
                if (!(((typeof data13 == "number") && (!(data13 % 1) && !isNaN(data13))) && (isFinite(data13)))) {
                    const err17 = { instancePath: instancePath + "/validation/maxSelected", schemaPath: "#/definitions/Validation/properties/maxSelected/type", keyword: "type", params: { type: "integer" }, message: "must be integer" };
                    if (vErrors === null) {
                        vErrors = [err17];
                    }
                    else {
                        vErrors.push(err17);
                    }
                    errors++;
                }
            }
        }
        else {
            const err18 = { instancePath: instancePath + "/validation", schemaPath: "#/definitions/Validation/type", keyword: "type", params: { type: "object" }, message: "must be object" };
            if (vErrors === null) {
                vErrors = [err18];
            }
            else {
                vErrors.push(err18);
            }
            errors++;
        }
    }
}
else {
    const err19 = { instancePath, schemaPath: "#/type", keyword: "type", params: { type: "object" }, message: "must be object" };
    if (vErrors === null) {
        vErrors = [err19];
    }
    else {
        vErrors.push(err19);
    }
    errors++;
} validate16.errors = vErrors; return errors === 0; }
function validate15(data, { instancePath = "", parentData, parentDataProperty, rootData = data } = {}) { let vErrors = null; let errors = 0; if (data && typeof data == "object" && !Array.isArray(data)) {
    for (const key0 in data) {
        if (!(pattern0.test(key0))) {
            const err0 = { instancePath, schemaPath: "#/additionalProperties", keyword: "additionalProperties", params: { additionalProperty: key0 }, message: "must NOT have additional properties" };
            if (vErrors === null) {
                vErrors = [err0];
            }
            else {
                vErrors.push(err0);
            }
            errors++;
        }
    }
    for (const key1 in data) {
        if (pattern0.test(key1)) {
            if (!(validate16(data[key1], { instancePath: instancePath + "/" + key1.replace(/~/g, "~0").replace(/\//g, "~1"), parentData: data, parentDataProperty: key1, rootData }))) {
                vErrors = vErrors === null ? validate16.errors : vErrors.concat(validate16.errors);
                errors = vErrors.length;
            }
        }
    }
}
else {
    const err1 = { instancePath, schemaPath: "#/type", keyword: "type", params: { type: "object" }, message: "must be object" };
    if (vErrors === null) {
        vErrors = [err1];
    }
    else {
        vErrors.push(err1);
    }
    errors++;
} validate15.errors = vErrors; return errors === 0; }
function validate14(data, { instancePath = "", parentData, parentDataProperty, rootData = data } = {}) { let vErrors = null; let errors = 0; if (data && typeof data == "object" && !Array.isArray(data)) {
    if (data.name === undefined) {
        const err0 = { instancePath, schemaPath: "#/required", keyword: "required", params: { missingProperty: "name" }, message: "must have required property '" + "name" + "'" };
        if (vErrors === null) {
            vErrors = [err0];
        }
        else {
            vErrors.push(err0);
        }
        errors++;
    }
    if (data.color === undefined) {
        const err1 = { instancePath, schemaPath: "#/required", keyword: "required", params: { missingProperty: "color" }, message: "must have required property '" + "color" + "'" };
        if (vErrors === null) {
            vErrors = [err1];
        }
        else {
            vErrors.push(err1);
        }
        errors++;
    }
    for (const key0 in data) {
        if (!(((((key0 === "name") || (key0 === "displayVariable")) || (key0 === "iconVariant")) || (key0 === "variables")) || (key0 === "color"))) {
            const err2 = { instancePath, schemaPath: "#/additionalProperties", keyword: "additionalProperties", params: { additionalProperty: key0 }, message: "must NOT have additional properties" };
            if (vErrors === null) {
                vErrors = [err2];
            }
            else {
                vErrors.push(err2);
            }
            errors++;
        }
    }
    if (data.name !== undefined) {
        if (typeof data.name !== "string") {
            const err3 = { instancePath: instancePath + "/name", schemaPath: "#/properties/name/type", keyword: "type", params: { type: "string" }, message: "must be string" };
            if (vErrors === null) {
                vErrors = [err3];
            }
            else {
                vErrors.push(err3);
            }
            errors++;
        }
    }
    if (data.displayVariable !== undefined) {
        if (typeof data.displayVariable !== "string") {
            const err4 = { instancePath: instancePath + "/displayVariable", schemaPath: "#/properties/displayVariable/type", keyword: "type", params: { type: "string" }, message: "must be string" };
            if (vErrors === null) {
                vErrors = [err4];
            }
            else {
                vErrors.push(err4);
            }
            errors++;
        }
    }
    if (data.iconVariant !== undefined) {
        if (typeof data.iconVariant !== "string") {
            const err5 = { instancePath: instancePath + "/iconVariant", schemaPath: "#/properties/iconVariant/type", keyword: "type", params: { type: "string" }, message: "must be string" };
            if (vErrors === null) {
                vErrors = [err5];
            }
            else {
                vErrors.push(err5);
            }
            errors++;
        }
    }
    if (data.variables !== undefined) {
        if (!(validate15(data.variables, { instancePath: instancePath + "/variables", parentData: data, parentDataProperty: "variables", rootData }))) {
            vErrors = vErrors === null ? validate15.errors : vErrors.concat(validate15.errors);
            errors = vErrors.length;
        }
    }
    if (data.color !== undefined) {
        if (typeof data.color !== "string") {
            const err6 = { instancePath: instancePath + "/color", schemaPath: "#/properties/color/type", keyword: "type", params: { type: "string" }, message: "must be string" };
            if (vErrors === null) {
                vErrors = [err6];
            }
            else {
                vErrors.push(err6);
            }
            errors++;
        }
    }
}
else {
    const err7 = { instancePath, schemaPath: "#/type", keyword: "type", params: { type: "object" }, message: "must be object" };
    if (vErrors === null) {
        vErrors = [err7];
    }
    else {
        vErrors.push(err7);
    }
    errors++;
} validate14.errors = vErrors; return errors === 0; }
function validate13(data, { instancePath = "", parentData, parentDataProperty, rootData = data } = {}) { let vErrors = null; let errors = 0; if (data && typeof data == "object" && !Array.isArray(data)) {
    for (const key0 in data) {
        if (!(pattern0.test(key0))) {
            const err0 = { instancePath, schemaPath: "#/additionalProperties", keyword: "additionalProperties", params: { additionalProperty: key0 }, message: "must NOT have additional properties" };
            if (vErrors === null) {
                vErrors = [err0];
            }
            else {
                vErrors.push(err0);
            }
            errors++;
        }
    }
    for (const key1 in data) {
        if (pattern0.test(key1)) {
            if (!(validate14(data[key1], { instancePath: instancePath + "/" + key1.replace(/~/g, "~0").replace(/\//g, "~1"), parentData: data, parentDataProperty: key1, rootData }))) {
                vErrors = vErrors === null ? validate14.errors : vErrors.concat(validate14.errors);
                errors = vErrors.length;
            }
        }
    }
}
else {
    const err1 = { instancePath, schemaPath: "#/type", keyword: "type", params: { type: "object" }, message: "must be object" };
    if (vErrors === null) {
        vErrors = [err1];
    }
    else {
        vErrors.push(err1);
    }
    errors++;
} validate13.errors = vErrors; return errors === 0; }
const schema22 = { "type": "object", "additionalProperties": false, "title": "Edge", "patternProperties": { ".+": { "$ref": "#/definitions/EdgeTypeDef" } } };
const schema23 = { "type": "object", "additionalProperties": false, "properties": { "name": { "type": "string" }, "color": { "type": "string" }, "variables": { "$ref": "#/definitions/Variables" } }, "required": ["name", "color"], "title": "EdgeTypeDef" };
function validate26(data, { instancePath = "", parentData, parentDataProperty, rootData = data } = {}) { let vErrors = null; let errors = 0; if (data && typeof data == "object" && !Array.isArray(data)) {
    if (data.name === undefined) {
        const err0 = { instancePath, schemaPath: "#/required", keyword: "required", params: { missingProperty: "name" }, message: "must have required property '" + "name" + "'" };
        if (vErrors === null) {
            vErrors = [err0];
        }
        else {
            vErrors.push(err0);
        }
        errors++;
    }
    if (data.color === undefined) {
        const err1 = { instancePath, schemaPath: "#/required", keyword: "required", params: { missingProperty: "color" }, message: "must have required property '" + "color" + "'" };
        if (vErrors === null) {
            vErrors = [err1];
        }
        else {
            vErrors.push(err1);
        }
        errors++;
    }
    for (const key0 in data) {
        if (!(((key0 === "name") || (key0 === "color")) || (key0 === "variables"))) {
            const err2 = { instancePath, schemaPath: "#/additionalProperties", keyword: "additionalProperties", params: { additionalProperty: key0 }, message: "must NOT have additional properties" };
            if (vErrors === null) {
                vErrors = [err2];
            }
            else {
                vErrors.push(err2);
            }
            errors++;
        }
    }
    if (data.name !== undefined) {
        if (typeof data.name !== "string") {
            const err3 = { instancePath: instancePath + "/name", schemaPath: "#/properties/name/type", keyword: "type", params: { type: "string" }, message: "must be string" };
            if (vErrors === null) {
                vErrors = [err3];
            }
            else {
                vErrors.push(err3);
            }
            errors++;
        }
    }
    if (data.color !== undefined) {
        if (typeof data.color !== "string") {
            const err4 = { instancePath: instancePath + "/color", schemaPath: "#/properties/color/type", keyword: "type", params: { type: "string" }, message: "must be string" };
            if (vErrors === null) {
                vErrors = [err4];
            }
            else {
                vErrors.push(err4);
            }
            errors++;
        }
    }
    if (data.variables !== undefined) {
        if (!(validate15(data.variables, { instancePath: instancePath + "/variables", parentData: data, parentDataProperty: "variables", rootData }))) {
            vErrors = vErrors === null ? validate15.errors : vErrors.concat(validate15.errors);
            errors = vErrors.length;
        }
    }
}
else {
    const err5 = { instancePath, schemaPath: "#/type", keyword: "type", params: { type: "object" }, message: "must be object" };
    if (vErrors === null) {
        vErrors = [err5];
    }
    else {
        vErrors.push(err5);
    }
    errors++;
} validate26.errors = vErrors; return errors === 0; }
function validate25(data, { instancePath = "", parentData, parentDataProperty, rootData = data } = {}) { let vErrors = null; let errors = 0; if (data && typeof data == "object" && !Array.isArray(data)) {
    for (const key0 in data) {
        if (!(pattern0.test(key0))) {
            const err0 = { instancePath, schemaPath: "#/additionalProperties", keyword: "additionalProperties", params: { additionalProperty: key0 }, message: "must NOT have additional properties" };
            if (vErrors === null) {
                vErrors = [err0];
            }
            else {
                vErrors.push(err0);
            }
            errors++;
        }
    }
    for (const key1 in data) {
        if (pattern0.test(key1)) {
            if (!(validate26(data[key1], { instancePath: instancePath + "/" + key1.replace(/~/g, "~0").replace(/\//g, "~1"), parentData: data, parentDataProperty: key1, rootData }))) {
                vErrors = vErrors === null ? validate26.errors : vErrors.concat(validate26.errors);
                errors = vErrors.length;
            }
        }
    }
}
else {
    const err1 = { instancePath, schemaPath: "#/type", keyword: "type", params: { type: "object" }, message: "must be object" };
    if (vErrors === null) {
        vErrors = [err1];
    }
    else {
        vErrors.push(err1);
    }
    errors++;
} validate25.errors = vErrors; return errors === 0; }
const schema24 = { "type": "object", "additionalProperties": false, "properties": { "variables": { "$ref": "#/definitions/Variables" } } };
function validate30(data, { instancePath = "", parentData, parentDataProperty, rootData = data } = {}) { let vErrors = null; let errors = 0; if (data && typeof data == "object" && !Array.isArray(data)) {
    for (const key0 in data) {
        if (!(key0 === "variables")) {
            const err0 = { instancePath, schemaPath: "#/additionalProperties", keyword: "additionalProperties", params: { additionalProperty: key0 }, message: "must NOT have additional properties" };
            if (vErrors === null) {
                vErrors = [err0];
            }
            else {
                vErrors.push(err0);
            }
            errors++;
        }
    }
    if (data.variables !== undefined) {
        if (!(validate15(data.variables, { instancePath: instancePath + "/variables", parentData: data, parentDataProperty: "variables", rootData }))) {
            vErrors = vErrors === null ? validate15.errors : vErrors.concat(validate15.errors);
            errors = vErrors.length;
        }
    }
}
else {
    const err1 = { instancePath, schemaPath: "#/type", keyword: "type", params: { type: "object" }, message: "must be object" };
    if (vErrors === null) {
        vErrors = [err1];
    }
    else {
        vErrors.push(err1);
    }
    errors++;
} validate30.errors = vErrors; return errors === 0; }
function validate12(data, { instancePath = "", parentData, parentDataProperty, rootData = data } = {}) { let vErrors = null; let errors = 0; if (data && typeof data == "object" && !Array.isArray(data)) {
    for (const key0 in data) {
        if (!(((key0 === "node") || (key0 === "edge")) || (key0 === "ego"))) {
            const err0 = { instancePath, schemaPath: "#/additionalProperties", keyword: "additionalProperties", params: { additionalProperty: key0 }, message: "must NOT have additional properties" };
            if (vErrors === null) {
                vErrors = [err0];
            }
            else {
                vErrors.push(err0);
            }
            errors++;
        }
    }
    if (data.node !== undefined) {
        if (!(validate13(data.node, { instancePath: instancePath + "/node", parentData: data, parentDataProperty: "node", rootData }))) {
            vErrors = vErrors === null ? validate13.errors : vErrors.concat(validate13.errors);
            errors = vErrors.length;
        }
    }
    if (data.edge !== undefined) {
        if (!(validate25(data.edge, { instancePath: instancePath + "/edge", parentData: data, parentDataProperty: "edge", rootData }))) {
            vErrors = vErrors === null ? validate25.errors : vErrors.concat(validate25.errors);
            errors = vErrors.length;
        }
    }
    if (data.ego !== undefined) {
        if (!(validate30(data.ego, { instancePath: instancePath + "/ego", parentData: data, parentDataProperty: "ego", rootData }))) {
            vErrors = vErrors === null ? validate30.errors : vErrors.concat(validate30.errors);
            errors = vErrors.length;
        }
    }
}
else {
    const err1 = { instancePath, schemaPath: "#/type", keyword: "type", params: { type: "object" }, message: "must be object" };
    if (vErrors === null) {
        vErrors = [err1];
    }
    else {
        vErrors.push(err1);
    }
    errors++;
} validate12.errors = vErrors; return errors === 0; }
const schema26 = { "type": "object", "additionalProperties": false, "properties": { "id": { "type": "string" }, "type": { "type": "string", "enum": ["Narrative", "AlterForm", "AlterEdgeForm", "EgoForm", "NameGenerator", "NameGeneratorQuickAdd", "NameGeneratorList", "NameGeneratorAutoComplete", "Sociogram", "Information", "OrdinalBin", "CategoricalBin"] }, "label": { "type": "string" }, "form": { "$ref": "#/definitions/Form" }, "quickAdd": { "type": ["string", "null"] }, "dataSource": { "type": ["string", "null"] }, "subject": { "$ref": "#/definitions/Subject" }, "panels": { "type": "array", "items": { "$ref": "#/definitions/Panel" } }, "prompts": { "type": "array", "items": { "$ref": "#/definitions/Prompt" }, "minItems": 1 }, "presets": { "type": "array", "items": { "$ref": "#/definitions/Preset" }, "minItems": 1 }, "background": { "type": "object", "properties": { "image": { "type": "string" }, "concentricCircles": { "type": "integer" }, "skewedTowardCenter": { "type": "boolean" } }, "additionalProperties": false, "required": ["concentricCircles", "skewedTowardCenter"] }, "sortOptions": { "$ref": "#/definitions/SortOptions" }, "cardOptions": { "type": "object", "patternProperties": { "^[0-9]{2,6}$": { "$ref": "#/definitions/CardOptions" } } }, "searchOptions": { "$ref": "#/definitions/SearchOptions" }, "behaviours": { "$ref": "#/definitions/Behaviours" }, "showExistingNodes": { "type": "boolean" }, "title": { "type": "string" }, "items": { "type": "array", "items": { "$ref": "#/definitions/Item" } }, "introductionPanel": { "$ref": "#/definitions/IntroductionPanel" }, "skipLogic": { "$ref": "#/definitions/SkipLogic" } }, "required": ["id", "label", "type"], "title": "Interface", "anyOf": [{ "properties": { "type": { "const": "EgoForm" } }, "required": ["form", "introductionPanel"] }, { "properties": { "type": { "const": "AlterForm" } }, "required": ["form", "introductionPanel"] }, { "properties": { "type": { "const": "AlterEdgeForm" } }, "required": ["form", "introductionPanel"] }, { "properties": { "type": { "const": "Information" } }, "required": ["items"] }, { "properties": { "type": { "const": "Narrative" } }, "required": ["presets", "background"] }, { "properties": { "type": { "enum": ["NameGenerator", "NameGeneratorQuickAdd", "NameGeneratorList", "NameGeneratorAutoComplete", "Sociogram", "OrdinalBin", "CategoricalBin"] } }, "required": ["prompts"] }] };
const schema50 = { "type": "object", "additionalProperties": false, "properties": { "fuzziness": { "type": "number" }, "matchProperties": { "type": "array", "items": { "type": "string" } } }, "required": ["fuzziness", "matchProperties"], "title": "SearchOptions" };
const schema51 = { "type": "object", "additionalProperties": false, "properties": { "freeDraw": { "type": "boolean" }, "featureNode": { "type": "boolean" }, "allowRepositioning": { "type": "boolean" } }, "required": [], "title": "Behaviours" };
const schema52 = { "type": "object", "additionalProperties": false, "properties": { "id": { "type": "string" }, "type": { "type": "string", "enum": ["text", "asset"] }, "content": { "type": "string" }, "description": { "type": "string" }, "size": { "type": "string" }, "loop": { "type": "boolean" } }, "required": ["content", "id", "type"], "title": "Item" };
const schema53 = { "type": "object", "additionalProperties": false, "properties": { "title": { "type": "string" }, "text": { "type": "string" } }, "required": ["title", "text"] };
const func2 = Object.prototype.hasOwnProperty;
const schema27 = { "type": ["object", "null"], "additionalProperties": false, "properties": { "title": { "type": "string" }, "fields": { "type": "array", "items": { "$ref": "#/definitions/Field" } } }, "required": ["fields"], "title": "Form" };
const schema28 = { "type": "object", "additionalProperties": false, "properties": { "variable": { "type": "string" }, "prompt": { "type": "string" } }, "required": ["variable", "prompt"], "title": "Field" };
function validate35(data, { instancePath = "", parentData, parentDataProperty, rootData = data } = {}) { let vErrors = null; let errors = 0; if ((!(data && typeof data == "object" && !Array.isArray(data))) && (data !== null)) {
    const err0 = { instancePath, schemaPath: "#/type", keyword: "type", params: { type: schema27.type }, message: "must be object,null" };
    if (vErrors === null) {
        vErrors = [err0];
    }
    else {
        vErrors.push(err0);
    }
    errors++;
} if (data && typeof data == "object" && !Array.isArray(data)) {
    if (data.fields === undefined) {
        const err1 = { instancePath, schemaPath: "#/required", keyword: "required", params: { missingProperty: "fields" }, message: "must have required property '" + "fields" + "'" };
        if (vErrors === null) {
            vErrors = [err1];
        }
        else {
            vErrors.push(err1);
        }
        errors++;
    }
    for (const key0 in data) {
        if (!((key0 === "title") || (key0 === "fields"))) {
            const err2 = { instancePath, schemaPath: "#/additionalProperties", keyword: "additionalProperties", params: { additionalProperty: key0 }, message: "must NOT have additional properties" };
            if (vErrors === null) {
                vErrors = [err2];
            }
            else {
                vErrors.push(err2);
            }
            errors++;
        }
    }
    if (data.title !== undefined) {
        if (typeof data.title !== "string") {
            const err3 = { instancePath: instancePath + "/title", schemaPath: "#/properties/title/type", keyword: "type", params: { type: "string" }, message: "must be string" };
            if (vErrors === null) {
                vErrors = [err3];
            }
            else {
                vErrors.push(err3);
            }
            errors++;
        }
    }
    if (data.fields !== undefined) {
        let data1 = data.fields;
        if (Array.isArray(data1)) {
            const len0 = data1.length;
            for (let i0 = 0; i0 < len0; i0++) {
                let data2 = data1[i0];
                if (data2 && typeof data2 == "object" && !Array.isArray(data2)) {
                    if (data2.variable === undefined) {
                        const err4 = { instancePath: instancePath + "/fields/" + i0, schemaPath: "#/definitions/Field/required", keyword: "required", params: { missingProperty: "variable" }, message: "must have required property '" + "variable" + "'" };
                        if (vErrors === null) {
                            vErrors = [err4];
                        }
                        else {
                            vErrors.push(err4);
                        }
                        errors++;
                    }
                    if (data2.prompt === undefined) {
                        const err5 = { instancePath: instancePath + "/fields/" + i0, schemaPath: "#/definitions/Field/required", keyword: "required", params: { missingProperty: "prompt" }, message: "must have required property '" + "prompt" + "'" };
                        if (vErrors === null) {
                            vErrors = [err5];
                        }
                        else {
                            vErrors.push(err5);
                        }
                        errors++;
                    }
                    for (const key1 in data2) {
                        if (!((key1 === "variable") || (key1 === "prompt"))) {
                            const err6 = { instancePath: instancePath + "/fields/" + i0, schemaPath: "#/definitions/Field/additionalProperties", keyword: "additionalProperties", params: { additionalProperty: key1 }, message: "must NOT have additional properties" };
                            if (vErrors === null) {
                                vErrors = [err6];
                            }
                            else {
                                vErrors.push(err6);
                            }
                            errors++;
                        }
                    }
                    if (data2.variable !== undefined) {
                        if (typeof data2.variable !== "string") {
                            const err7 = { instancePath: instancePath + "/fields/" + i0 + "/variable", schemaPath: "#/definitions/Field/properties/variable/type", keyword: "type", params: { type: "string" }, message: "must be string" };
                            if (vErrors === null) {
                                vErrors = [err7];
                            }
                            else {
                                vErrors.push(err7);
                            }
                            errors++;
                        }
                    }
                    if (data2.prompt !== undefined) {
                        if (typeof data2.prompt !== "string") {
                            const err8 = { instancePath: instancePath + "/fields/" + i0 + "/prompt", schemaPath: "#/definitions/Field/properties/prompt/type", keyword: "type", params: { type: "string" }, message: "must be string" };
                            if (vErrors === null) {
                                vErrors = [err8];
                            }
                            else {
                                vErrors.push(err8);
                            }
                            errors++;
                        }
                    }
                }
                else {
                    const err9 = { instancePath: instancePath + "/fields/" + i0, schemaPath: "#/definitions/Field/type", keyword: "type", params: { type: "object" }, message: "must be object" };
                    if (vErrors === null) {
                        vErrors = [err9];
                    }
                    else {
                        vErrors.push(err9);
                    }
                    errors++;
                }
            }
        }
        else {
            const err10 = { instancePath: instancePath + "/fields", schemaPath: "#/properties/fields/type", keyword: "type", params: { type: "array" }, message: "must be array" };
            if (vErrors === null) {
                vErrors = [err10];
            }
            else {
                vErrors.push(err10);
            }
            errors++;
        }
    }
} validate35.errors = vErrors; return errors === 0; }
const schema29 = { "type": "object", "additionalProperties": false, "properties": { "entity": { "$ref": "#/definitions/Entity" }, "type": { "type": "string" } }, "required": ["entity", "type"], "title": "Subject" };
const schema30 = { "type": "string", "enum": ["edge", "node", "ego"], "title": "Entity" };
function validate37(data, { instancePath = "", parentData, parentDataProperty, rootData = data } = {}) { let vErrors = null; let errors = 0; if (data && typeof data == "object" && !Array.isArray(data)) {
    if (data.entity === undefined) {
        const err0 = { instancePath, schemaPath: "#/required", keyword: "required", params: { missingProperty: "entity" }, message: "must have required property '" + "entity" + "'" };
        if (vErrors === null) {
            vErrors = [err0];
        }
        else {
            vErrors.push(err0);
        }
        errors++;
    }
    if (data.type === undefined) {
        const err1 = { instancePath, schemaPath: "#/required", keyword: "required", params: { missingProperty: "type" }, message: "must have required property '" + "type" + "'" };
        if (vErrors === null) {
            vErrors = [err1];
        }
        else {
            vErrors.push(err1);
        }
        errors++;
    }
    for (const key0 in data) {
        if (!((key0 === "entity") || (key0 === "type"))) {
            const err2 = { instancePath, schemaPath: "#/additionalProperties", keyword: "additionalProperties", params: { additionalProperty: key0 }, message: "must NOT have additional properties" };
            if (vErrors === null) {
                vErrors = [err2];
            }
            else {
                vErrors.push(err2);
            }
            errors++;
        }
    }
    if (data.entity !== undefined) {
        let data0 = data.entity;
        if (typeof data0 !== "string") {
            const err3 = { instancePath: instancePath + "/entity", schemaPath: "#/definitions/Entity/type", keyword: "type", params: { type: "string" }, message: "must be string" };
            if (vErrors === null) {
                vErrors = [err3];
            }
            else {
                vErrors.push(err3);
            }
            errors++;
        }
        if (!(((data0 === "edge") || (data0 === "node")) || (data0 === "ego"))) {
            const err4 = { instancePath: instancePath + "/entity", schemaPath: "#/definitions/Entity/enum", keyword: "enum", params: { allowedValues: schema30.enum }, message: "must be equal to one of the allowed values" };
            if (vErrors === null) {
                vErrors = [err4];
            }
            else {
                vErrors.push(err4);
            }
            errors++;
        }
    }
    if (data.type !== undefined) {
        if (typeof data.type !== "string") {
            const err5 = { instancePath: instancePath + "/type", schemaPath: "#/properties/type/type", keyword: "type", params: { type: "string" }, message: "must be string" };
            if (vErrors === null) {
                vErrors = [err5];
            }
            else {
                vErrors.push(err5);
            }
            errors++;
        }
    }
}
else {
    const err6 = { instancePath, schemaPath: "#/type", keyword: "type", params: { type: "object" }, message: "must be object" };
    if (vErrors === null) {
        vErrors = [err6];
    }
    else {
        vErrors.push(err6);
    }
    errors++;
} validate37.errors = vErrors; return errors === 0; }
const schema31 = { "type": "object", "additionalProperties": false, "properties": { "id": { "type": "string" }, "title": { "type": "string" }, "filter": { "$ref": "#/definitions/Filter" }, "dataSource": { "type": ["string", "null"] } }, "required": ["id", "title", "dataSource"], "title": "Panel" };
const schema32 = { "type": ["object", "null"], "additionalProperties": false, "properties": { "join": { "type": "string", "enum": ["OR", "AND"] }, "rules": { "type": "array", "items": { "$ref": "#/definitions/Rule" } } }, "title": "Filter" };
const schema33 = { "type": "object", "additionalProperties": false, "properties": { "type": { "type": "string", "enum": ["alter", "ego", "edge"] }, "id": { "type": "string" }, "options": { "$ref": "#/definitions/Options" } }, "required": ["id", "options", "type"], "title": "Rule" };
const schema34 = { "type": "object", "additionalProperties": false, "properties": { "type": { "type": "string" }, "attribute": { "type": "string" }, "operator": { "type": "string", "enum": ["EXISTS", "NOT_EXISTS", "EXACTLY", "NOT", "GREATER_THAN", "GREATER_THAN_OR_EQUAL", "LESS_THAN", "LESS_THAN_OR_EQUAL"] }, "value": { "type": ["integer", "string", "array", "boolean"] } }, "required": ["operator"], "title": "Rule Options", "allOf": [{ "if": { "properties": { "operator": { "enum": ["EXACTLY", "NOT", "GREATER_THAN", "GREATER_THAN_OR_EQUAL", "LESS_THAN", "LESS_THAN_OR_EQUAL"] } } }, "then": { "required": ["value"] } }] };
function validate41(data, { instancePath = "", parentData, parentDataProperty, rootData = data } = {}) { let vErrors = null; let errors = 0; if (data && typeof data == "object" && !Array.isArray(data)) {
    if (data.id === undefined) {
        const err0 = { instancePath, schemaPath: "#/required", keyword: "required", params: { missingProperty: "id" }, message: "must have required property '" + "id" + "'" };
        if (vErrors === null) {
            vErrors = [err0];
        }
        else {
            vErrors.push(err0);
        }
        errors++;
    }
    if (data.options === undefined) {
        const err1 = { instancePath, schemaPath: "#/required", keyword: "required", params: { missingProperty: "options" }, message: "must have required property '" + "options" + "'" };
        if (vErrors === null) {
            vErrors = [err1];
        }
        else {
            vErrors.push(err1);
        }
        errors++;
    }
    if (data.type === undefined) {
        const err2 = { instancePath, schemaPath: "#/required", keyword: "required", params: { missingProperty: "type" }, message: "must have required property '" + "type" + "'" };
        if (vErrors === null) {
            vErrors = [err2];
        }
        else {
            vErrors.push(err2);
        }
        errors++;
    }
    for (const key0 in data) {
        if (!(((key0 === "type") || (key0 === "id")) || (key0 === "options"))) {
            const err3 = { instancePath, schemaPath: "#/additionalProperties", keyword: "additionalProperties", params: { additionalProperty: key0 }, message: "must NOT have additional properties" };
            if (vErrors === null) {
                vErrors = [err3];
            }
            else {
                vErrors.push(err3);
            }
            errors++;
        }
    }
    if (data.type !== undefined) {
        let data0 = data.type;
        if (typeof data0 !== "string") {
            const err4 = { instancePath: instancePath + "/type", schemaPath: "#/properties/type/type", keyword: "type", params: { type: "string" }, message: "must be string" };
            if (vErrors === null) {
                vErrors = [err4];
            }
            else {
                vErrors.push(err4);
            }
            errors++;
        }
        if (!(((data0 === "alter") || (data0 === "ego")) || (data0 === "edge"))) {
            const err5 = { instancePath: instancePath + "/type", schemaPath: "#/properties/type/enum", keyword: "enum", params: { allowedValues: schema33.properties.type.enum }, message: "must be equal to one of the allowed values" };
            if (vErrors === null) {
                vErrors = [err5];
            }
            else {
                vErrors.push(err5);
            }
            errors++;
        }
    }
    if (data.id !== undefined) {
        if (typeof data.id !== "string") {
            const err6 = { instancePath: instancePath + "/id", schemaPath: "#/properties/id/type", keyword: "type", params: { type: "string" }, message: "must be string" };
            if (vErrors === null) {
                vErrors = [err6];
            }
            else {
                vErrors.push(err6);
            }
            errors++;
        }
    }
    if (data.options !== undefined) {
        let data2 = data.options;
        const _errs10 = errors;
        let valid3 = true;
        const _errs11 = errors;
        if (data2 && typeof data2 == "object" && !Array.isArray(data2)) {
            if (data2.operator !== undefined) {
                let data3 = data2.operator;
                if (!((((((data3 === "EXACTLY") || (data3 === "NOT")) || (data3 === "GREATER_THAN")) || (data3 === "GREATER_THAN_OR_EQUAL")) || (data3 === "LESS_THAN")) || (data3 === "LESS_THAN_OR_EQUAL"))) {
                    const err7 = {};
                    if (vErrors === null) {
                        vErrors = [err7];
                    }
                    else {
                        vErrors.push(err7);
                    }
                    errors++;
                }
            }
        }
        var _valid0 = _errs11 === errors;
        errors = _errs10;
        if (vErrors !== null) {
            if (_errs10) {
                vErrors.length = _errs10;
            }
            else {
                vErrors = null;
            }
        }
        if (_valid0) {
            const _errs13 = errors;
            if (data2 && typeof data2 == "object" && !Array.isArray(data2)) {
                if (data2.value === undefined) {
                    const err8 = { instancePath: instancePath + "/options", schemaPath: "#/definitions/Options/allOf/0/then/required", keyword: "required", params: { missingProperty: "value" }, message: "must have required property '" + "value" + "'" };
                    if (vErrors === null) {
                        vErrors = [err8];
                    }
                    else {
                        vErrors.push(err8);
                    }
                    errors++;
                }
            }
            var _valid0 = _errs13 === errors;
            valid3 = _valid0;
        }
        if (!valid3) {
            const err9 = { instancePath: instancePath + "/options", schemaPath: "#/definitions/Options/allOf/0/if", keyword: "if", params: { failingKeyword: "then" }, message: "must match \"then\" schema" };
            if (vErrors === null) {
                vErrors = [err9];
            }
            else {
                vErrors.push(err9);
            }
            errors++;
        }
        if (data2 && typeof data2 == "object" && !Array.isArray(data2)) {
            if (data2.operator === undefined) {
                const err10 = { instancePath: instancePath + "/options", schemaPath: "#/definitions/Options/required", keyword: "required", params: { missingProperty: "operator" }, message: "must have required property '" + "operator" + "'" };
                if (vErrors === null) {
                    vErrors = [err10];
                }
                else {
                    vErrors.push(err10);
                }
                errors++;
            }
            for (const key1 in data2) {
                if (!((((key1 === "type") || (key1 === "attribute")) || (key1 === "operator")) || (key1 === "value"))) {
                    const err11 = { instancePath: instancePath + "/options", schemaPath: "#/definitions/Options/additionalProperties", keyword: "additionalProperties", params: { additionalProperty: key1 }, message: "must NOT have additional properties" };
                    if (vErrors === null) {
                        vErrors = [err11];
                    }
                    else {
                        vErrors.push(err11);
                    }
                    errors++;
                }
            }
            if (data2.type !== undefined) {
                if (typeof data2.type !== "string") {
                    const err12 = { instancePath: instancePath + "/options/type", schemaPath: "#/definitions/Options/properties/type/type", keyword: "type", params: { type: "string" }, message: "must be string" };
                    if (vErrors === null) {
                        vErrors = [err12];
                    }
                    else {
                        vErrors.push(err12);
                    }
                    errors++;
                }
            }
            if (data2.attribute !== undefined) {
                if (typeof data2.attribute !== "string") {
                    const err13 = { instancePath: instancePath + "/options/attribute", schemaPath: "#/definitions/Options/properties/attribute/type", keyword: "type", params: { type: "string" }, message: "must be string" };
                    if (vErrors === null) {
                        vErrors = [err13];
                    }
                    else {
                        vErrors.push(err13);
                    }
                    errors++;
                }
            }
            if (data2.operator !== undefined) {
                let data6 = data2.operator;
                if (typeof data6 !== "string") {
                    const err14 = { instancePath: instancePath + "/options/operator", schemaPath: "#/definitions/Options/properties/operator/type", keyword: "type", params: { type: "string" }, message: "must be string" };
                    if (vErrors === null) {
                        vErrors = [err14];
                    }
                    else {
                        vErrors.push(err14);
                    }
                    errors++;
                }
                if (!((((((((data6 === "EXISTS") || (data6 === "NOT_EXISTS")) || (data6 === "EXACTLY")) || (data6 === "NOT")) || (data6 === "GREATER_THAN")) || (data6 === "GREATER_THAN_OR_EQUAL")) || (data6 === "LESS_THAN")) || (data6 === "LESS_THAN_OR_EQUAL"))) {
                    const err15 = { instancePath: instancePath + "/options/operator", schemaPath: "#/definitions/Options/properties/operator/enum", keyword: "enum", params: { allowedValues: schema34.properties.operator.enum }, message: "must be equal to one of the allowed values" };
                    if (vErrors === null) {
                        vErrors = [err15];
                    }
                    else {
                        vErrors.push(err15);
                    }
                    errors++;
                }
            }
            if (data2.value !== undefined) {
                let data7 = data2.value;
                if ((((!(((typeof data7 == "number") && (!(data7 % 1) && !isNaN(data7))) && (isFinite(data7)))) && (typeof data7 !== "string")) && (!(Array.isArray(data7)))) && (typeof data7 !== "boolean")) {
                    const err16 = { instancePath: instancePath + "/options/value", schemaPath: "#/definitions/Options/properties/value/type", keyword: "type", params: { type: schema34.properties.value.type }, message: "must be integer,string,array,boolean" };
                    if (vErrors === null) {
                        vErrors = [err16];
                    }
                    else {
                        vErrors.push(err16);
                    }
                    errors++;
                }
            }
        }
        else {
            const err17 = { instancePath: instancePath + "/options", schemaPath: "#/definitions/Options/type", keyword: "type", params: { type: "object" }, message: "must be object" };
            if (vErrors === null) {
                vErrors = [err17];
            }
            else {
                vErrors.push(err17);
            }
            errors++;
        }
    }
}
else {
    const err18 = { instancePath, schemaPath: "#/type", keyword: "type", params: { type: "object" }, message: "must be object" };
    if (vErrors === null) {
        vErrors = [err18];
    }
    else {
        vErrors.push(err18);
    }
    errors++;
} validate41.errors = vErrors; return errors === 0; }
function validate40(data, { instancePath = "", parentData, parentDataProperty, rootData = data } = {}) { let vErrors = null; let errors = 0; if ((!(data && typeof data == "object" && !Array.isArray(data))) && (data !== null)) {
    const err0 = { instancePath, schemaPath: "#/type", keyword: "type", params: { type: schema32.type }, message: "must be object,null" };
    if (vErrors === null) {
        vErrors = [err0];
    }
    else {
        vErrors.push(err0);
    }
    errors++;
} if (data && typeof data == "object" && !Array.isArray(data)) {
    for (const key0 in data) {
        if (!((key0 === "join") || (key0 === "rules"))) {
            const err1 = { instancePath, schemaPath: "#/additionalProperties", keyword: "additionalProperties", params: { additionalProperty: key0 }, message: "must NOT have additional properties" };
            if (vErrors === null) {
                vErrors = [err1];
            }
            else {
                vErrors.push(err1);
            }
            errors++;
        }
    }
    if (data.join !== undefined) {
        let data0 = data.join;
        if (typeof data0 !== "string") {
            const err2 = { instancePath: instancePath + "/join", schemaPath: "#/properties/join/type", keyword: "type", params: { type: "string" }, message: "must be string" };
            if (vErrors === null) {
                vErrors = [err2];
            }
            else {
                vErrors.push(err2);
            }
            errors++;
        }
        if (!((data0 === "OR") || (data0 === "AND"))) {
            const err3 = { instancePath: instancePath + "/join", schemaPath: "#/properties/join/enum", keyword: "enum", params: { allowedValues: schema32.properties.join.enum }, message: "must be equal to one of the allowed values" };
            if (vErrors === null) {
                vErrors = [err3];
            }
            else {
                vErrors.push(err3);
            }
            errors++;
        }
    }
    if (data.rules !== undefined) {
        let data1 = data.rules;
        if (Array.isArray(data1)) {
            const len0 = data1.length;
            for (let i0 = 0; i0 < len0; i0++) {
                if (!(validate41(data1[i0], { instancePath: instancePath + "/rules/" + i0, parentData: data1, parentDataProperty: i0, rootData }))) {
                    vErrors = vErrors === null ? validate41.errors : vErrors.concat(validate41.errors);
                    errors = vErrors.length;
                }
            }
        }
        else {
            const err4 = { instancePath: instancePath + "/rules", schemaPath: "#/properties/rules/type", keyword: "type", params: { type: "array" }, message: "must be array" };
            if (vErrors === null) {
                vErrors = [err4];
            }
            else {
                vErrors.push(err4);
            }
            errors++;
        }
    }
} validate40.errors = vErrors; return errors === 0; }
function validate39(data, { instancePath = "", parentData, parentDataProperty, rootData = data } = {}) { let vErrors = null; let errors = 0; if (data && typeof data == "object" && !Array.isArray(data)) {
    if (data.id === undefined) {
        const err0 = { instancePath, schemaPath: "#/required", keyword: "required", params: { missingProperty: "id" }, message: "must have required property '" + "id" + "'" };
        if (vErrors === null) {
            vErrors = [err0];
        }
        else {
            vErrors.push(err0);
        }
        errors++;
    }
    if (data.title === undefined) {
        const err1 = { instancePath, schemaPath: "#/required", keyword: "required", params: { missingProperty: "title" }, message: "must have required property '" + "title" + "'" };
        if (vErrors === null) {
            vErrors = [err1];
        }
        else {
            vErrors.push(err1);
        }
        errors++;
    }
    if (data.dataSource === undefined) {
        const err2 = { instancePath, schemaPath: "#/required", keyword: "required", params: { missingProperty: "dataSource" }, message: "must have required property '" + "dataSource" + "'" };
        if (vErrors === null) {
            vErrors = [err2];
        }
        else {
            vErrors.push(err2);
        }
        errors++;
    }
    for (const key0 in data) {
        if (!((((key0 === "id") || (key0 === "title")) || (key0 === "filter")) || (key0 === "dataSource"))) {
            const err3 = { instancePath, schemaPath: "#/additionalProperties", keyword: "additionalProperties", params: { additionalProperty: key0 }, message: "must NOT have additional properties" };
            if (vErrors === null) {
                vErrors = [err3];
            }
            else {
                vErrors.push(err3);
            }
            errors++;
        }
    }
    if (data.id !== undefined) {
        if (typeof data.id !== "string") {
            const err4 = { instancePath: instancePath + "/id", schemaPath: "#/properties/id/type", keyword: "type", params: { type: "string" }, message: "must be string" };
            if (vErrors === null) {
                vErrors = [err4];
            }
            else {
                vErrors.push(err4);
            }
            errors++;
        }
    }
    if (data.title !== undefined) {
        if (typeof data.title !== "string") {
            const err5 = { instancePath: instancePath + "/title", schemaPath: "#/properties/title/type", keyword: "type", params: { type: "string" }, message: "must be string" };
            if (vErrors === null) {
                vErrors = [err5];
            }
            else {
                vErrors.push(err5);
            }
            errors++;
        }
    }
    if (data.filter !== undefined) {
        if (!(validate40(data.filter, { instancePath: instancePath + "/filter", parentData: data, parentDataProperty: "filter", rootData }))) {
            vErrors = vErrors === null ? validate40.errors : vErrors.concat(validate40.errors);
            errors = vErrors.length;
        }
    }
    if (data.dataSource !== undefined) {
        let data3 = data.dataSource;
        if ((typeof data3 !== "string") && (data3 !== null)) {
            const err6 = { instancePath: instancePath + "/dataSource", schemaPath: "#/properties/dataSource/type", keyword: "type", params: { type: schema31.properties.dataSource.type }, message: "must be string,null" };
            if (vErrors === null) {
                vErrors = [err6];
            }
            else {
                vErrors.push(err6);
            }
            errors++;
        }
    }
}
else {
    const err7 = { instancePath, schemaPath: "#/type", keyword: "type", params: { type: "object" }, message: "must be object" };
    if (vErrors === null) {
        vErrors = [err7];
    }
    else {
        vErrors.push(err7);
    }
    errors++;
} validate39.errors = vErrors; return errors === 0; }
const schema35 = { "type": "object", "additionalProperties": false, "properties": { "id": { "type": "string" }, "text": { "type": "string" }, "additionalAttributes": { "$ref": "#/definitions/AdditionalAttributes" }, "variable": { "type": "string" }, "bucketSortOrder": { "type": "array", "items": { "$ref": "#/definitions/SortOrder" } }, "binSortOrder": { "type": "array", "items": { "$ref": "#/definitions/SortOrder" } }, "sortOrder": { "type": "array", "items": { "$ref": "#/definitions/SortOrder" } }, "color": { "type": "string" }, "layout": { "$ref": "#/definitions/Layout" }, "edges": { "$ref": "#/definitions/Edges" }, "highlight": { "$ref": "#/definitions/Highlight" } }, "required": ["id", "text"], "title": "Prompt" };
const schema40 = { "type": "object", "additionalProperties": false, "properties": { "layoutVariable": { "type": "string" }, "allowPositioning": { "type": "boolean" } }, "required": ["layoutVariable"], "title": "Layout" };
const schema41 = { "type": "object", "additionalProperties": false, "properties": { "display": { "type": "array", "items": { "type": "string" } }, "create": { "type": "string" } }, "required": [], "title": "Edges" };
const schema42 = { "type": "object", "additionalProperties": false, "properties": { "variable": { "type": "string" }, "allowHighlighting": { "type": "boolean" } }, "required": ["allowHighlighting"], "title": "Highlight" };
const schema36 = { "type": "array", "title": "AdditionalAttributes", "items": { "$ref": "#/definitions/AdditionalAttribute" } };
const schema37 = { "type": "object", "additionalProperties": false, "properties": { "variable": { "type": "string" }, "value": { "type": ["integer", "string", "array", "boolean"] } }, "required": ["variable", "value"], "title": "AdditionalAttribute" };
function validate46(data, { instancePath = "", parentData, parentDataProperty, rootData = data } = {}) { let vErrors = null; let errors = 0; if (Array.isArray(data)) {
    const len0 = data.length;
    for (let i0 = 0; i0 < len0; i0++) {
        let data0 = data[i0];
        if (data0 && typeof data0 == "object" && !Array.isArray(data0)) {
            if (data0.variable === undefined) {
                const err0 = { instancePath: instancePath + "/" + i0, schemaPath: "#/definitions/AdditionalAttribute/required", keyword: "required", params: { missingProperty: "variable" }, message: "must have required property '" + "variable" + "'" };
                if (vErrors === null) {
                    vErrors = [err0];
                }
                else {
                    vErrors.push(err0);
                }
                errors++;
            }
            if (data0.value === undefined) {
                const err1 = { instancePath: instancePath + "/" + i0, schemaPath: "#/definitions/AdditionalAttribute/required", keyword: "required", params: { missingProperty: "value" }, message: "must have required property '" + "value" + "'" };
                if (vErrors === null) {
                    vErrors = [err1];
                }
                else {
                    vErrors.push(err1);
                }
                errors++;
            }
            for (const key0 in data0) {
                if (!((key0 === "variable") || (key0 === "value"))) {
                    const err2 = { instancePath: instancePath + "/" + i0, schemaPath: "#/definitions/AdditionalAttribute/additionalProperties", keyword: "additionalProperties", params: { additionalProperty: key0 }, message: "must NOT have additional properties" };
                    if (vErrors === null) {
                        vErrors = [err2];
                    }
                    else {
                        vErrors.push(err2);
                    }
                    errors++;
                }
            }
            if (data0.variable !== undefined) {
                if (typeof data0.variable !== "string") {
                    const err3 = { instancePath: instancePath + "/" + i0 + "/variable", schemaPath: "#/definitions/AdditionalAttribute/properties/variable/type", keyword: "type", params: { type: "string" }, message: "must be string" };
                    if (vErrors === null) {
                        vErrors = [err3];
                    }
                    else {
                        vErrors.push(err3);
                    }
                    errors++;
                }
            }
            if (data0.value !== undefined) {
                let data2 = data0.value;
                if ((((!(((typeof data2 == "number") && (!(data2 % 1) && !isNaN(data2))) && (isFinite(data2)))) && (typeof data2 !== "string")) && (!(Array.isArray(data2)))) && (typeof data2 !== "boolean")) {
                    const err4 = { instancePath: instancePath + "/" + i0 + "/value", schemaPath: "#/definitions/AdditionalAttribute/properties/value/type", keyword: "type", params: { type: schema37.properties.value.type }, message: "must be integer,string,array,boolean" };
                    if (vErrors === null) {
                        vErrors = [err4];
                    }
                    else {
                        vErrors.push(err4);
                    }
                    errors++;
                }
            }
        }
        else {
            const err5 = { instancePath: instancePath + "/" + i0, schemaPath: "#/definitions/AdditionalAttribute/type", keyword: "type", params: { type: "object" }, message: "must be object" };
            if (vErrors === null) {
                vErrors = [err5];
            }
            else {
                vErrors.push(err5);
            }
            errors++;
        }
    }
}
else {
    const err6 = { instancePath, schemaPath: "#/type", keyword: "type", params: { type: "array" }, message: "must be array" };
    if (vErrors === null) {
        vErrors = [err6];
    }
    else {
        vErrors.push(err6);
    }
    errors++;
} validate46.errors = vErrors; return errors === 0; }
const schema38 = { "type": "object", "additionalProperties": false, "properties": { "property": { "type": "string" }, "direction": { "$ref": "#/definitions/Direction" } }, "required": ["direction", "property"], "title": "SortOrder" };
const schema39 = { "type": "string", "enum": ["desc", "asc"], "title": "Direction" };
function validate48(data, { instancePath = "", parentData, parentDataProperty, rootData = data } = {}) { let vErrors = null; let errors = 0; if (data && typeof data == "object" && !Array.isArray(data)) {
    if (data.direction === undefined) {
        const err0 = { instancePath, schemaPath: "#/required", keyword: "required", params: { missingProperty: "direction" }, message: "must have required property '" + "direction" + "'" };
        if (vErrors === null) {
            vErrors = [err0];
        }
        else {
            vErrors.push(err0);
        }
        errors++;
    }
    if (data.property === undefined) {
        const err1 = { instancePath, schemaPath: "#/required", keyword: "required", params: { missingProperty: "property" }, message: "must have required property '" + "property" + "'" };
        if (vErrors === null) {
            vErrors = [err1];
        }
        else {
            vErrors.push(err1);
        }
        errors++;
    }
    for (const key0 in data) {
        if (!((key0 === "property") || (key0 === "direction"))) {
            const err2 = { instancePath, schemaPath: "#/additionalProperties", keyword: "additionalProperties", params: { additionalProperty: key0 }, message: "must NOT have additional properties" };
            if (vErrors === null) {
                vErrors = [err2];
            }
            else {
                vErrors.push(err2);
            }
            errors++;
        }
    }
    if (data.property !== undefined) {
        if (typeof data.property !== "string") {
            const err3 = { instancePath: instancePath + "/property", schemaPath: "#/properties/property/type", keyword: "type", params: { type: "string" }, message: "must be string" };
            if (vErrors === null) {
                vErrors = [err3];
            }
            else {
                vErrors.push(err3);
            }
            errors++;
        }
    }
    if (data.direction !== undefined) {
        let data1 = data.direction;
        if (typeof data1 !== "string") {
            const err4 = { instancePath: instancePath + "/direction", schemaPath: "#/definitions/Direction/type", keyword: "type", params: { type: "string" }, message: "must be string" };
            if (vErrors === null) {
                vErrors = [err4];
            }
            else {
                vErrors.push(err4);
            }
            errors++;
        }
        if (!((data1 === "desc") || (data1 === "asc"))) {
            const err5 = { instancePath: instancePath + "/direction", schemaPath: "#/definitions/Direction/enum", keyword: "enum", params: { allowedValues: schema39.enum }, message: "must be equal to one of the allowed values" };
            if (vErrors === null) {
                vErrors = [err5];
            }
            else {
                vErrors.push(err5);
            }
            errors++;
        }
    }
}
else {
    const err6 = { instancePath, schemaPath: "#/type", keyword: "type", params: { type: "object" }, message: "must be object" };
    if (vErrors === null) {
        vErrors = [err6];
    }
    else {
        vErrors.push(err6);
    }
    errors++;
} validate48.errors = vErrors; return errors === 0; }
function validate45(data, { instancePath = "", parentData, parentDataProperty, rootData = data } = {}) { let vErrors = null; let errors = 0; if (data && typeof data == "object" && !Array.isArray(data)) {
    if (data.id === undefined) {
        const err0 = { instancePath, schemaPath: "#/required", keyword: "required", params: { missingProperty: "id" }, message: "must have required property '" + "id" + "'" };
        if (vErrors === null) {
            vErrors = [err0];
        }
        else {
            vErrors.push(err0);
        }
        errors++;
    }
    if (data.text === undefined) {
        const err1 = { instancePath, schemaPath: "#/required", keyword: "required", params: { missingProperty: "text" }, message: "must have required property '" + "text" + "'" };
        if (vErrors === null) {
            vErrors = [err1];
        }
        else {
            vErrors.push(err1);
        }
        errors++;
    }
    for (const key0 in data) {
        if (!(func2.call(schema35.properties, key0))) {
            const err2 = { instancePath, schemaPath: "#/additionalProperties", keyword: "additionalProperties", params: { additionalProperty: key0 }, message: "must NOT have additional properties" };
            if (vErrors === null) {
                vErrors = [err2];
            }
            else {
                vErrors.push(err2);
            }
            errors++;
        }
    }
    if (data.id !== undefined) {
        if (typeof data.id !== "string") {
            const err3 = { instancePath: instancePath + "/id", schemaPath: "#/properties/id/type", keyword: "type", params: { type: "string" }, message: "must be string" };
            if (vErrors === null) {
                vErrors = [err3];
            }
            else {
                vErrors.push(err3);
            }
            errors++;
        }
    }
    if (data.text !== undefined) {
        if (typeof data.text !== "string") {
            const err4 = { instancePath: instancePath + "/text", schemaPath: "#/properties/text/type", keyword: "type", params: { type: "string" }, message: "must be string" };
            if (vErrors === null) {
                vErrors = [err4];
            }
            else {
                vErrors.push(err4);
            }
            errors++;
        }
    }
    if (data.additionalAttributes !== undefined) {
        if (!(validate46(data.additionalAttributes, { instancePath: instancePath + "/additionalAttributes", parentData: data, parentDataProperty: "additionalAttributes", rootData }))) {
            vErrors = vErrors === null ? validate46.errors : vErrors.concat(validate46.errors);
            errors = vErrors.length;
        }
    }
    if (data.variable !== undefined) {
        if (typeof data.variable !== "string") {
            const err5 = { instancePath: instancePath + "/variable", schemaPath: "#/properties/variable/type", keyword: "type", params: { type: "string" }, message: "must be string" };
            if (vErrors === null) {
                vErrors = [err5];
            }
            else {
                vErrors.push(err5);
            }
            errors++;
        }
    }
    if (data.bucketSortOrder !== undefined) {
        let data4 = data.bucketSortOrder;
        if (Array.isArray(data4)) {
            const len0 = data4.length;
            for (let i0 = 0; i0 < len0; i0++) {
                if (!(validate48(data4[i0], { instancePath: instancePath + "/bucketSortOrder/" + i0, parentData: data4, parentDataProperty: i0, rootData }))) {
                    vErrors = vErrors === null ? validate48.errors : vErrors.concat(validate48.errors);
                    errors = vErrors.length;
                }
            }
        }
        else {
            const err6 = { instancePath: instancePath + "/bucketSortOrder", schemaPath: "#/properties/bucketSortOrder/type", keyword: "type", params: { type: "array" }, message: "must be array" };
            if (vErrors === null) {
                vErrors = [err6];
            }
            else {
                vErrors.push(err6);
            }
            errors++;
        }
    }
    if (data.binSortOrder !== undefined) {
        let data6 = data.binSortOrder;
        if (Array.isArray(data6)) {
            const len1 = data6.length;
            for (let i1 = 0; i1 < len1; i1++) {
                if (!(validate48(data6[i1], { instancePath: instancePath + "/binSortOrder/" + i1, parentData: data6, parentDataProperty: i1, rootData }))) {
                    vErrors = vErrors === null ? validate48.errors : vErrors.concat(validate48.errors);
                    errors = vErrors.length;
                }
            }
        }
        else {
            const err7 = { instancePath: instancePath + "/binSortOrder", schemaPath: "#/properties/binSortOrder/type", keyword: "type", params: { type: "array" }, message: "must be array" };
            if (vErrors === null) {
                vErrors = [err7];
            }
            else {
                vErrors.push(err7);
            }
            errors++;
        }
    }
    if (data.sortOrder !== undefined) {
        let data8 = data.sortOrder;
        if (Array.isArray(data8)) {
            const len2 = data8.length;
            for (let i2 = 0; i2 < len2; i2++) {
                if (!(validate48(data8[i2], { instancePath: instancePath + "/sortOrder/" + i2, parentData: data8, parentDataProperty: i2, rootData }))) {
                    vErrors = vErrors === null ? validate48.errors : vErrors.concat(validate48.errors);
                    errors = vErrors.length;
                }
            }
        }
        else {
            const err8 = { instancePath: instancePath + "/sortOrder", schemaPath: "#/properties/sortOrder/type", keyword: "type", params: { type: "array" }, message: "must be array" };
            if (vErrors === null) {
                vErrors = [err8];
            }
            else {
                vErrors.push(err8);
            }
            errors++;
        }
    }
    if (data.color !== undefined) {
        if (typeof data.color !== "string") {
            const err9 = { instancePath: instancePath + "/color", schemaPath: "#/properties/color/type", keyword: "type", params: { type: "string" }, message: "must be string" };
            if (vErrors === null) {
                vErrors = [err9];
            }
            else {
                vErrors.push(err9);
            }
            errors++;
        }
    }
    if (data.layout !== undefined) {
        let data11 = data.layout;
        if (data11 && typeof data11 == "object" && !Array.isArray(data11)) {
            if (data11.layoutVariable === undefined) {
                const err10 = { instancePath: instancePath + "/layout", schemaPath: "#/definitions/Layout/required", keyword: "required", params: { missingProperty: "layoutVariable" }, message: "must have required property '" + "layoutVariable" + "'" };
                if (vErrors === null) {
                    vErrors = [err10];
                }
                else {
                    vErrors.push(err10);
                }
                errors++;
            }
            for (const key1 in data11) {
                if (!((key1 === "layoutVariable") || (key1 === "allowPositioning"))) {
                    const err11 = { instancePath: instancePath + "/layout", schemaPath: "#/definitions/Layout/additionalProperties", keyword: "additionalProperties", params: { additionalProperty: key1 }, message: "must NOT have additional properties" };
                    if (vErrors === null) {
                        vErrors = [err11];
                    }
                    else {
                        vErrors.push(err11);
                    }
                    errors++;
                }
            }
            if (data11.layoutVariable !== undefined) {
                if (typeof data11.layoutVariable !== "string") {
                    const err12 = { instancePath: instancePath + "/layout/layoutVariable", schemaPath: "#/definitions/Layout/properties/layoutVariable/type", keyword: "type", params: { type: "string" }, message: "must be string" };
                    if (vErrors === null) {
                        vErrors = [err12];
                    }
                    else {
                        vErrors.push(err12);
                    }
                    errors++;
                }
            }
            if (data11.allowPositioning !== undefined) {
                if (typeof data11.allowPositioning !== "boolean") {
                    const err13 = { instancePath: instancePath + "/layout/allowPositioning", schemaPath: "#/definitions/Layout/properties/allowPositioning/type", keyword: "type", params: { type: "boolean" }, message: "must be boolean" };
                    if (vErrors === null) {
                        vErrors = [err13];
                    }
                    else {
                        vErrors.push(err13);
                    }
                    errors++;
                }
            }
        }
        else {
            const err14 = { instancePath: instancePath + "/layout", schemaPath: "#/definitions/Layout/type", keyword: "type", params: { type: "object" }, message: "must be object" };
            if (vErrors === null) {
                vErrors = [err14];
            }
            else {
                vErrors.push(err14);
            }
            errors++;
        }
    }
    if (data.edges !== undefined) {
        let data14 = data.edges;
        if (data14 && typeof data14 == "object" && !Array.isArray(data14)) {
            for (const key2 in data14) {
                if (!((key2 === "display") || (key2 === "create"))) {
                    const err15 = { instancePath: instancePath + "/edges", schemaPath: "#/definitions/Edges/additionalProperties", keyword: "additionalProperties", params: { additionalProperty: key2 }, message: "must NOT have additional properties" };
                    if (vErrors === null) {
                        vErrors = [err15];
                    }
                    else {
                        vErrors.push(err15);
                    }
                    errors++;
                }
            }
            if (data14.display !== undefined) {
                let data15 = data14.display;
                if (Array.isArray(data15)) {
                    const len3 = data15.length;
                    for (let i3 = 0; i3 < len3; i3++) {
                        if (typeof data15[i3] !== "string") {
                            const err16 = { instancePath: instancePath + "/edges/display/" + i3, schemaPath: "#/definitions/Edges/properties/display/items/type", keyword: "type", params: { type: "string" }, message: "must be string" };
                            if (vErrors === null) {
                                vErrors = [err16];
                            }
                            else {
                                vErrors.push(err16);
                            }
                            errors++;
                        }
                    }
                }
                else {
                    const err17 = { instancePath: instancePath + "/edges/display", schemaPath: "#/definitions/Edges/properties/display/type", keyword: "type", params: { type: "array" }, message: "must be array" };
                    if (vErrors === null) {
                        vErrors = [err17];
                    }
                    else {
                        vErrors.push(err17);
                    }
                    errors++;
                }
            }
            if (data14.create !== undefined) {
                if (typeof data14.create !== "string") {
                    const err18 = { instancePath: instancePath + "/edges/create", schemaPath: "#/definitions/Edges/properties/create/type", keyword: "type", params: { type: "string" }, message: "must be string" };
                    if (vErrors === null) {
                        vErrors = [err18];
                    }
                    else {
                        vErrors.push(err18);
                    }
                    errors++;
                }
            }
        }
        else {
            const err19 = { instancePath: instancePath + "/edges", schemaPath: "#/definitions/Edges/type", keyword: "type", params: { type: "object" }, message: "must be object" };
            if (vErrors === null) {
                vErrors = [err19];
            }
            else {
                vErrors.push(err19);
            }
            errors++;
        }
    }
    if (data.highlight !== undefined) {
        let data18 = data.highlight;
        if (data18 && typeof data18 == "object" && !Array.isArray(data18)) {
            if (data18.allowHighlighting === undefined) {
                const err20 = { instancePath: instancePath + "/highlight", schemaPath: "#/definitions/Highlight/required", keyword: "required", params: { missingProperty: "allowHighlighting" }, message: "must have required property '" + "allowHighlighting" + "'" };
                if (vErrors === null) {
                    vErrors = [err20];
                }
                else {
                    vErrors.push(err20);
                }
                errors++;
            }
            for (const key3 in data18) {
                if (!((key3 === "variable") || (key3 === "allowHighlighting"))) {
                    const err21 = { instancePath: instancePath + "/highlight", schemaPath: "#/definitions/Highlight/additionalProperties", keyword: "additionalProperties", params: { additionalProperty: key3 }, message: "must NOT have additional properties" };
                    if (vErrors === null) {
                        vErrors = [err21];
                    }
                    else {
                        vErrors.push(err21);
                    }
                    errors++;
                }
            }
            if (data18.variable !== undefined) {
                if (typeof data18.variable !== "string") {
                    const err22 = { instancePath: instancePath + "/highlight/variable", schemaPath: "#/definitions/Highlight/properties/variable/type", keyword: "type", params: { type: "string" }, message: "must be string" };
                    if (vErrors === null) {
                        vErrors = [err22];
                    }
                    else {
                        vErrors.push(err22);
                    }
                    errors++;
                }
            }
            if (data18.allowHighlighting !== undefined) {
                if (typeof data18.allowHighlighting !== "boolean") {
                    const err23 = { instancePath: instancePath + "/highlight/allowHighlighting", schemaPath: "#/definitions/Highlight/properties/allowHighlighting/type", keyword: "type", params: { type: "boolean" }, message: "must be boolean" };
                    if (vErrors === null) {
                        vErrors = [err23];
                    }
                    else {
                        vErrors.push(err23);
                    }
                    errors++;
                }
            }
        }
        else {
            const err24 = { instancePath: instancePath + "/highlight", schemaPath: "#/definitions/Highlight/type", keyword: "type", params: { type: "object" }, message: "must be object" };
            if (vErrors === null) {
                vErrors = [err24];
            }
            else {
                vErrors.push(err24);
            }
            errors++;
        }
    }
}
else {
    const err25 = { instancePath, schemaPath: "#/type", keyword: "type", params: { type: "object" }, message: "must be object" };
    if (vErrors === null) {
        vErrors = [err25];
    }
    else {
        vErrors.push(err25);
    }
    errors++;
} validate45.errors = vErrors; return errors === 0; }
const schema43 = { "type": "object", "additionalProperties": false, "properties": { "id": { "type": "string" }, "label": { "type": "string" }, "layoutVariable": { "type": "string" }, "groupVariable": { "type": "string" }, "edges": { "$ref": "#/definitions/Edges" }, "highlight": { "$ref": "#/definitions/NarrativeHighlight" } }, "required": ["id", "label", "layoutVariable"], "title": "Preset" };
const schema45 = { "type": "array", "items": { "type": "string" }, "title": "NarrativeHighlight" };
function validate53(data, { instancePath = "", parentData, parentDataProperty, rootData = data } = {}) { let vErrors = null; let errors = 0; if (data && typeof data == "object" && !Array.isArray(data)) {
    if (data.id === undefined) {
        const err0 = { instancePath, schemaPath: "#/required", keyword: "required", params: { missingProperty: "id" }, message: "must have required property '" + "id" + "'" };
        if (vErrors === null) {
            vErrors = [err0];
        }
        else {
            vErrors.push(err0);
        }
        errors++;
    }
    if (data.label === undefined) {
        const err1 = { instancePath, schemaPath: "#/required", keyword: "required", params: { missingProperty: "label" }, message: "must have required property '" + "label" + "'" };
        if (vErrors === null) {
            vErrors = [err1];
        }
        else {
            vErrors.push(err1);
        }
        errors++;
    }
    if (data.layoutVariable === undefined) {
        const err2 = { instancePath, schemaPath: "#/required", keyword: "required", params: { missingProperty: "layoutVariable" }, message: "must have required property '" + "layoutVariable" + "'" };
        if (vErrors === null) {
            vErrors = [err2];
        }
        else {
            vErrors.push(err2);
        }
        errors++;
    }
    for (const key0 in data) {
        if (!((((((key0 === "id") || (key0 === "label")) || (key0 === "layoutVariable")) || (key0 === "groupVariable")) || (key0 === "edges")) || (key0 === "highlight"))) {
            const err3 = { instancePath, schemaPath: "#/additionalProperties", keyword: "additionalProperties", params: { additionalProperty: key0 }, message: "must NOT have additional properties" };
            if (vErrors === null) {
                vErrors = [err3];
            }
            else {
                vErrors.push(err3);
            }
            errors++;
        }
    }
    if (data.id !== undefined) {
        if (typeof data.id !== "string") {
            const err4 = { instancePath: instancePath + "/id", schemaPath: "#/properties/id/type", keyword: "type", params: { type: "string" }, message: "must be string" };
            if (vErrors === null) {
                vErrors = [err4];
            }
            else {
                vErrors.push(err4);
            }
            errors++;
        }
    }
    if (data.label !== undefined) {
        if (typeof data.label !== "string") {
            const err5 = { instancePath: instancePath + "/label", schemaPath: "#/properties/label/type", keyword: "type", params: { type: "string" }, message: "must be string" };
            if (vErrors === null) {
                vErrors = [err5];
            }
            else {
                vErrors.push(err5);
            }
            errors++;
        }
    }
    if (data.layoutVariable !== undefined) {
        if (typeof data.layoutVariable !== "string") {
            const err6 = { instancePath: instancePath + "/layoutVariable", schemaPath: "#/properties/layoutVariable/type", keyword: "type", params: { type: "string" }, message: "must be string" };
            if (vErrors === null) {
                vErrors = [err6];
            }
            else {
                vErrors.push(err6);
            }
            errors++;
        }
    }
    if (data.groupVariable !== undefined) {
        if (typeof data.groupVariable !== "string") {
            const err7 = { instancePath: instancePath + "/groupVariable", schemaPath: "#/properties/groupVariable/type", keyword: "type", params: { type: "string" }, message: "must be string" };
            if (vErrors === null) {
                vErrors = [err7];
            }
            else {
                vErrors.push(err7);
            }
            errors++;
        }
    }
    if (data.edges !== undefined) {
        let data4 = data.edges;
        if (data4 && typeof data4 == "object" && !Array.isArray(data4)) {
            for (const key1 in data4) {
                if (!((key1 === "display") || (key1 === "create"))) {
                    const err8 = { instancePath: instancePath + "/edges", schemaPath: "#/definitions/Edges/additionalProperties", keyword: "additionalProperties", params: { additionalProperty: key1 }, message: "must NOT have additional properties" };
                    if (vErrors === null) {
                        vErrors = [err8];
                    }
                    else {
                        vErrors.push(err8);
                    }
                    errors++;
                }
            }
            if (data4.display !== undefined) {
                let data5 = data4.display;
                if (Array.isArray(data5)) {
                    const len0 = data5.length;
                    for (let i0 = 0; i0 < len0; i0++) {
                        if (typeof data5[i0] !== "string") {
                            const err9 = { instancePath: instancePath + "/edges/display/" + i0, schemaPath: "#/definitions/Edges/properties/display/items/type", keyword: "type", params: { type: "string" }, message: "must be string" };
                            if (vErrors === null) {
                                vErrors = [err9];
                            }
                            else {
                                vErrors.push(err9);
                            }
                            errors++;
                        }
                    }
                }
                else {
                    const err10 = { instancePath: instancePath + "/edges/display", schemaPath: "#/definitions/Edges/properties/display/type", keyword: "type", params: { type: "array" }, message: "must be array" };
                    if (vErrors === null) {
                        vErrors = [err10];
                    }
                    else {
                        vErrors.push(err10);
                    }
                    errors++;
                }
            }
            if (data4.create !== undefined) {
                if (typeof data4.create !== "string") {
                    const err11 = { instancePath: instancePath + "/edges/create", schemaPath: "#/definitions/Edges/properties/create/type", keyword: "type", params: { type: "string" }, message: "must be string" };
                    if (vErrors === null) {
                        vErrors = [err11];
                    }
                    else {
                        vErrors.push(err11);
                    }
                    errors++;
                }
            }
        }
        else {
            const err12 = { instancePath: instancePath + "/edges", schemaPath: "#/definitions/Edges/type", keyword: "type", params: { type: "object" }, message: "must be object" };
            if (vErrors === null) {
                vErrors = [err12];
            }
            else {
                vErrors.push(err12);
            }
            errors++;
        }
    }
    if (data.highlight !== undefined) {
        let data8 = data.highlight;
        if (Array.isArray(data8)) {
            const len1 = data8.length;
            for (let i1 = 0; i1 < len1; i1++) {
                if (typeof data8[i1] !== "string") {
                    const err13 = { instancePath: instancePath + "/highlight/" + i1, schemaPath: "#/definitions/NarrativeHighlight/items/type", keyword: "type", params: { type: "string" }, message: "must be string" };
                    if (vErrors === null) {
                        vErrors = [err13];
                    }
                    else {
                        vErrors.push(err13);
                    }
                    errors++;
                }
            }
        }
        else {
            const err14 = { instancePath: instancePath + "/highlight", schemaPath: "#/definitions/NarrativeHighlight/type", keyword: "type", params: { type: "array" }, message: "must be array" };
            if (vErrors === null) {
                vErrors = [err14];
            }
            else {
                vErrors.push(err14);
            }
            errors++;
        }
    }
}
else {
    const err15 = { instancePath, schemaPath: "#/type", keyword: "type", params: { type: "object" }, message: "must be object" };
    if (vErrors === null) {
        vErrors = [err15];
    }
    else {
        vErrors.push(err15);
    }
    errors++;
} validate53.errors = vErrors; return errors === 0; }
const schema46 = { "type": "object", "additionalProperties": false, "properties": { "sortOrder": { "type": "array", "items": { "$ref": "#/definitions/SortOrder" } }, "sortableProperties": { "type": "array", "items": { "$ref": "#/definitions/Property" } } }, "required": ["sortOrder", "sortableProperties"], "title": "SortOptions" };
const schema47 = { "type": "object", "additionalProperties": false, "properties": { "label": { "type": "string" }, "variable": { "type": "string" } }, "required": ["label", "variable"], "title": "Property" };
function validate55(data, { instancePath = "", parentData, parentDataProperty, rootData = data } = {}) { let vErrors = null; let errors = 0; if (data && typeof data == "object" && !Array.isArray(data)) {
    if (data.sortOrder === undefined) {
        const err0 = { instancePath, schemaPath: "#/required", keyword: "required", params: { missingProperty: "sortOrder" }, message: "must have required property '" + "sortOrder" + "'" };
        if (vErrors === null) {
            vErrors = [err0];
        }
        else {
            vErrors.push(err0);
        }
        errors++;
    }
    if (data.sortableProperties === undefined) {
        const err1 = { instancePath, schemaPath: "#/required", keyword: "required", params: { missingProperty: "sortableProperties" }, message: "must have required property '" + "sortableProperties" + "'" };
        if (vErrors === null) {
            vErrors = [err1];
        }
        else {
            vErrors.push(err1);
        }
        errors++;
    }
    for (const key0 in data) {
        if (!((key0 === "sortOrder") || (key0 === "sortableProperties"))) {
            const err2 = { instancePath, schemaPath: "#/additionalProperties", keyword: "additionalProperties", params: { additionalProperty: key0 }, message: "must NOT have additional properties" };
            if (vErrors === null) {
                vErrors = [err2];
            }
            else {
                vErrors.push(err2);
            }
            errors++;
        }
    }
    if (data.sortOrder !== undefined) {
        let data0 = data.sortOrder;
        if (Array.isArray(data0)) {
            const len0 = data0.length;
            for (let i0 = 0; i0 < len0; i0++) {
                if (!(validate48(data0[i0], { instancePath: instancePath + "/sortOrder/" + i0, parentData: data0, parentDataProperty: i0, rootData }))) {
                    vErrors = vErrors === null ? validate48.errors : vErrors.concat(validate48.errors);
                    errors = vErrors.length;
                }
            }
        }
        else {
            const err3 = { instancePath: instancePath + "/sortOrder", schemaPath: "#/properties/sortOrder/type", keyword: "type", params: { type: "array" }, message: "must be array" };
            if (vErrors === null) {
                vErrors = [err3];
            }
            else {
                vErrors.push(err3);
            }
            errors++;
        }
    }
    if (data.sortableProperties !== undefined) {
        let data2 = data.sortableProperties;
        if (Array.isArray(data2)) {
            const len1 = data2.length;
            for (let i1 = 0; i1 < len1; i1++) {
                let data3 = data2[i1];
                if (data3 && typeof data3 == "object" && !Array.isArray(data3)) {
                    if (data3.label === undefined) {
                        const err4 = { instancePath: instancePath + "/sortableProperties/" + i1, schemaPath: "#/definitions/Property/required", keyword: "required", params: { missingProperty: "label" }, message: "must have required property '" + "label" + "'" };
                        if (vErrors === null) {
                            vErrors = [err4];
                        }
                        else {
                            vErrors.push(err4);
                        }
                        errors++;
                    }
                    if (data3.variable === undefined) {
                        const err5 = { instancePath: instancePath + "/sortableProperties/" + i1, schemaPath: "#/definitions/Property/required", keyword: "required", params: { missingProperty: "variable" }, message: "must have required property '" + "variable" + "'" };
                        if (vErrors === null) {
                            vErrors = [err5];
                        }
                        else {
                            vErrors.push(err5);
                        }
                        errors++;
                    }
                    for (const key1 in data3) {
                        if (!((key1 === "label") || (key1 === "variable"))) {
                            const err6 = { instancePath: instancePath + "/sortableProperties/" + i1, schemaPath: "#/definitions/Property/additionalProperties", keyword: "additionalProperties", params: { additionalProperty: key1 }, message: "must NOT have additional properties" };
                            if (vErrors === null) {
                                vErrors = [err6];
                            }
                            else {
                                vErrors.push(err6);
                            }
                            errors++;
                        }
                    }
                    if (data3.label !== undefined) {
                        if (typeof data3.label !== "string") {
                            const err7 = { instancePath: instancePath + "/sortableProperties/" + i1 + "/label", schemaPath: "#/definitions/Property/properties/label/type", keyword: "type", params: { type: "string" }, message: "must be string" };
                            if (vErrors === null) {
                                vErrors = [err7];
                            }
                            else {
                                vErrors.push(err7);
                            }
                            errors++;
                        }
                    }
                    if (data3.variable !== undefined) {
                        if (typeof data3.variable !== "string") {
                            const err8 = { instancePath: instancePath + "/sortableProperties/" + i1 + "/variable", schemaPath: "#/definitions/Property/properties/variable/type", keyword: "type", params: { type: "string" }, message: "must be string" };
                            if (vErrors === null) {
                                vErrors = [err8];
                            }
                            else {
                                vErrors.push(err8);
                            }
                            errors++;
                        }
                    }
                }
                else {
                    const err9 = { instancePath: instancePath + "/sortableProperties/" + i1, schemaPath: "#/definitions/Property/type", keyword: "type", params: { type: "object" }, message: "must be object" };
                    if (vErrors === null) {
                        vErrors = [err9];
                    }
                    else {
                        vErrors.push(err9);
                    }
                    errors++;
                }
            }
        }
        else {
            const err10 = { instancePath: instancePath + "/sortableProperties", schemaPath: "#/properties/sortableProperties/type", keyword: "type", params: { type: "array" }, message: "must be array" };
            if (vErrors === null) {
                vErrors = [err10];
            }
            else {
                vErrors.push(err10);
            }
            errors++;
        }
    }
}
else {
    const err11 = { instancePath, schemaPath: "#/type", keyword: "type", params: { type: "object" }, message: "must be object" };
    if (vErrors === null) {
        vErrors = [err11];
    }
    else {
        vErrors.push(err11);
    }
    errors++;
} validate55.errors = vErrors; return errors === 0; }
const schema48 = { "type": "object", "additionalProperties": false, "properties": { "displayLabel": { "type": "string" }, "additionalProperties": { "type": "array", "items": { "$ref": "#/definitions/Property" } } }, "required": ["displayLabel"], "title": "CardOptions" };
function validate58(data, { instancePath = "", parentData, parentDataProperty, rootData = data } = {}) { let vErrors = null; let errors = 0; if (data && typeof data == "object" && !Array.isArray(data)) {
    if (data.displayLabel === undefined) {
        const err0 = { instancePath, schemaPath: "#/required", keyword: "required", params: { missingProperty: "displayLabel" }, message: "must have required property '" + "displayLabel" + "'" };
        if (vErrors === null) {
            vErrors = [err0];
        }
        else {
            vErrors.push(err0);
        }
        errors++;
    }
    for (const key0 in data) {
        if (!((key0 === "displayLabel") || (key0 === "additionalProperties"))) {
            const err1 = { instancePath, schemaPath: "#/additionalProperties", keyword: "additionalProperties", params: { additionalProperty: key0 }, message: "must NOT have additional properties" };
            if (vErrors === null) {
                vErrors = [err1];
            }
            else {
                vErrors.push(err1);
            }
            errors++;
        }
    }
    if (data.displayLabel !== undefined) {
        if (typeof data.displayLabel !== "string") {
            const err2 = { instancePath: instancePath + "/displayLabel", schemaPath: "#/properties/displayLabel/type", keyword: "type", params: { type: "string" }, message: "must be string" };
            if (vErrors === null) {
                vErrors = [err2];
            }
            else {
                vErrors.push(err2);
            }
            errors++;
        }
    }
    if (data.additionalProperties !== undefined) {
        let data1 = data.additionalProperties;
        if (Array.isArray(data1)) {
            const len0 = data1.length;
            for (let i0 = 0; i0 < len0; i0++) {
                let data2 = data1[i0];
                if (data2 && typeof data2 == "object" && !Array.isArray(data2)) {
                    if (data2.label === undefined) {
                        const err3 = { instancePath: instancePath + "/additionalProperties/" + i0, schemaPath: "#/definitions/Property/required", keyword: "required", params: { missingProperty: "label" }, message: "must have required property '" + "label" + "'" };
                        if (vErrors === null) {
                            vErrors = [err3];
                        }
                        else {
                            vErrors.push(err3);
                        }
                        errors++;
                    }
                    if (data2.variable === undefined) {
                        const err4 = { instancePath: instancePath + "/additionalProperties/" + i0, schemaPath: "#/definitions/Property/required", keyword: "required", params: { missingProperty: "variable" }, message: "must have required property '" + "variable" + "'" };
                        if (vErrors === null) {
                            vErrors = [err4];
                        }
                        else {
                            vErrors.push(err4);
                        }
                        errors++;
                    }
                    for (const key1 in data2) {
                        if (!((key1 === "label") || (key1 === "variable"))) {
                            const err5 = { instancePath: instancePath + "/additionalProperties/" + i0, schemaPath: "#/definitions/Property/additionalProperties", keyword: "additionalProperties", params: { additionalProperty: key1 }, message: "must NOT have additional properties" };
                            if (vErrors === null) {
                                vErrors = [err5];
                            }
                            else {
                                vErrors.push(err5);
                            }
                            errors++;
                        }
                    }
                    if (data2.label !== undefined) {
                        if (typeof data2.label !== "string") {
                            const err6 = { instancePath: instancePath + "/additionalProperties/" + i0 + "/label", schemaPath: "#/definitions/Property/properties/label/type", keyword: "type", params: { type: "string" }, message: "must be string" };
                            if (vErrors === null) {
                                vErrors = [err6];
                            }
                            else {
                                vErrors.push(err6);
                            }
                            errors++;
                        }
                    }
                    if (data2.variable !== undefined) {
                        if (typeof data2.variable !== "string") {
                            const err7 = { instancePath: instancePath + "/additionalProperties/" + i0 + "/variable", schemaPath: "#/definitions/Property/properties/variable/type", keyword: "type", params: { type: "string" }, message: "must be string" };
                            if (vErrors === null) {
                                vErrors = [err7];
                            }
                            else {
                                vErrors.push(err7);
                            }
                            errors++;
                        }
                    }
                }
                else {
                    const err8 = { instancePath: instancePath + "/additionalProperties/" + i0, schemaPath: "#/definitions/Property/type", keyword: "type", params: { type: "object" }, message: "must be object" };
                    if (vErrors === null) {
                        vErrors = [err8];
                    }
                    else {
                        vErrors.push(err8);
                    }
                    errors++;
                }
            }
        }
        else {
            const err9 = { instancePath: instancePath + "/additionalProperties", schemaPath: "#/properties/additionalProperties/type", keyword: "type", params: { type: "array" }, message: "must be array" };
            if (vErrors === null) {
                vErrors = [err9];
            }
            else {
                vErrors.push(err9);
            }
            errors++;
        }
    }
}
else {
    const err10 = { instancePath, schemaPath: "#/type", keyword: "type", params: { type: "object" }, message: "must be object" };
    if (vErrors === null) {
        vErrors = [err10];
    }
    else {
        vErrors.push(err10);
    }
    errors++;
} validate58.errors = vErrors; return errors === 0; }
const schema54 = { "type": "object", "additionalProperties": false, "properties": { "action": { "type": "string", "enum": ["SHOW", "SKIP"] }, "filter": { "$ref": "#/definitions/Filter" } }, "required": ["action", "filter"], "title": "SkipLogic" };
function validate60(data, { instancePath = "", parentData, parentDataProperty, rootData = data } = {}) { let vErrors = null; let errors = 0; if (data && typeof data == "object" && !Array.isArray(data)) {
    if (data.action === undefined) {
        const err0 = { instancePath, schemaPath: "#/required", keyword: "required", params: { missingProperty: "action" }, message: "must have required property '" + "action" + "'" };
        if (vErrors === null) {
            vErrors = [err0];
        }
        else {
            vErrors.push(err0);
        }
        errors++;
    }
    if (data.filter === undefined) {
        const err1 = { instancePath, schemaPath: "#/required", keyword: "required", params: { missingProperty: "filter" }, message: "must have required property '" + "filter" + "'" };
        if (vErrors === null) {
            vErrors = [err1];
        }
        else {
            vErrors.push(err1);
        }
        errors++;
    }
    for (const key0 in data) {
        if (!((key0 === "action") || (key0 === "filter"))) {
            const err2 = { instancePath, schemaPath: "#/additionalProperties", keyword: "additionalProperties", params: { additionalProperty: key0 }, message: "must NOT have additional properties" };
            if (vErrors === null) {
                vErrors = [err2];
            }
            else {
                vErrors.push(err2);
            }
            errors++;
        }
    }
    if (data.action !== undefined) {
        let data0 = data.action;
        if (typeof data0 !== "string") {
            const err3 = { instancePath: instancePath + "/action", schemaPath: "#/properties/action/type", keyword: "type", params: { type: "string" }, message: "must be string" };
            if (vErrors === null) {
                vErrors = [err3];
            }
            else {
                vErrors.push(err3);
            }
            errors++;
        }
        if (!((data0 === "SHOW") || (data0 === "SKIP"))) {
            const err4 = { instancePath: instancePath + "/action", schemaPath: "#/properties/action/enum", keyword: "enum", params: { allowedValues: schema54.properties.action.enum }, message: "must be equal to one of the allowed values" };
            if (vErrors === null) {
                vErrors = [err4];
            }
            else {
                vErrors.push(err4);
            }
            errors++;
        }
    }
    if (data.filter !== undefined) {
        if (!(validate40(data.filter, { instancePath: instancePath + "/filter", parentData: data, parentDataProperty: "filter", rootData }))) {
            vErrors = vErrors === null ? validate40.errors : vErrors.concat(validate40.errors);
            errors = vErrors.length;
        }
    }
}
else {
    const err5 = { instancePath, schemaPath: "#/type", keyword: "type", params: { type: "object" }, message: "must be object" };
    if (vErrors === null) {
        vErrors = [err5];
    }
    else {
        vErrors.push(err5);
    }
    errors++;
} validate60.errors = vErrors; return errors === 0; }
const pattern6 = new RegExp("^[0-9]{2,6}$", "u");
function validate34(data, { instancePath = "", parentData, parentDataProperty, rootData = data } = {}) { let vErrors = null; let errors = 0; const _errs1 = errors; let valid0 = false; const _errs2 = errors; if (data && typeof data == "object" && !Array.isArray(data)) {
    if (data.form === undefined) {
        const err0 = { instancePath, schemaPath: "#/anyOf/0/required", keyword: "required", params: { missingProperty: "form" }, message: "must have required property '" + "form" + "'" };
        if (vErrors === null) {
            vErrors = [err0];
        }
        else {
            vErrors.push(err0);
        }
        errors++;
    }
    if (data.introductionPanel === undefined) {
        const err1 = { instancePath, schemaPath: "#/anyOf/0/required", keyword: "required", params: { missingProperty: "introductionPanel" }, message: "must have required property '" + "introductionPanel" + "'" };
        if (vErrors === null) {
            vErrors = [err1];
        }
        else {
            vErrors.push(err1);
        }
        errors++;
    }
    if (data.type !== undefined) {
        if ("EgoForm" !== data.type) {
            const err2 = { instancePath: instancePath + "/type", schemaPath: "#/anyOf/0/properties/type/const", keyword: "const", params: { allowedValue: "EgoForm" }, message: "must be equal to constant" };
            if (vErrors === null) {
                vErrors = [err2];
            }
            else {
                vErrors.push(err2);
            }
            errors++;
        }
    }
} var _valid0 = _errs2 === errors; valid0 = valid0 || _valid0; if (!valid0) {
    const _errs4 = errors;
    if (data && typeof data == "object" && !Array.isArray(data)) {
        if (data.form === undefined) {
            const err3 = { instancePath, schemaPath: "#/anyOf/1/required", keyword: "required", params: { missingProperty: "form" }, message: "must have required property '" + "form" + "'" };
            if (vErrors === null) {
                vErrors = [err3];
            }
            else {
                vErrors.push(err3);
            }
            errors++;
        }
        if (data.introductionPanel === undefined) {
            const err4 = { instancePath, schemaPath: "#/anyOf/1/required", keyword: "required", params: { missingProperty: "introductionPanel" }, message: "must have required property '" + "introductionPanel" + "'" };
            if (vErrors === null) {
                vErrors = [err4];
            }
            else {
                vErrors.push(err4);
            }
            errors++;
        }
        if (data.type !== undefined) {
            if ("AlterForm" !== data.type) {
                const err5 = { instancePath: instancePath + "/type", schemaPath: "#/anyOf/1/properties/type/const", keyword: "const", params: { allowedValue: "AlterForm" }, message: "must be equal to constant" };
                if (vErrors === null) {
                    vErrors = [err5];
                }
                else {
                    vErrors.push(err5);
                }
                errors++;
            }
        }
    }
    var _valid0 = _errs4 === errors;
    valid0 = valid0 || _valid0;
    if (!valid0) {
        const _errs6 = errors;
        if (data && typeof data == "object" && !Array.isArray(data)) {
            if (data.form === undefined) {
                const err6 = { instancePath, schemaPath: "#/anyOf/2/required", keyword: "required", params: { missingProperty: "form" }, message: "must have required property '" + "form" + "'" };
                if (vErrors === null) {
                    vErrors = [err6];
                }
                else {
                    vErrors.push(err6);
                }
                errors++;
            }
            if (data.introductionPanel === undefined) {
                const err7 = { instancePath, schemaPath: "#/anyOf/2/required", keyword: "required", params: { missingProperty: "introductionPanel" }, message: "must have required property '" + "introductionPanel" + "'" };
                if (vErrors === null) {
                    vErrors = [err7];
                }
                else {
                    vErrors.push(err7);
                }
                errors++;
            }
            if (data.type !== undefined) {
                if ("AlterEdgeForm" !== data.type) {
                    const err8 = { instancePath: instancePath + "/type", schemaPath: "#/anyOf/2/properties/type/const", keyword: "const", params: { allowedValue: "AlterEdgeForm" }, message: "must be equal to constant" };
                    if (vErrors === null) {
                        vErrors = [err8];
                    }
                    else {
                        vErrors.push(err8);
                    }
                    errors++;
                }
            }
        }
        var _valid0 = _errs6 === errors;
        valid0 = valid0 || _valid0;
        if (!valid0) {
            const _errs8 = errors;
            if (data && typeof data == "object" && !Array.isArray(data)) {
                if (data.items === undefined) {
                    const err9 = { instancePath, schemaPath: "#/anyOf/3/required", keyword: "required", params: { missingProperty: "items" }, message: "must have required property '" + "items" + "'" };
                    if (vErrors === null) {
                        vErrors = [err9];
                    }
                    else {
                        vErrors.push(err9);
                    }
                    errors++;
                }
                if (data.type !== undefined) {
                    if ("Information" !== data.type) {
                        const err10 = { instancePath: instancePath + "/type", schemaPath: "#/anyOf/3/properties/type/const", keyword: "const", params: { allowedValue: "Information" }, message: "must be equal to constant" };
                        if (vErrors === null) {
                            vErrors = [err10];
                        }
                        else {
                            vErrors.push(err10);
                        }
                        errors++;
                    }
                }
            }
            var _valid0 = _errs8 === errors;
            valid0 = valid0 || _valid0;
            if (!valid0) {
                const _errs10 = errors;
                if (data && typeof data == "object" && !Array.isArray(data)) {
                    if (data.presets === undefined) {
                        const err11 = { instancePath, schemaPath: "#/anyOf/4/required", keyword: "required", params: { missingProperty: "presets" }, message: "must have required property '" + "presets" + "'" };
                        if (vErrors === null) {
                            vErrors = [err11];
                        }
                        else {
                            vErrors.push(err11);
                        }
                        errors++;
                    }
                    if (data.background === undefined) {
                        const err12 = { instancePath, schemaPath: "#/anyOf/4/required", keyword: "required", params: { missingProperty: "background" }, message: "must have required property '" + "background" + "'" };
                        if (vErrors === null) {
                            vErrors = [err12];
                        }
                        else {
                            vErrors.push(err12);
                        }
                        errors++;
                    }
                    if (data.type !== undefined) {
                        if ("Narrative" !== data.type) {
                            const err13 = { instancePath: instancePath + "/type", schemaPath: "#/anyOf/4/properties/type/const", keyword: "const", params: { allowedValue: "Narrative" }, message: "must be equal to constant" };
                            if (vErrors === null) {
                                vErrors = [err13];
                            }
                            else {
                                vErrors.push(err13);
                            }
                            errors++;
                        }
                    }
                }
                var _valid0 = _errs10 === errors;
                valid0 = valid0 || _valid0;
                if (!valid0) {
                    const _errs12 = errors;
                    if (data && typeof data == "object" && !Array.isArray(data)) {
                        if (data.prompts === undefined) {
                            const err14 = { instancePath, schemaPath: "#/anyOf/5/required", keyword: "required", params: { missingProperty: "prompts" }, message: "must have required property '" + "prompts" + "'" };
                            if (vErrors === null) {
                                vErrors = [err14];
                            }
                            else {
                                vErrors.push(err14);
                            }
                            errors++;
                        }
                        if (data.type !== undefined) {
                            let data5 = data.type;
                            if (!(((((((data5 === "NameGenerator") || (data5 === "NameGeneratorQuickAdd")) || (data5 === "NameGeneratorList")) || (data5 === "NameGeneratorAutoComplete")) || (data5 === "Sociogram")) || (data5 === "OrdinalBin")) || (data5 === "CategoricalBin"))) {
                                const err15 = { instancePath: instancePath + "/type", schemaPath: "#/anyOf/5/properties/type/enum", keyword: "enum", params: { allowedValues: schema26.anyOf[5].properties.type.enum }, message: "must be equal to one of the allowed values" };
                                if (vErrors === null) {
                                    vErrors = [err15];
                                }
                                else {
                                    vErrors.push(err15);
                                }
                                errors++;
                            }
                        }
                    }
                    var _valid0 = _errs12 === errors;
                    valid0 = valid0 || _valid0;
                }
            }
        }
    }
} if (!valid0) {
    const err16 = { instancePath, schemaPath: "#/anyOf", keyword: "anyOf", params: {}, message: "must match a schema in anyOf" };
    if (vErrors === null) {
        vErrors = [err16];
    }
    else {
        vErrors.push(err16);
    }
    errors++;
}
else {
    errors = _errs1;
    if (vErrors !== null) {
        if (_errs1) {
            vErrors.length = _errs1;
        }
        else {
            vErrors = null;
        }
    }
} if (data && typeof data == "object" && !Array.isArray(data)) {
    if (data.id === undefined) {
        const err17 = { instancePath, schemaPath: "#/required", keyword: "required", params: { missingProperty: "id" }, message: "must have required property '" + "id" + "'" };
        if (vErrors === null) {
            vErrors = [err17];
        }
        else {
            vErrors.push(err17);
        }
        errors++;
    }
    if (data.label === undefined) {
        const err18 = { instancePath, schemaPath: "#/required", keyword: "required", params: { missingProperty: "label" }, message: "must have required property '" + "label" + "'" };
        if (vErrors === null) {
            vErrors = [err18];
        }
        else {
            vErrors.push(err18);
        }
        errors++;
    }
    if (data.type === undefined) {
        const err19 = { instancePath, schemaPath: "#/required", keyword: "required", params: { missingProperty: "type" }, message: "must have required property '" + "type" + "'" };
        if (vErrors === null) {
            vErrors = [err19];
        }
        else {
            vErrors.push(err19);
        }
        errors++;
    }
    for (const key0 in data) {
        if (!(func2.call(schema26.properties, key0))) {
            const err20 = { instancePath, schemaPath: "#/additionalProperties", keyword: "additionalProperties", params: { additionalProperty: key0 }, message: "must NOT have additional properties" };
            if (vErrors === null) {
                vErrors = [err20];
            }
            else {
                vErrors.push(err20);
            }
            errors++;
        }
    }
    if (data.id !== undefined) {
        if (typeof data.id !== "string") {
            const err21 = { instancePath: instancePath + "/id", schemaPath: "#/properties/id/type", keyword: "type", params: { type: "string" }, message: "must be string" };
            if (vErrors === null) {
                vErrors = [err21];
            }
            else {
                vErrors.push(err21);
            }
            errors++;
        }
    }
    if (data.type !== undefined) {
        let data7 = data.type;
        if (typeof data7 !== "string") {
            const err22 = { instancePath: instancePath + "/type", schemaPath: "#/properties/type/type", keyword: "type", params: { type: "string" }, message: "must be string" };
            if (vErrors === null) {
                vErrors = [err22];
            }
            else {
                vErrors.push(err22);
            }
            errors++;
        }
        if (!((((((((((((data7 === "Narrative") || (data7 === "AlterForm")) || (data7 === "AlterEdgeForm")) || (data7 === "EgoForm")) || (data7 === "NameGenerator")) || (data7 === "NameGeneratorQuickAdd")) || (data7 === "NameGeneratorList")) || (data7 === "NameGeneratorAutoComplete")) || (data7 === "Sociogram")) || (data7 === "Information")) || (data7 === "OrdinalBin")) || (data7 === "CategoricalBin"))) {
            const err23 = { instancePath: instancePath + "/type", schemaPath: "#/properties/type/enum", keyword: "enum", params: { allowedValues: schema26.properties.type.enum }, message: "must be equal to one of the allowed values" };
            if (vErrors === null) {
                vErrors = [err23];
            }
            else {
                vErrors.push(err23);
            }
            errors++;
        }
    }
    if (data.label !== undefined) {
        if (typeof data.label !== "string") {
            const err24 = { instancePath: instancePath + "/label", schemaPath: "#/properties/label/type", keyword: "type", params: { type: "string" }, message: "must be string" };
            if (vErrors === null) {
                vErrors = [err24];
            }
            else {
                vErrors.push(err24);
            }
            errors++;
        }
    }
    if (data.form !== undefined) {
        if (!(validate35(data.form, { instancePath: instancePath + "/form", parentData: data, parentDataProperty: "form", rootData }))) {
            vErrors = vErrors === null ? validate35.errors : vErrors.concat(validate35.errors);
            errors = vErrors.length;
        }
    }
    if (data.quickAdd !== undefined) {
        let data10 = data.quickAdd;
        if ((typeof data10 !== "string") && (data10 !== null)) {
            const err25 = { instancePath: instancePath + "/quickAdd", schemaPath: "#/properties/quickAdd/type", keyword: "type", params: { type: schema26.properties.quickAdd.type }, message: "must be string,null" };
            if (vErrors === null) {
                vErrors = [err25];
            }
            else {
                vErrors.push(err25);
            }
            errors++;
        }
    }
    if (data.dataSource !== undefined) {
        let data11 = data.dataSource;
        if ((typeof data11 !== "string") && (data11 !== null)) {
            const err26 = { instancePath: instancePath + "/dataSource", schemaPath: "#/properties/dataSource/type", keyword: "type", params: { type: schema26.properties.dataSource.type }, message: "must be string,null" };
            if (vErrors === null) {
                vErrors = [err26];
            }
            else {
                vErrors.push(err26);
            }
            errors++;
        }
    }
    if (data.subject !== undefined) {
        if (!(validate37(data.subject, { instancePath: instancePath + "/subject", parentData: data, parentDataProperty: "subject", rootData }))) {
            vErrors = vErrors === null ? validate37.errors : vErrors.concat(validate37.errors);
            errors = vErrors.length;
        }
    }
    if (data.panels !== undefined) {
        let data13 = data.panels;
        if (Array.isArray(data13)) {
            const len0 = data13.length;
            for (let i0 = 0; i0 < len0; i0++) {
                if (!(validate39(data13[i0], { instancePath: instancePath + "/panels/" + i0, parentData: data13, parentDataProperty: i0, rootData }))) {
                    vErrors = vErrors === null ? validate39.errors : vErrors.concat(validate39.errors);
                    errors = vErrors.length;
                }
            }
        }
        else {
            const err27 = { instancePath: instancePath + "/panels", schemaPath: "#/properties/panels/type", keyword: "type", params: { type: "array" }, message: "must be array" };
            if (vErrors === null) {
                vErrors = [err27];
            }
            else {
                vErrors.push(err27);
            }
            errors++;
        }
    }
    if (data.prompts !== undefined) {
        let data15 = data.prompts;
        if (Array.isArray(data15)) {
            if (data15.length < 1) {
                const err28 = { instancePath: instancePath + "/prompts", schemaPath: "#/properties/prompts/minItems", keyword: "minItems", params: { limit: 1 }, message: "must NOT have fewer than 1 items" };
                if (vErrors === null) {
                    vErrors = [err28];
                }
                else {
                    vErrors.push(err28);
                }
                errors++;
            }
            const len1 = data15.length;
            for (let i1 = 0; i1 < len1; i1++) {
                if (!(validate45(data15[i1], { instancePath: instancePath + "/prompts/" + i1, parentData: data15, parentDataProperty: i1, rootData }))) {
                    vErrors = vErrors === null ? validate45.errors : vErrors.concat(validate45.errors);
                    errors = vErrors.length;
                }
            }
        }
        else {
            const err29 = { instancePath: instancePath + "/prompts", schemaPath: "#/properties/prompts/type", keyword: "type", params: { type: "array" }, message: "must be array" };
            if (vErrors === null) {
                vErrors = [err29];
            }
            else {
                vErrors.push(err29);
            }
            errors++;
        }
    }
    if (data.presets !== undefined) {
        let data17 = data.presets;
        if (Array.isArray(data17)) {
            if (data17.length < 1) {
                const err30 = { instancePath: instancePath + "/presets", schemaPath: "#/properties/presets/minItems", keyword: "minItems", params: { limit: 1 }, message: "must NOT have fewer than 1 items" };
                if (vErrors === null) {
                    vErrors = [err30];
                }
                else {
                    vErrors.push(err30);
                }
                errors++;
            }
            const len2 = data17.length;
            for (let i2 = 0; i2 < len2; i2++) {
                if (!(validate53(data17[i2], { instancePath: instancePath + "/presets/" + i2, parentData: data17, parentDataProperty: i2, rootData }))) {
                    vErrors = vErrors === null ? validate53.errors : vErrors.concat(validate53.errors);
                    errors = vErrors.length;
                }
            }
        }
        else {
            const err31 = { instancePath: instancePath + "/presets", schemaPath: "#/properties/presets/type", keyword: "type", params: { type: "array" }, message: "must be array" };
            if (vErrors === null) {
                vErrors = [err31];
            }
            else {
                vErrors.push(err31);
            }
            errors++;
        }
    }
    if (data.background !== undefined) {
        let data19 = data.background;
        if (data19 && typeof data19 == "object" && !Array.isArray(data19)) {
            if (data19.concentricCircles === undefined) {
                const err32 = { instancePath: instancePath + "/background", schemaPath: "#/properties/background/required", keyword: "required", params: { missingProperty: "concentricCircles" }, message: "must have required property '" + "concentricCircles" + "'" };
                if (vErrors === null) {
                    vErrors = [err32];
                }
                else {
                    vErrors.push(err32);
                }
                errors++;
            }
            if (data19.skewedTowardCenter === undefined) {
                const err33 = { instancePath: instancePath + "/background", schemaPath: "#/properties/background/required", keyword: "required", params: { missingProperty: "skewedTowardCenter" }, message: "must have required property '" + "skewedTowardCenter" + "'" };
                if (vErrors === null) {
                    vErrors = [err33];
                }
                else {
                    vErrors.push(err33);
                }
                errors++;
            }
            for (const key1 in data19) {
                if (!(((key1 === "image") || (key1 === "concentricCircles")) || (key1 === "skewedTowardCenter"))) {
                    const err34 = { instancePath: instancePath + "/background", schemaPath: "#/properties/background/additionalProperties", keyword: "additionalProperties", params: { additionalProperty: key1 }, message: "must NOT have additional properties" };
                    if (vErrors === null) {
                        vErrors = [err34];
                    }
                    else {
                        vErrors.push(err34);
                    }
                    errors++;
                }
            }
            if (data19.image !== undefined) {
                if (typeof data19.image !== "string") {
                    const err35 = { instancePath: instancePath + "/background/image", schemaPath: "#/properties/background/properties/image/type", keyword: "type", params: { type: "string" }, message: "must be string" };
                    if (vErrors === null) {
                        vErrors = [err35];
                    }
                    else {
                        vErrors.push(err35);
                    }
                    errors++;
                }
            }
            if (data19.concentricCircles !== undefined) {
                let data21 = data19.concentricCircles;
                if (!(((typeof data21 == "number") && (!(data21 % 1) && !isNaN(data21))) && (isFinite(data21)))) {
                    const err36 = { instancePath: instancePath + "/background/concentricCircles", schemaPath: "#/properties/background/properties/concentricCircles/type", keyword: "type", params: { type: "integer" }, message: "must be integer" };
                    if (vErrors === null) {
                        vErrors = [err36];
                    }
                    else {
                        vErrors.push(err36);
                    }
                    errors++;
                }
            }
            if (data19.skewedTowardCenter !== undefined) {
                if (typeof data19.skewedTowardCenter !== "boolean") {
                    const err37 = { instancePath: instancePath + "/background/skewedTowardCenter", schemaPath: "#/properties/background/properties/skewedTowardCenter/type", keyword: "type", params: { type: "boolean" }, message: "must be boolean" };
                    if (vErrors === null) {
                        vErrors = [err37];
                    }
                    else {
                        vErrors.push(err37);
                    }
                    errors++;
                }
            }
        }
        else {
            const err38 = { instancePath: instancePath + "/background", schemaPath: "#/properties/background/type", keyword: "type", params: { type: "object" }, message: "must be object" };
            if (vErrors === null) {
                vErrors = [err38];
            }
            else {
                vErrors.push(err38);
            }
            errors++;
        }
    }
    if (data.sortOptions !== undefined) {
        if (!(validate55(data.sortOptions, { instancePath: instancePath + "/sortOptions", parentData: data, parentDataProperty: "sortOptions", rootData }))) {
            vErrors = vErrors === null ? validate55.errors : vErrors.concat(validate55.errors);
            errors = vErrors.length;
        }
    }
    if (data.cardOptions !== undefined) {
        let data24 = data.cardOptions;
        if (data24 && typeof data24 == "object" && !Array.isArray(data24)) {
            for (const key2 in data24) {
                if (pattern6.test(key2)) {
                    if (!(validate58(data24[key2], { instancePath: instancePath + "/cardOptions/" + key2.replace(/~/g, "~0").replace(/\//g, "~1"), parentData: data24, parentDataProperty: key2, rootData }))) {
                        vErrors = vErrors === null ? validate58.errors : vErrors.concat(validate58.errors);
                        errors = vErrors.length;
                    }
                }
            }
        }
        else {
            const err39 = { instancePath: instancePath + "/cardOptions", schemaPath: "#/properties/cardOptions/type", keyword: "type", params: { type: "object" }, message: "must be object" };
            if (vErrors === null) {
                vErrors = [err39];
            }
            else {
                vErrors.push(err39);
            }
            errors++;
        }
    }
    if (data.searchOptions !== undefined) {
        let data26 = data.searchOptions;
        if (data26 && typeof data26 == "object" && !Array.isArray(data26)) {
            if (data26.fuzziness === undefined) {
                const err40 = { instancePath: instancePath + "/searchOptions", schemaPath: "#/definitions/SearchOptions/required", keyword: "required", params: { missingProperty: "fuzziness" }, message: "must have required property '" + "fuzziness" + "'" };
                if (vErrors === null) {
                    vErrors = [err40];
                }
                else {
                    vErrors.push(err40);
                }
                errors++;
            }
            if (data26.matchProperties === undefined) {
                const err41 = { instancePath: instancePath + "/searchOptions", schemaPath: "#/definitions/SearchOptions/required", keyword: "required", params: { missingProperty: "matchProperties" }, message: "must have required property '" + "matchProperties" + "'" };
                if (vErrors === null) {
                    vErrors = [err41];
                }
                else {
                    vErrors.push(err41);
                }
                errors++;
            }
            for (const key3 in data26) {
                if (!((key3 === "fuzziness") || (key3 === "matchProperties"))) {
                    const err42 = { instancePath: instancePath + "/searchOptions", schemaPath: "#/definitions/SearchOptions/additionalProperties", keyword: "additionalProperties", params: { additionalProperty: key3 }, message: "must NOT have additional properties" };
                    if (vErrors === null) {
                        vErrors = [err42];
                    }
                    else {
                        vErrors.push(err42);
                    }
                    errors++;
                }
            }
            if (data26.fuzziness !== undefined) {
                let data27 = data26.fuzziness;
                if (!((typeof data27 == "number") && (isFinite(data27)))) {
                    const err43 = { instancePath: instancePath + "/searchOptions/fuzziness", schemaPath: "#/definitions/SearchOptions/properties/fuzziness/type", keyword: "type", params: { type: "number" }, message: "must be number" };
                    if (vErrors === null) {
                        vErrors = [err43];
                    }
                    else {
                        vErrors.push(err43);
                    }
                    errors++;
                }
            }
            if (data26.matchProperties !== undefined) {
                let data28 = data26.matchProperties;
                if (Array.isArray(data28)) {
                    const len3 = data28.length;
                    for (let i3 = 0; i3 < len3; i3++) {
                        if (typeof data28[i3] !== "string") {
                            const err44 = { instancePath: instancePath + "/searchOptions/matchProperties/" + i3, schemaPath: "#/definitions/SearchOptions/properties/matchProperties/items/type", keyword: "type", params: { type: "string" }, message: "must be string" };
                            if (vErrors === null) {
                                vErrors = [err44];
                            }
                            else {
                                vErrors.push(err44);
                            }
                            errors++;
                        }
                    }
                }
                else {
                    const err45 = { instancePath: instancePath + "/searchOptions/matchProperties", schemaPath: "#/definitions/SearchOptions/properties/matchProperties/type", keyword: "type", params: { type: "array" }, message: "must be array" };
                    if (vErrors === null) {
                        vErrors = [err45];
                    }
                    else {
                        vErrors.push(err45);
                    }
                    errors++;
                }
            }
        }
        else {
            const err46 = { instancePath: instancePath + "/searchOptions", schemaPath: "#/definitions/SearchOptions/type", keyword: "type", params: { type: "object" }, message: "must be object" };
            if (vErrors === null) {
                vErrors = [err46];
            }
            else {
                vErrors.push(err46);
            }
            errors++;
        }
    }
    if (data.behaviours !== undefined) {
        let data30 = data.behaviours;
        if (data30 && typeof data30 == "object" && !Array.isArray(data30)) {
            for (const key4 in data30) {
                if (!(((key4 === "freeDraw") || (key4 === "featureNode")) || (key4 === "allowRepositioning"))) {
                    const err47 = { instancePath: instancePath + "/behaviours", schemaPath: "#/definitions/Behaviours/additionalProperties", keyword: "additionalProperties", params: { additionalProperty: key4 }, message: "must NOT have additional properties" };
                    if (vErrors === null) {
                        vErrors = [err47];
                    }
                    else {
                        vErrors.push(err47);
                    }
                    errors++;
                }
            }
            if (data30.freeDraw !== undefined) {
                if (typeof data30.freeDraw !== "boolean") {
                    const err48 = { instancePath: instancePath + "/behaviours/freeDraw", schemaPath: "#/definitions/Behaviours/properties/freeDraw/type", keyword: "type", params: { type: "boolean" }, message: "must be boolean" };
                    if (vErrors === null) {
                        vErrors = [err48];
                    }
                    else {
                        vErrors.push(err48);
                    }
                    errors++;
                }
            }
            if (data30.featureNode !== undefined) {
                if (typeof data30.featureNode !== "boolean") {
                    const err49 = { instancePath: instancePath + "/behaviours/featureNode", schemaPath: "#/definitions/Behaviours/properties/featureNode/type", keyword: "type", params: { type: "boolean" }, message: "must be boolean" };
                    if (vErrors === null) {
                        vErrors = [err49];
                    }
                    else {
                        vErrors.push(err49);
                    }
                    errors++;
                }
            }
            if (data30.allowRepositioning !== undefined) {
                if (typeof data30.allowRepositioning !== "boolean") {
                    const err50 = { instancePath: instancePath + "/behaviours/allowRepositioning", schemaPath: "#/definitions/Behaviours/properties/allowRepositioning/type", keyword: "type", params: { type: "boolean" }, message: "must be boolean" };
                    if (vErrors === null) {
                        vErrors = [err50];
                    }
                    else {
                        vErrors.push(err50);
                    }
                    errors++;
                }
            }
        }
        else {
            const err51 = { instancePath: instancePath + "/behaviours", schemaPath: "#/definitions/Behaviours/type", keyword: "type", params: { type: "object" }, message: "must be object" };
            if (vErrors === null) {
                vErrors = [err51];
            }
            else {
                vErrors.push(err51);
            }
            errors++;
        }
    }
    if (data.showExistingNodes !== undefined) {
        if (typeof data.showExistingNodes !== "boolean") {
            const err52 = { instancePath: instancePath + "/showExistingNodes", schemaPath: "#/properties/showExistingNodes/type", keyword: "type", params: { type: "boolean" }, message: "must be boolean" };
            if (vErrors === null) {
                vErrors = [err52];
            }
            else {
                vErrors.push(err52);
            }
            errors++;
        }
    }
    if (data.title !== undefined) {
        if (typeof data.title !== "string") {
            const err53 = { instancePath: instancePath + "/title", schemaPath: "#/properties/title/type", keyword: "type", params: { type: "string" }, message: "must be string" };
            if (vErrors === null) {
                vErrors = [err53];
            }
            else {
                vErrors.push(err53);
            }
            errors++;
        }
    }
    if (data.items !== undefined) {
        let data36 = data.items;
        if (Array.isArray(data36)) {
            const len4 = data36.length;
            for (let i4 = 0; i4 < len4; i4++) {
                let data37 = data36[i4];
                if (data37 && typeof data37 == "object" && !Array.isArray(data37)) {
                    if (data37.content === undefined) {
                        const err54 = { instancePath: instancePath + "/items/" + i4, schemaPath: "#/definitions/Item/required", keyword: "required", params: { missingProperty: "content" }, message: "must have required property '" + "content" + "'" };
                        if (vErrors === null) {
                            vErrors = [err54];
                        }
                        else {
                            vErrors.push(err54);
                        }
                        errors++;
                    }
                    if (data37.id === undefined) {
                        const err55 = { instancePath: instancePath + "/items/" + i4, schemaPath: "#/definitions/Item/required", keyword: "required", params: { missingProperty: "id" }, message: "must have required property '" + "id" + "'" };
                        if (vErrors === null) {
                            vErrors = [err55];
                        }
                        else {
                            vErrors.push(err55);
                        }
                        errors++;
                    }
                    if (data37.type === undefined) {
                        const err56 = { instancePath: instancePath + "/items/" + i4, schemaPath: "#/definitions/Item/required", keyword: "required", params: { missingProperty: "type" }, message: "must have required property '" + "type" + "'" };
                        if (vErrors === null) {
                            vErrors = [err56];
                        }
                        else {
                            vErrors.push(err56);
                        }
                        errors++;
                    }
                    for (const key5 in data37) {
                        if (!((((((key5 === "id") || (key5 === "type")) || (key5 === "content")) || (key5 === "description")) || (key5 === "size")) || (key5 === "loop"))) {
                            const err57 = { instancePath: instancePath + "/items/" + i4, schemaPath: "#/definitions/Item/additionalProperties", keyword: "additionalProperties", params: { additionalProperty: key5 }, message: "must NOT have additional properties" };
                            if (vErrors === null) {
                                vErrors = [err57];
                            }
                            else {
                                vErrors.push(err57);
                            }
                            errors++;
                        }
                    }
                    if (data37.id !== undefined) {
                        if (typeof data37.id !== "string") {
                            const err58 = { instancePath: instancePath + "/items/" + i4 + "/id", schemaPath: "#/definitions/Item/properties/id/type", keyword: "type", params: { type: "string" }, message: "must be string" };
                            if (vErrors === null) {
                                vErrors = [err58];
                            }
                            else {
                                vErrors.push(err58);
                            }
                            errors++;
                        }
                    }
                    if (data37.type !== undefined) {
                        let data39 = data37.type;
                        if (typeof data39 !== "string") {
                            const err59 = { instancePath: instancePath + "/items/" + i4 + "/type", schemaPath: "#/definitions/Item/properties/type/type", keyword: "type", params: { type: "string" }, message: "must be string" };
                            if (vErrors === null) {
                                vErrors = [err59];
                            }
                            else {
                                vErrors.push(err59);
                            }
                            errors++;
                        }
                        if (!((data39 === "text") || (data39 === "asset"))) {
                            const err60 = { instancePath: instancePath + "/items/" + i4 + "/type", schemaPath: "#/definitions/Item/properties/type/enum", keyword: "enum", params: { allowedValues: schema52.properties.type.enum }, message: "must be equal to one of the allowed values" };
                            if (vErrors === null) {
                                vErrors = [err60];
                            }
                            else {
                                vErrors.push(err60);
                            }
                            errors++;
                        }
                    }
                    if (data37.content !== undefined) {
                        if (typeof data37.content !== "string") {
                            const err61 = { instancePath: instancePath + "/items/" + i4 + "/content", schemaPath: "#/definitions/Item/properties/content/type", keyword: "type", params: { type: "string" }, message: "must be string" };
                            if (vErrors === null) {
                                vErrors = [err61];
                            }
                            else {
                                vErrors.push(err61);
                            }
                            errors++;
                        }
                    }
                    if (data37.description !== undefined) {
                        if (typeof data37.description !== "string") {
                            const err62 = { instancePath: instancePath + "/items/" + i4 + "/description", schemaPath: "#/definitions/Item/properties/description/type", keyword: "type", params: { type: "string" }, message: "must be string" };
                            if (vErrors === null) {
                                vErrors = [err62];
                            }
                            else {
                                vErrors.push(err62);
                            }
                            errors++;
                        }
                    }
                    if (data37.size !== undefined) {
                        if (typeof data37.size !== "string") {
                            const err63 = { instancePath: instancePath + "/items/" + i4 + "/size", schemaPath: "#/definitions/Item/properties/size/type", keyword: "type", params: { type: "string" }, message: "must be string" };
                            if (vErrors === null) {
                                vErrors = [err63];
                            }
                            else {
                                vErrors.push(err63);
                            }
                            errors++;
                        }
                    }
                    if (data37.loop !== undefined) {
                        if (typeof data37.loop !== "boolean") {
                            const err64 = { instancePath: instancePath + "/items/" + i4 + "/loop", schemaPath: "#/definitions/Item/properties/loop/type", keyword: "type", params: { type: "boolean" }, message: "must be boolean" };
                            if (vErrors === null) {
                                vErrors = [err64];
                            }
                            else {
                                vErrors.push(err64);
                            }
                            errors++;
                        }
                    }
                }
                else {
                    const err65 = { instancePath: instancePath + "/items/" + i4, schemaPath: "#/definitions/Item/type", keyword: "type", params: { type: "object" }, message: "must be object" };
                    if (vErrors === null) {
                        vErrors = [err65];
                    }
                    else {
                        vErrors.push(err65);
                    }
                    errors++;
                }
            }
        }
        else {
            const err66 = { instancePath: instancePath + "/items", schemaPath: "#/properties/items/type", keyword: "type", params: { type: "array" }, message: "must be array" };
            if (vErrors === null) {
                vErrors = [err66];
            }
            else {
                vErrors.push(err66);
            }
            errors++;
        }
    }
    if (data.introductionPanel !== undefined) {
        let data44 = data.introductionPanel;
        if (data44 && typeof data44 == "object" && !Array.isArray(data44)) {
            if (data44.title === undefined) {
                const err67 = { instancePath: instancePath + "/introductionPanel", schemaPath: "#/definitions/IntroductionPanel/required", keyword: "required", params: { missingProperty: "title" }, message: "must have required property '" + "title" + "'" };
                if (vErrors === null) {
                    vErrors = [err67];
                }
                else {
                    vErrors.push(err67);
                }
                errors++;
            }
            if (data44.text === undefined) {
                const err68 = { instancePath: instancePath + "/introductionPanel", schemaPath: "#/definitions/IntroductionPanel/required", keyword: "required", params: { missingProperty: "text" }, message: "must have required property '" + "text" + "'" };
                if (vErrors === null) {
                    vErrors = [err68];
                }
                else {
                    vErrors.push(err68);
                }
                errors++;
            }
            for (const key6 in data44) {
                if (!((key6 === "title") || (key6 === "text"))) {
                    const err69 = { instancePath: instancePath + "/introductionPanel", schemaPath: "#/definitions/IntroductionPanel/additionalProperties", keyword: "additionalProperties", params: { additionalProperty: key6 }, message: "must NOT have additional properties" };
                    if (vErrors === null) {
                        vErrors = [err69];
                    }
                    else {
                        vErrors.push(err69);
                    }
                    errors++;
                }
            }
            if (data44.title !== undefined) {
                if (typeof data44.title !== "string") {
                    const err70 = { instancePath: instancePath + "/introductionPanel/title", schemaPath: "#/definitions/IntroductionPanel/properties/title/type", keyword: "type", params: { type: "string" }, message: "must be string" };
                    if (vErrors === null) {
                        vErrors = [err70];
                    }
                    else {
                        vErrors.push(err70);
                    }
                    errors++;
                }
            }
            if (data44.text !== undefined) {
                if (typeof data44.text !== "string") {
                    const err71 = { instancePath: instancePath + "/introductionPanel/text", schemaPath: "#/definitions/IntroductionPanel/properties/text/type", keyword: "type", params: { type: "string" }, message: "must be string" };
                    if (vErrors === null) {
                        vErrors = [err71];
                    }
                    else {
                        vErrors.push(err71);
                    }
                    errors++;
                }
            }
        }
        else {
            const err72 = { instancePath: instancePath + "/introductionPanel", schemaPath: "#/definitions/IntroductionPanel/type", keyword: "type", params: { type: "object" }, message: "must be object" };
            if (vErrors === null) {
                vErrors = [err72];
            }
            else {
                vErrors.push(err72);
            }
            errors++;
        }
    }
    if (data.skipLogic !== undefined) {
        if (!(validate60(data.skipLogic, { instancePath: instancePath + "/skipLogic", parentData: data, parentDataProperty: "skipLogic", rootData }))) {
            vErrors = vErrors === null ? validate60.errors : vErrors.concat(validate60.errors);
            errors = vErrors.length;
        }
    }
}
else {
    const err73 = { instancePath, schemaPath: "#/type", keyword: "type", params: { type: "object" }, message: "must be object" };
    if (vErrors === null) {
        vErrors = [err73];
    }
    else {
        vErrors.push(err73);
    }
    errors++;
} validate34.errors = vErrors; return errors === 0; }
function validate11(data, { instancePath = "", parentData, parentDataProperty, rootData = data } = {}) { let vErrors = null; let errors = 0; if (data && typeof data == "object" && !Array.isArray(data)) {
    if (data.stages === undefined) {
        const err0 = { instancePath, schemaPath: "#/required", keyword: "required", params: { missingProperty: "stages" }, message: "must have required property '" + "stages" + "'" };
        if (vErrors === null) {
            vErrors = [err0];
        }
        else {
            vErrors.push(err0);
        }
        errors++;
    }
    if (data.codebook === undefined) {
        const err1 = { instancePath, schemaPath: "#/required", keyword: "required", params: { missingProperty: "codebook" }, message: "must have required property '" + "codebook" + "'" };
        if (vErrors === null) {
            vErrors = [err1];
        }
        else {
            vErrors.push(err1);
        }
        errors++;
    }
    for (const key0 in data) {
        if (!(((((((key0 === "name") || (key0 === "description")) || (key0 === "lastModified")) || (key0 === "schemaVersion")) || (key0 === "codebook")) || (key0 === "assetManifest")) || (key0 === "stages"))) {
            const err2 = { instancePath, schemaPath: "#/additionalProperties", keyword: "additionalProperties", params: { additionalProperty: key0 }, message: "must NOT have additional properties" };
            if (vErrors === null) {
                vErrors = [err2];
            }
            else {
                vErrors.push(err2);
            }
            errors++;
        }
    }
    if (data.name !== undefined) {
        if (typeof data.name !== "string") {
            const err3 = { instancePath: instancePath + "/name", schemaPath: "#/properties/name/type", keyword: "type", params: { type: "string" }, message: "must be string" };
            if (vErrors === null) {
                vErrors = [err3];
            }
            else {
                vErrors.push(err3);
            }
            errors++;
        }
    }
    if (data.description !== undefined) {
        if (typeof data.description !== "string") {
            const err4 = { instancePath: instancePath + "/description", schemaPath: "#/properties/description/type", keyword: "type", params: { type: "string" }, message: "must be string" };
            if (vErrors === null) {
                vErrors = [err4];
            }
            else {
                vErrors.push(err4);
            }
            errors++;
        }
    }
    if (data.lastModified !== undefined) {
        let data2 = data.lastModified;
        if (typeof data2 === "string") {
            if (!(formats0.test(data2))) {
                const err5 = { instancePath: instancePath + "/lastModified", schemaPath: "#/properties/lastModified/format", keyword: "format", params: { format: "date-time" }, message: "must match format \"" + "date-time" + "\"" };
                if (vErrors === null) {
                    vErrors = [err5];
                }
                else {
                    vErrors.push(err5);
                }
                errors++;
            }
        }
        else {
            const err6 = { instancePath: instancePath + "/lastModified", schemaPath: "#/properties/lastModified/type", keyword: "type", params: { type: "string" }, message: "must be string" };
            if (vErrors === null) {
                vErrors = [err6];
            }
            else {
                vErrors.push(err6);
            }
            errors++;
        }
    }
    if (data.schemaVersion !== undefined) {
        if (typeof data.schemaVersion !== "string") {
            const err7 = { instancePath: instancePath + "/schemaVersion", schemaPath: "#/properties/schemaVersion/type", keyword: "type", params: { type: "string" }, message: "must be string" };
            if (vErrors === null) {
                vErrors = [err7];
            }
            else {
                vErrors.push(err7);
            }
            errors++;
        }
    }
    if (data.codebook !== undefined) {
        if (!(validate12(data.codebook, { instancePath: instancePath + "/codebook", parentData: data, parentDataProperty: "codebook", rootData }))) {
            vErrors = vErrors === null ? validate12.errors : vErrors.concat(validate12.errors);
            errors = vErrors.length;
        }
    }
    if (data.assetManifest !== undefined) {
        let data5 = data.assetManifest;
        if (!(data5 && typeof data5 == "object" && !Array.isArray(data5))) {
            const err8 = { instancePath: instancePath + "/assetManifest", schemaPath: "#/definitions/AssetManifest/type", keyword: "type", params: { type: "object" }, message: "must be object" };
            if (vErrors === null) {
                vErrors = [err8];
            }
            else {
                vErrors.push(err8);
            }
            errors++;
        }
    }
    if (data.stages !== undefined) {
        let data6 = data.stages;
        if (Array.isArray(data6)) {
            if (data6.length < 1) {
                const err9 = { instancePath: instancePath + "/stages", schemaPath: "#/properties/stages/minItems", keyword: "minItems", params: { limit: 1 }, message: "must NOT have fewer than 1 items" };
                if (vErrors === null) {
                    vErrors = [err9];
                }
                else {
                    vErrors.push(err9);
                }
                errors++;
            }
            const len0 = data6.length;
            for (let i0 = 0; i0 < len0; i0++) {
                if (!(validate34(data6[i0], { instancePath: instancePath + "/stages/" + i0, parentData: data6, parentDataProperty: i0, rootData }))) {
                    vErrors = vErrors === null ? validate34.errors : vErrors.concat(validate34.errors);
                    errors = vErrors.length;
                }
            }
        }
        else {
            const err10 = { instancePath: instancePath + "/stages", schemaPath: "#/properties/stages/type", keyword: "type", params: { type: "array" }, message: "must be array" };
            if (vErrors === null) {
                vErrors = [err10];
            }
            else {
                vErrors.push(err10);
            }
            errors++;
        }
    }
}
else {
    const err11 = { instancePath, schemaPath: "#/type", keyword: "type", params: { type: "object" }, message: "must be object" };
    if (vErrors === null) {
        vErrors = [err11];
    }
    else {
        vErrors.push(err11);
    }
    errors++;
} validate11.errors = vErrors; return errors === 0; }
function validate10(data, { instancePath = "", parentData, parentDataProperty, rootData = data } = {}) { let vErrors = null; let errors = 0; if (!(validate11(data, { instancePath, parentData, parentDataProperty, rootData }))) {
    vErrors = vErrors === null ? validate11.errors : vErrors.concat(validate11.errors);
    errors = vErrors.length;
} validate10.errors = vErrors; return errors === 0; }
