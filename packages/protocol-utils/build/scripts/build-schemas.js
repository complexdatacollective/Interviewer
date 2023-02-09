import { readdir, readJson, writeFile } from 'node:fs/promises';
import { extname, basename, join, resolve } from 'node:path';
import Ajv from "ajv"
import standaloneCode from 'ajv/dist/standalone';

const ajv = new Ajv({ sourceCode: true, allErrors: true });

ajv.addFormat('integer', /\d+/);

const isJsonFile = fileName => extname(fileName) === '.json';

const getBaseName = schemaFileName => basename(schemaFileName, '.json');

const asVariableName = schemaName => `version_${schemaName.replace(/\./g, '_')}`;

const asIntName = (schemaName) => {
    if (isNaN(parseInt(schemaName, 10))) {
        throw Error('Schema version could not be converted to integer');
    }
    return parseInt(schemaName, 10);
};


/**
 * Helper function to generate the index.js file for the schemas directory
 * containing the ES6 module exports for each schema.
 * @param {*} schemas 
 * @returns 
 */
const generateModuleIndex = async (schemas, outputPath) => {
    const formatRequire = (baseSchemaName) => {
        const relativeModulePath = join(`./${baseSchemaName}.js`);
        return `const ${asVariableName(baseSchemaName)} = require('./${relativeModulePath}');`;
    };

    const formatVersions = baseSchemaName => `  { version: ${asIntName(baseSchemaName)}, validator: ${asVariableName(baseSchemaName)} },`;

    const schemaRequires = schemas.map(formatRequire).join('\n');
    const schemaVersions = `${schemas.map(formatVersions).join('\n')}`;
    const output = `${schemaRequires}

const versions = [
${schemaVersions}
];

module.exports = versions;
\r\n`;

    const moduleIndexPath = join(outputPath, 'index.js');
    await writeFile(moduleIndexPath, output);
};

/**
 * Compile 
 */

const defaultPath = resolve('schemas');

const buildSchemas = async (sourcePath = defaultPath, outputPath = defaultPath) => {
    // Get the baseName of all JSON files in the supplied directory
    const schemas = await readdir(sourcePath).filter(isJsonFile).map(getBaseName);

    // If no schemas are found, exit
    if (schemas.length === 0) {
        console.log('No schemas found.');
        return;
    }

    await schemas.map((schema) => buildSchema(schema, sourcePath, outputPath));
    await generateModuleIndex(schemas, outputPath);
    console.log('All done.');
};

const buildSchema = async (schema, sourceDirectory, outputDirectory) => {
    const schemaPath = join(sourceDirectory, `${schema}.json`);
    const modulePath = join(outputDirectory, `${schema}.js`);

    const schema = await readJson(schemaPath);

    const validate = ajv.compile(schema);

    const moduleCode = standaloneCode(ajv, validate);

    await writeFile(modulePath, moduleCode);
    console.log(`${schema} done.`);
    return modulePath;
};

buildSchemas();
