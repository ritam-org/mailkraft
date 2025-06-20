import path from "path";
import { fileURLToPath } from "url";
import { ParsedRET, RETMeta } from "./types";
import { readdirSync, readFileSync } from "fs";
import { parseRET } from "./parser";
import { replaceVars } from "./utils";

let TEMPLATE_DIR: string;
const isESM = typeof __filename === 'undefined';

if (isESM) {
    const __filenameESM = fileURLToPath(import.meta.url);
    const __dirnameESM = path.dirname(__filenameESM);
    TEMPLATE_DIR = path.resolve(__dirnameESM, 'templates');
} else {
    // @ts-ignore
    TEMPLATE_DIR = path.resolve(__dirname, 'templates');
}
/**
 * Generate email content using a template and data
 * 
 * @param {string} template - The name of the template or file path
 * @param {Record<string, any>} data - Data to replace in the template
 * @returns {Promise<{ html: string; text: string; meta: RETMeta }>} - Returns HTML, text, and metadata
 * 
 * @throws {Error} If the template is not found or cannot be parsed
 */
export function generate(
    template: string,
    data: Record<string, any>
): { html: string; text: string; meta: RETMeta } {

    let parsed: ParsedRET | undefined;

    const isFilePath = path.isAbsolute(template) || template.endsWith('.ret');

    if (isFilePath) {
        //if it is a template file, check if it exists, check if it is a valid file, and read it
        const templatePath = path.isAbsolute(template)
            ? template
            : path.join(TEMPLATE_DIR, template);

        const content = readFileSync(templatePath, 'utf-8');
        parsed = parseRET(content);
    } else {
        //it is a built in template, check if it exists in templates types
        const templatePath = path.join(TEMPLATE_DIR, `${template}.ret`);
        try {
            const content = readFileSync(templatePath, 'utf-8');
            parsed = parseRET(content);
        } catch (error) {
            throw new Error(`Template "${template}" not found in built-in templates.`);
        }
    }

    if (!parsed) {
        throw new Error(`Template "${template}" could not be parsed.`);
    }

    const html = replaceVars(parsed.html, data);
    const text = replaceVars(parsed.text, data);
    const meta = parsed.meta;

    return { html, text, meta };
}

/**
 * Get metadata from a template
 * 
 * @param {string} template - The name of the template or file path
 * @returns {Promise<RETMeta>} - Returns metadata of the template
 * @throws {Error} If the template is not found or cannot be parsed
 */
export function meta(
    template: string
): RETMeta {
    let parsed: ParsedRET | undefined;

    const isFilePath = path.isAbsolute(template) || template.endsWith('.ret');

    if (isFilePath) {
        const templatePath = path.isAbsolute(template)
            ? template
            : path.join(TEMPLATE_DIR, template);

        const content = readFileSync(templatePath, 'utf-8');
        parsed = parseRET(content);
    } else {
        const templatePath = path.join(TEMPLATE_DIR, `${template}.ret`);
        try {
            const content = readFileSync(templatePath, 'utf-8');
            parsed = parseRET(content);
        } catch (error) {
            throw new Error(`Template "${template}" not found in built-in templates.`);
        }
    }

    if (!parsed) {
        throw new Error(`Template "${template}" could not be parsed.`);
    }

    return parsed.meta;
}

export function list(): string[] {
    const files = readdirSync(TEMPLATE_DIR, { withFileTypes: true });
    const templates = files
        .filter(file => file.isFile() && file.name.endsWith('.ret'))
        .map(file => path.basename(file.name, '.ret'));

    return templates;
}