const text = (label, extra = {}) => ({ kind: 'text', label, default: '', ...extra });
const num = (label, extra = {}) => ({ kind: 'number', label, default: 0, min: 0, ...extra });
const obj = (label, fields) => ({ kind: 'object', label, fields });
const arr = (label, item) => ({ kind: 'array', label, item, default: [] });
const choice = (label, options) => text(label, { options });
const relation = (label, source, field) => text(label, { source, field });
const flag = label => ({ kind: 'boolean', label, default: false });
const technical = obj('Notes techniques — vide si non évalué', Object.fromEntries([
  ['defense', 'Défense'], ['passe', 'Passe'], ['dribble', 'Dribble'], ['tir', 'Tir'], ['offense', 'Attaque'], ['position', 'Placement']
].map(([key,label]) => [key, num(label, { nullable: true, default: null, max: 100 })])));
const goal = obj('But', { time: text('Temps du but (minute:seconde)', { default: '0:00' }), scorer: relation('Buteur', 'players', 'name'), assist: relation('Passeur (facultatif)', 'players', 'name') });
const performance = obj('Performance', { name: relation('Joueur', 'players', 'name'), note: num('Note du match', { nullable: true, default: null, max: 10 }), defenses: num('Défenses', { integer: true }), dribbles: num('Dribbles', { integer: true }) });
const tier = arr('Paliers de titres', { kind: 'tuple', label: 'Palier', items: [num('Seuil'), text('Titre')] });
export const schemas = {
  players: arr('Joueurs', obj('Joueur', { name: text('Nom', { required: true, identity: true }), discordId: text('Identifiant Discord', { discord: true }), club: relation('Club ou retraite', 'clubsAndGroups', 'key'), folder: text('Dossier de profil', { default: 'nouveaux', slug: true }), position: choice('Poste', ['CF','LW','RW','LM','RM','GK','CB','CM']), baseValue: num('Valeur de départ (¥)'), avatarPath: text('Image de secours', { default: 'images/clubs_icon/placeholder.png', path: true }), character: relation('Personnage', 'characters', 'name'), Ult: flag('Titre ultime débloqué'), technical })),
  clubs: arr('Clubs', obj('Club', { key: text('Identifiant', { required: true, slug: true }), name: text('Nom', { required: true, identity: true }), shortName: text('Nom court'), fullName: text('Nom complet'), logoPath: text('Image du logo', { path: true }), className: text('Classe du club', { slug: true }), color: text('Couleur', { color: true, default: '#63e7ff' }), style: text('Style de jeu', { multiline: true }) })),
  characters: arr('Personnages et ultimes', obj('Personnage', { id: text('Identifiant', { required: true, slug: true }), name: text('Nom', { required: true, identity: true }), edition: text('Édition'), rarity: choice('Rareté', ['commun','rare','legendary','mythical','worldclass','mastery']), rarityLabel: text('Libellé de rareté'), difficulty: num('Difficulté', { max: 5, integer: true }), ultimate: text('Titre ultime', { required: true }), description: text('Description', { multiline: true }), conditions: arr('Conditions du titre', text('Condition')), available: { ...flag('Disponible'), default: true }, imagePath: text('Image (facultatif)', { path: true }) })),
  matches: arr('Matchs', obj('Match', { id: text('Identifiant du match', { required: true, slug: true }), date: text('Date', { date: true }), time: text('Heure', { default: '20:00' }), category: choice('Compétition', ['amical','ligue','ncl']), valueTier: choice('Barème spécial (facultatif)', ['', 'third','finale']), season: relation('Saison', 'seasons', 'number'), home: relation('Club à domicile', 'clubs', 'key'), away: relation('Club à l’extérieur', 'clubs', 'key'), videoUrl: text('Lien vidéo (facultatif)', { url: true }), timelineHome: arr('Buts à domicile', goal), timelineAway: arr('Buts à l’extérieur', goal), notesHome: arr('Performances à domicile', performance), notesAway: arr('Performances à l’extérieur', performance) })),
  seasons: arr('Saisons', obj('Saison', { id: text('Identifiant', { required: true, slug: true }), number: num('Numéro', { min: 1, integer: true }), status: choice('État', ['active','finished']), startDate: text('Début', { date: true }), endDate: text('Fin (facultatif)', { date: true, nullable: true }), expectedMatches: num('Nombre de matchs prévus', { integer: true }), rewards: arr('Récompenses', obj('Récompense', { code: choice('Trophée', ['GLD','NCL','PUS','BDO','LIG']), label: text('Libellé'), value: text('Vainqueur', { default: 'NON ATTRIBUÉ' }) })) })),
  leagueSchedule: arr('Calendrier de ligue', { kind: 'tuple', label: 'Rencontre', items: [text('Date', { date: true }), relation('Domicile', 'clubs', 'key'), relation('Extérieur', 'clubs', 'key')] }),
  nclSchedule: arr('Calendrier NCL', { kind: 'tuple', label: 'Tour', items: [text('Date', { date: true }), text('Tour')] }),
  nclQualifiedCount: num('Clubs qualifiés en NCL', { options: [4,8], default: 4 }),
  nclSeasonNumber: num('Saison du calendrier', { min: 1, integer: true, default: 1 }),
  technicalTitleRules: arr('Titres techniques', obj('Titre', { metric: choice('Statistique', ['defense','passe','dribble','tir','offense','position','global']), name: text('Nom du titre', { required: true }), threshold: num('Seuil', { max: 100 }), requirement: text('Condition affichée'), code: text('Code', { slug: true }), accent: text('Couleur', { color: true, default: '#63e7ff' }), priority: num('Priorité') })),
  careerTitleTracks: arr('Titres de carrière', obj('Famille', { metric: choice('Statistique', ['goals','assists','defensive','dribbles']), aliases: arr('Libellés reconnus', text('Libellé')), code: text('Code', { slug: true }), accent: text('Couleur', { color: true, default: '#63e7ff' }), unit: text('Unité'), titles: tier })),
  valueTitleTrack: obj('Titres de valeur', { metric: text('Statistique', { default: 'value' }), code: text('Code', { default: 'VAL', slug: true }), accent: text('Couleur', { color: true, default: '#ffd84d' }), unit: text('Unité', { default: '¥' }), titles: tier }),
  marketValueActions: arr('Valeurs par action', obj('Action', { key: text('Identifiant', { slug: true, required: true }), metric: text('Statistique', { required: true, slug: true }), code: text('Code', { slug: true }), label: text('Libellé'), base: num('Valeur de base', { min: -1000000000 }) })),
  marketValueTiers: arr('Barèmes de matchs', obj('Barème', { key: text('Identifiant', { slug: true, required: true }), label: text('Libellé'), shortLabel: text('Libellé court'), multiplier: num('Multiplicateur'), victory: num('Bonus victoire') })),
  marketValueBonuses: arr('Bonus de trophées', obj('Bonus', { code: text('Code', { slug: true, required: true }), label: text('Libellé'), value: num('Valeur') }))
};
export function emptyValue(schema) {
  if (schema.kind === 'object') return Object.fromEntries(Object.entries(schema.fields).map(([key,field]) => [key, emptyValue(field)]));
  if (schema.kind === 'tuple') return schema.items.map(emptyValue);
  return schema.default ?? (schema.options?.[0] ?? '');
}
export function validateField(value, schema, path = schema.label) {
  const fail = message => { throw Error(`${path} : ${message}`); };
  if (value === null || value === undefined || value === '') {
    if (schema.required) fail('champ obligatoire');
    if (schema.nullable || schema.kind === 'text') return;
  }
  if (schema.kind === 'array') { if (!Array.isArray(value) || value.length > 5000) fail('liste invalide'); value.forEach((item,index) => validateField(item,schema.item,`${path} ${index+1}`)); return; }
  if (schema.kind === 'tuple') { if (!Array.isArray(value) || value.length !== schema.items.length) fail('ligne invalide'); schema.items.forEach((field,index) => validateField(value[index],field,`${path} / ${field.label}`)); return; }
  if (schema.kind === 'object') { if (!value || typeof value !== 'object' || Array.isArray(value)) fail('fiche invalide'); for (const [key,field] of Object.entries(schema.fields)) validateField(value[key],field,`${path} / ${field.label}`); return; }
  if (schema.kind === 'boolean') { if (typeof value !== 'boolean' && value !== undefined) fail('case invalide'); return; }
  if (schema.kind === 'number') { if (!Number.isFinite(value) || value < (schema.min ?? -Infinity) || value > (schema.max ?? Infinity) || (schema.integer && !Number.isInteger(value))) fail('nombre hors limites'); }
  else if (typeof value !== 'string' && !(schema.source && typeof value === 'number')) fail('texte invalide');
  if (typeof value === 'string') {
    if (value.length > 4000 || /[<>]/.test(value)) fail('texte trop long ou balises HTML interdites');
    if (schema.identity && /["\\/]/.test(value)) fail('nom invalide');
    if (schema.slug && !/^[a-zA-Z0-9_-]+$/.test(value)) fail('lettres, chiffres, tirets uniquement');
    if (schema.discord && !/^\d{17,20}$/.test(value)) fail('identifiant Discord invalide');
    if (schema.color && !/^#[0-9a-fA-F]{6}([0-9a-fA-F]{2})?$/.test(value)) fail('couleur hexadécimale attendue');
    if (schema.date && (!/^\d{4}-\d{2}-\d{2}$/.test(value) || new Date(value).toISOString().slice(0,10) !== value)) fail('date invalide');
    if ((schema.url || schema.path) && value) {
      if (/["'`\\]/.test(value)) fail('adresse ou chemin invalide');
      if (schema.path && !value.startsWith('https:')) { if (!/^[\w./ -]+$/.test(value) || value.startsWith('/') || value.split('/').includes('..')) fail('chemin d’image invalide'); }
      else { let url; try { url = new URL(value); } catch { fail('adresse invalide'); } if (url.protocol !== 'https:') fail('adresse HTTPS attendue'); }
    }
  }
  if (schema.options && !schema.options.includes(value)) fail('choix invalide');
}
export function validateLeague(data) {
  if (!data.characters?.length) throw Error('Conserve au moins un personnage dans le catalogue.');
  const unique = (rows, field, label) => { const values = rows.map(row=>String(row[field])); if (new Set(values).size !== values.length) throw Error(`${label} : identifiants en double.`); };
  for (const [key,schema] of Object.entries(schemas)) if (key in data) validateField(data[key],schema);
  for (const [key,field] of [['players','name'],['clubs','key'],['characters','id'],['matches','id'],['seasons','id'],['seasons','number']]) unique(data[key] || [],field,key);
  const ids=(data.players || []).map(p=>p.discordId).filter(Boolean); if (new Set(ids).size !== ids.length) throw Error('Un compte Discord ne peut être associé qu’à un joueur.');
  const clubs = new Set(data.clubs.map(c=>c.key)), players = new Set(data.players.map(p=>p.name)), seasons = new Set(data.seasons.map(s=>Number(s.number)));
  if (data.seasons.filter(s=>s.status==='active').length > 1) throw Error('Une seule saison peut être active.');
  for (const season of data.seasons) if (season.endDate && season.endDate < season.startDate) throw Error('La fin de saison doit suivre son début.');
  for (const player of data.players) if (!clubs.has(player.club) && !(player.club in data.groups)) throw Error(`Club inconnu pour ${player.name}.`);
  for (const row of data.leagueSchedule) if (!clubs.has(row[1]) || !clubs.has(row[2]) || row[1]===row[2]) throw Error('Rencontre de calendrier invalide.');
  for (const match of data.matches) {
    if (!match.date || !/^([01]\d|2[0-3]):[0-5]\d$/.test(match.time)) throw Error('Date ou heure de match invalide.');
    if (!clubs.has(match.home)||!clubs.has(match.away)||match.home===match.away||!seasons.has(Number(match.season))) throw Error(`Match ${match.id} : clubs ou saison invalides.`);
    for (const side of ['Home','Away']) {
      if (match['score'+side] !== match['timeline'+side].length || match['score'+side] !== match['scorers'+side].reduce((sum,p)=>sum+p.count,0)) throw Error('Les buts et le score doivent correspondre.');
      for (const goal of match['timeline'+side]) {
        if (!players.has(goal.scorer) || (goal.assist && (!players.has(goal.assist)||goal.assist===goal.scorer))) throw Error('Buteur ou passeur invalide.');
        const clock = goal.time.match(/^(\d{1,2})'(\d{2})"$/); if (!clock || Number(clock[2])>59 || Number(clock[1])*60+Number(clock[2])>720) throw Error('Temps de but invalide (match de 12 minutes).');
      }
      const notes=match['notes'+side]; unique(notes,'name','Performances'); for (const note of notes) if (!players.has(note.name)) throw Error('Joueur de performance inconnu.');
    }
  }
}
export function normalizeCollection(key, value, data) {
  value = structuredClone(value);
  if (key === 'matches') for (const match of value) {
    match.season = Number(match.season); match.valueTier ||= null; match.videoUrl ||= null;
    for (const side of ['Home','Away']) {
      const goals=match['timeline'+side]; const counts={};
      for (const goal of goals) { const clock=goal.time.match(/^(\d{1,2}):(\d{2})$/); if(clock)goal.time=`${clock[1]}'${clock[2]}"`; counts[goal.scorer]=(counts[goal.scorer]||0)+1; }
      match['score'+side]=goals.length; match['scorers'+side]=Object.entries(counts).map(([name,count])=>({name,count}));
    }
  }
  if(key==='seasons') for(const season of value) {
    season.endDate ||= null;
    const before=data.seasons.find(s=>s.id===season.id);
    if(season.status==='finished') {
      if(before?.status==='finished') season.technicalSnapshots=structuredClone(before.technicalSnapshots || {});
      else season.technicalSnapshots=Object.fromEntries(data.players.map(p=>{ const technical=structuredClone(p.technical); const ratings=['defense','passe','dribble','tir','offense','position'].map(key=>technical?.[key]); return [p.name, technical ? { ...technical, global: ratings.every(Number.isFinite) ? Math.round(ratings.reduce((a,b)=>a+b,0)/6) : null } : null]; }));
    } else season.technicalSnapshots={};
  }
  return value;
}
