import sanitizeHtml from 'sanitize-html';

type SectionMap = { JSON: string; HTML: string; TEXT: string };

export function split(content: string): SectionMap {
    const parts = content.split(/---(JSON|HTML|TEXT)---/).map(part => part.trim());

    const sections: Partial<SectionMap> = {};

    for (let i = 1; i < parts.length; i += 2) {
        const key = parts[i] as keyof SectionMap;
        const value = parts[i + 1];
        sections[key] = value;
    }

    if (!sections.JSON || !sections.HTML || !sections.TEXT) {
        throw new Error('Invalid .ret format: Missing one or more sections');
    }

    return sections as SectionMap;
}

// Helper function to safely resolve path
export function resolveNestedValue(obj: any, path: string): any {
    return path.split('.').reduce((acc, part) => {
        if (acc === null || acc === undefined) return undefined;
        return acc[part];
    }, obj);
}

// Helper function to normalize collections
export function normalizeToArray(collection: any): any[] {
    if (Array.isArray(collection)) return collection;
    if (collection && typeof collection === 'object') {
        return Object.keys(collection)
            .filter(key => !isNaN(Number(key)))
            .map(key => collection[key]);
    }
    return [];
}

export function sanitize(data: Record<string, any>, allowed: string[]): Record<string, any> {
    const sanitized: Record<string, any> = {};

    for (const key in data) {
        if (typeof data[key] === 'string') {
            sanitized[key] = sanitizeHtml(data[key], {
                allowedTags: allowed,
                allowedAttributes: {}
            });
        } else if (typeof data[key] === 'object' && data[key] !== null) {
            sanitized[key] = sanitize(data[key], allowed);
        } else {
            sanitized[key] = data[key];
        }
    }

    return sanitized;
}