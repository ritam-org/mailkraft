import { ParsedRET } from './types.js';
import { resolveNestedValue, normalizeToArray, split } from './utils.js';

export function parseRET(content: string): ParsedRET {
    const sections = split(content);

    const meta = JSON.parse(sections.JSON);
    const html = sections.HTML.trim();
    const text = sections.TEXT.trim();

    return { meta, html, text };
}

export function replaceVars(template: string, vars: Record<string, any>, preserveMissing?: boolean): string {
    // Process loops first: {{#for item in collection}}...{{/for}}
    template = template.replace(/{{#for\s+(\w+)\s+in\s+([\w.]+)}}([\s\S]*?){{\/for}}/g, (_, itemName, collectionPath, loopContent) => {
        const collection = resolveNestedValue(vars, collectionPath);
        
        if (!collection) {
            return preserveMissing ? `{{#for ${itemName} in ${collectionPath}}}${loopContent}{{/for}}` : '';
        }

        const items = normalizeToArray(collection);
        if (items.length === 0) return '';

        return items.map(item => {
            const newVars = { ...vars, [itemName]: item };
            return replaceVars(loopContent, newVars, preserveMissing);
        }).join('');
    });

    // Process conditionals: {{#if condition}}...{{/if}}
    template = template.replace(/{{#if\s+([\w.]+)}}([\s\S]*?){{\/if}}/g, (_, key, content) => {
        const value = resolveNestedValue(vars, key);
        return value ? replaceVars(content, vars, preserveMissing) : '';
    });

    // Process variables last
    template = template.replace(/{{\s*([\w.]+)\s*}}/g, (_, key) => {
        const value = resolveNestedValue(vars, key);
        if (value === undefined || value === null) {
            return preserveMissing ? `{{${key}}}` : '';
        }
        return String(value);
    });

    return template;
}