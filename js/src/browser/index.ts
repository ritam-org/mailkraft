// Uses string input instead of file paths
import { RETMeta } from "../types";
import { parseRET, replaceVars } from "../parser";
import { sanitize } from "../utils";

export function generate(templateContent: string, data: Record<string, any>, theme?: Record<string, any>) {
  const parsed = parseRET(templateContent);
  if (!parsed) throw new Error("Invalid RET template");

  data = sanitize(data, parsed.meta.allowed || []);
  
  let html = replaceVars(parsed.html, theme || {}, true);
  html = replaceVars(html, data);
  
  return {
    html,
    text: replaceVars(parsed.text, data),
    meta: parsed.meta
  };
}

export function meta(templateContent: string): RETMeta {
  const parsed = parseRET(templateContent);
  if (!parsed) throw new Error("Invalid RET template");
  return parsed.meta;
}