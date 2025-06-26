export function createPageUrl(pageName: string) {
    return '/' + pageName
      .replace(/([a-z])([A-Z])/g, '$1-$2') // separa camelCase/PascalCase com hífen
      .toLowerCase()
      .replace(/ /g, '-');
}