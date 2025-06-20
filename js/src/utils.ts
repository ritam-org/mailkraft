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

export function replaceVars(template: string, vars: Record<string, any>): string {
    return template.replace(/{{\s*([\w.]+)\s*}}/g, (_, key) => {
        const val = key.split('.').reduce((o: { [x: string]: any; }, k: string | number) => o?.[k], vars);
        return val !== undefined ? String(val) : '';
    });
}
