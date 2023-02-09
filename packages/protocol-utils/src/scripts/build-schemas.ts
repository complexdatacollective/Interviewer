import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildSchemas } from "../schemas/buildSchemas.js";

const defaultSourcePath = join(dirname(fileURLToPath(import.meta.url)), 'json');
const defaultOutputPath = join(dirname(fileURLToPath(import.meta.url)), 'compiled');

const sourcePath = process.argv[2] || defaultSourcePath;
const outputPath: string = process.argv[3] || defaultOutputPath;

const result = await buildSchemas(sourcePath, outputPath);
console.log(result);