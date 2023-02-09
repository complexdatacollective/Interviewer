import { readdir, writeFile, readFile, access } from 'node:fs/promises';
import { extname, join, basename } from 'node:path';
import Ajv from "ajv";
import standaloneCode from "ajv/dist/standalone/index.js";

const ajv = new Ajv({
  allErrors: true,
  allowUnionTypes: true, // Lets us use type: [string, object]
  code: {
    esm: true,
    source: true, // ?
  }
});
ajv.addFormat('integer', /\d+/);
ajv.addFormat('date-time', /\d+/);

const readJson = async (path) => {
  const file = await readFile(path);
  return JSON.parse(file);
};

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
  console.log('Generating module index...');
  const formatRequire = (baseSchemaName) => {
    const relativeModulePath = join(`./${baseSchemaName}.js`);
    return `import ${asVariableName(baseSchemaName)} from './${relativeModulePath}';`;
  };

  const formatVersions = baseSchemaName => `  { version: ${asIntName(baseSchemaName)}, validator: ${asVariableName(baseSchemaName)} },`;

  const schemaRequires = schemas.map(formatRequire).join('\n');
  const schemaVersions = `${schemas.map(formatVersions).join('\n')}`;
  const output = `${schemaRequires}

const versions = [
${schemaVersions}
];

export default versions;
\r\n`;

  const moduleIndexPath = join(outputPath, 'index.js');
  await writeFile(moduleIndexPath, output);
  console.log('Finished generating module index.');
};

/**
 * Compile 
 */
export const buildSchemas = async (sourcePath, outputPath) => {
  // Check if the source directory exists
  try {
    await access(sourcePath);
  } catch (error) {
    console.log(`Source directory ${sourcePath} does not exist.`);
    process.exit(1);
  }

  // Check if the output directory exists
  try {
    await access(outputPath);
  } catch (error) {
    console.log(`Output directory ${outputPath} does not exist.`);
    process.exit(1);
  }

  const files = await readdir(sourcePath);
  const schemas = files.filter(isJsonFile).map(getBaseName)

  // If no schemas are found, exit
  if (schemas.length === 0) {
    console.log('No schemas found.');
    process.exit();
  }

  for (const schema of schemas) {
    const result = await buildSchema(schema, sourcePath, outputPath);
    if (!result) {
      console.log('Error building schema.', schema);
      process.exit(1);
    }
  }

  await generateModuleIndex(schemas, outputPath);
  console.log('All done.');
  process.exit();
};

export const buildSchema = async (schema, sourceDirectory, outputDirectory) => {
  const schemaPath = join(sourceDirectory, `${schema}.json`);
  const modulePath = join(outputDirectory, `${schema}.js`);

  console.log('Building schema:', schemaPath, '...');

  const schemaJson = await readJson(schemaPath);
  let validatedSchema;
  try {
    validatedSchema = await ajv.compile(schemaJson);
  } catch (e) {
    console.log('Error compiling schema.', schema);
    return false;
  }

  const moduleCode = standaloneCode(ajv, validatedSchema);
  await writeFile(modulePath, moduleCode);
  console.log(`...done.`);
  return modulePath;
};


