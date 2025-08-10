import { formsConfig } from '@/config/formsConfig';


export function buildFormUrl(
  entity: keyof typeof formsConfig,
  mode: 'create' | 'update',
  extraParams: Record<string, string | number> = {},

) {
  const form = formsConfig[entity];
  if (!form) {
    throw new Error(`Form config for entity "${entity}" not found`);
  }

  const modeConfig = form[mode];
  const params = new URLSearchParams({
    schemaName: form.schemaName,
    alias: modeConfig.alias,
    submitText: modeConfig.title,
    successMessage: modeConfig.successMessage,
    errorMessage: modeConfig.errorMessage,
    title: modeConfig.title,
    // If the mode is 'update', we need to include the fetchAlias
    ...(mode === 'update' && 'fetchAlias' in modeConfig ? { fetchAlias: modeConfig.fetchAlias } : {}),
    ...Object.fromEntries(Object.entries(extraParams).map(([k, v]) => [k, String(v)])),
  }).toString();

  return `/dashboard/${entity}-${mode}?${params}`;
}


export function buildDetailsUrl(
  // id: string,
  entity: keyof typeof formsConfig,
  extraParams: Record<string, string | number> = {},
) {
  const form = formsConfig[entity];
  if (!form) {
    throw new Error(`Form config for entity ${entity} not found`);
  }
  const modeConfig = form['viewDetial'];
  const params = new URLSearchParams({
    schemaName: form.schemaName,
    alias: modeConfig.alias,
    title: modeConfig.title,
    restoreAlias: modeConfig.restoreAlias,
    hardDeleteAlias: modeConfig.hardDeleteAlias,
    fields: modeConfig.fields.join(','),
    mode:"view",
    ...Object.fromEntries(Object.entries(extraParams).map(([k, v]) => [k, String(v)])),
  }).toString();

  return `/dashboard/${entity}-view-details?${params}`;
}
