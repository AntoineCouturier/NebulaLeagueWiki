import ts from 'typescript';
import vm from 'node:vm';
export const keys = ['clubs', 'groups', 'players', 'matches', 'seasons', 'leagueSchedule', 'nclSchedule', 'nclQualifiedCount', 'nclSeasonNumber', 'technicalTitleRules','careerTitleTracks','valueTitleTrack','marketValueActions','marketValueTiers','marketValueBonuses'];
export function characterSource(source, mode='browser') {
  const parsed=ts.createSourceFile('titles.js',source,ts.ScriptTarget.Latest,true,ts.ScriptKind.JS);
  let value;
  function visit(node) { if(ts.isVariableDeclaration(node)&&node.name.getText(parsed)==='characters') value=node.initializer; ts.forEachChild(node,visit); }
  visit(parsed); if(!value)throw Error('Catalogue de personnages introuvable.');
  const original=value.getText(parsed);
  return mode==='seed'?vm.runInNewContext(`(${original})`,{}, {timeout:5000}):source.slice(0,value.getStart(parsed))+'window.NEBULA_BOOTSTRAP.characters'+source.slice(value.end);
}
export function transformData(source, mode = 'browser') {
  const parsed = ts.createSourceFile('nebula-data.js', source, ts.ScriptTarget.Latest, true, ts.ScriptKind.JS);
  const edits = [];
  function visit(node) {
    if (ts.isVariableDeclaration(node) && keys.includes(node.name.getText(parsed)) && node.initializer) {
      let value = node.initializer;
      if (['clubs', 'players'].includes(node.name.getText(parsed))) value = value.expression.expression;
      const name = node.name.getText(parsed), original = value.getText(parsed);
      const replacement = mode === 'seed' ? `(window.NEBULA_SOURCE.${name} = (${original}))` : `(window.NEBULA_BOOTSTRAP.${name})`;
      edits.push({ start: value.getStart(parsed), end: value.end, replacement });
    }
    ts.forEachChild(node, visit);
  }
  visit(parsed);
  if (edits.length !== keys.length) throw Error('Structure du registre de données inattendue.');
  for (const edit of edits.sort((a,b) => b.start-a.start)) source = source.slice(0, edit.start) + edit.replacement + source.slice(edit.end);
  return source;
}
export function extractSeed(source) {
  const window = { NEBULA_SOURCE: {}, dispatchEvent() {} };
  const context = { window, URL, console, CustomEvent: class {}, document: { currentScript: { src: 'https://nebula.invalid/JavaScript/nebula-data.js' }, querySelectorAll: () => [] }, localStorage: { getItem: () => null, setItem() {} }, fetch: async () => ({ ok: false }) };
  vm.runInNewContext(transformData(source, 'seed'), context, { timeout: 5000 });
  return JSON.parse(JSON.stringify(window.NEBULA_SOURCE));
}
