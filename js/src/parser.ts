import { ParsedRET } from './types.js';
import { split } from './utils.js';

export function parseRET(content: string): ParsedRET {
    const sections = split(content);

    const meta = JSON.parse(sections.JSON);
    const html = sections.HTML.trim();
    const text = sections.TEXT.trim();

    return { meta, html, text };
}
