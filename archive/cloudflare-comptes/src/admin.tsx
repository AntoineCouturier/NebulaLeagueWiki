import { useEffect, useId, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { schemas as importedSchemas, emptyValue } from '../shared/admin-model.mjs';
type Field = { kind: string; label: string; fields?: Record<string,Field>; item?: Field; items?: Field[]; options?: (string|number)[]; source?: string; field?: string; nullable?: boolean; multiline?: boolean; date?: boolean; min?: number; max?: number; integer?: boolean; required?: boolean };
type Data = Record<string, any>;
type Collection = { data: any; revision: number };
const schemas=importedSchemas as unknown as Record<string,Field>;
async function api(path:string, options?:RequestInit) {
  const response=await fetch('/api/admin'+path,{credentials:'same-origin',cache:'no-store',signal:AbortSignal.timeout(15000),...options});
  const body=await response.json(); if(!response.ok)throw Error(body.error||'Impossible de terminer cette opération.'); return body;
}
function Editor({schema,value,change,data}:{schema:Field;value:any;change:(value:any)=>void;data:Data}) {
  const id=useId();
  if(schema.kind==='object') return <div className="manager-fields">{Object.entries(schema.fields!).map(([key,field])=><Editor key={key} schema={field} value={value?.[key]} change={next=>change({...value,[key]:next})} data={data}/>)}</div>;
  if(schema.kind==='tuple') return <div className="manager-fields">{schema.items!.map((field,index)=><Editor key={index} schema={field} value={value?.[index]} change={next=>{const copy=[...(value||[])];copy[index]=next;change(copy);}} data={data}/>)}</div>;
  if(schema.kind==='array') return <fieldset className="manager-array"><legend>{schema.label}</legend>{(value||[]).map((item:any,index:number)=><div className="manager-array-row" key={index}><div className="manager-row-head"><span>{schema.item!.label} {index+1}</span><button type="button" onClick={()=>change(value.filter((_:any,i:number)=>i!==index))}>Retirer</button></div><Editor schema={schema.item!} value={item} change={next=>change(value.map((old:any,i:number)=>i===index?next:old))} data={data}/></div>)}<button type="button" onClick={()=>change([...(value||[]),emptyValue(schema.item as never)])}>+ Ajouter {schema.item!.label.toLowerCase()}</button></fieldset>;
  if(schema.kind==='boolean') return <label className="manager-check"><input type="checkbox" checked={value??false} onChange={event=>change(event.target.checked)}/>{schema.label}</label>;
  let options=schema.options?.map(v=>({value:v,label:String(v)}));
  if(schema.source) {
    const rows=schema.source==='clubsAndGroups'?[...(data.clubs||[]),...Object.values(data.groups||{})]:(data[schema.source]||[]);
    options=rows.map((row:any)=>({value:row[schema.field!],label:row.name||`Saison ${row.number}`}));
  }
  if(options) {
    if(value!==undefined && value!==null && !options.some(o=>String(o.value)===String(value))) options=[{value,label:String(value)},...options];
    return <label htmlFor={id}>{schema.label}<select id={id} value={value??''} required={schema.required} onChange={event=>{const option=options!.find(o=>String(o.value)===event.target.value);change(option?.value??'');}}><option value="">— Sélectionner —</option>{options.filter(o=>o.value!=='').map((option,index)=><option key={index} value={option.value}>{option.label}</option>)}</select></label>;
  }
  return <label htmlFor={id}>{schema.label}{schema.multiline?<textarea id={id} value={value??''} rows={3} onChange={event=>change(event.target.value)}/>:<input id={id} value={value??''} type={schema.kind==='number'?'number':schema.date?'date':'text'} min={schema.min} max={schema.max} step={schema.integer?1:'any'} required={schema.required} onChange={event=>change(schema.kind==='number'?(event.target.value===''?null:Number(event.target.value)):event.target.value)}/>}</label>;
}
function labelOf(item:any,index:number) {return Array.isArray(item)?item.join(' · '):item?.name||item?.label||item?.id||item?.code||item?.metric||`Entrée ${index+1}`;}
function Administration() {
  const [collections,setCollections]=useState<Record<string,Collection>>({});
  const [selected,setSelected]=useState('matches'); const [index,setIndex]=useState<number|null>(null);
  const [draft,setDraft]=useState<any>(null); const [editing,setEditing]=useState(false); const [busy,setBusy]=useState(false);
  const [message,setMessage]=useState(''); const [allowed,setAllowed]=useState(false); const [loaded,setLoaded]=useState(false);
  const [history,setHistory]=useState<any[]>([]); const [showHistory,setShowHistory]=useState(false);
  const [members,setMembers]=useState<{id:string;name:string;avatar:string|null}[]>([]); const [next,setNext]=useState<string|null>(null); const [memberSearch,setMemberSearch]=useState(''); const [membersMessage,setMembersMessage]=useState('');
  const data=Object.fromEntries(Object.entries(collections).map(([key,value])=>[key,value.data]));
  const schema=schemas[selected], current=collections[selected];
  async function load() { try { const body=await api('');setCollections(body.collections);setAllowed(true); } catch(error) {setMessage((error as Error).message);}finally{setLoaded(true);} }
  useEffect(()=>{void load();},[]);
  useEffect(()=>{const prevent=(event:BeforeUnloadEvent)=>{if(editing){event.preventDefault();event.returnValue='';}};window.addEventListener('beforeunload',prevent);return()=>window.removeEventListener('beforeunload',prevent);},[editing]);
  const discard=()=>!editing||window.confirm('Quitter sans enregistrer cette fiche ?');
  function select(key:string) {if(!discard())return;setSelected(key);setEditing(false);setIndex(null);setDraft(null);setShowHistory(false);setMessage('');}
  function open(item:any,position:number|null) {if(!discard())return;setIndex(position);setDraft(structuredClone(item));setEditing(true);setMessage('');}
  async function save(value:any) {
    setBusy(true);setMessage('');
    try {const result=await api('/'+selected,{method:'PUT',headers:{'Content-Type':'application/json'},body:JSON.stringify({revision:current.revision,data:value})});setCollections(old=>({...old,[selected]:result}));setEditing(false);setDraft(null);setMessage('Enregistré. Les pages de la ligue utilisent maintenant ces données.');setShowHistory(false);}
    catch(error){setMessage((error as Error).message);}finally{setBusy(false);}
  }
  async function saveDraft(event:React.FormEvent) {event.preventDefault(); if(schema.kind==='array'){const rows=[...current.data]; if(index===null)rows.push(draft);else rows[index]=draft;await save(rows);}else await save(draft);}
  function create() {
    const item=emptyValue((schema.kind==='array'?schema.item:schema) as never) as any;
    if(selected==='matches'){item.id='m'+Date.now().toString(36);item.season=data.seasons.find((s:any)=>s.status==='active')?.number||1;item.category='ligue';}
    if(selected==='seasons'){item.number=Math.max(0,...data.seasons.map((s:any)=>s.number))+1;item.id='s'+item.number;item.status='active';item.rewards=['GLD','NCL','PUS','BDO'].map(code=>({code,label:{GLD:'Soulier d’Or',NCL:'Club gagnant NCL',PUS:'Prix Puskas',BDO:'Ballon d’Or'}[code],value:'NON ATTRIBUÉ'}));}
    open(item,null);
  }
  async function directory(after?:string) {
    setMembersMessage('Chargement…');try{const body=await api('/discord-members'+(after?'?after='+after:''));setMembers(old=>after?[...old,...body.members]:body.members);setNext(body.next);setMembersMessage(`${body.members.length} membres récupérés.`);}catch(error){setMembersMessage((error as Error).message);}
  }
  async function versions(){setMessage('');try{setHistory(await api('/history?collection='+selected));setShowHistory(true);}catch(error){setMessage((error as Error).message);}}
  async function restore(id:number){if(!discard())return;try{const old=await api('/history/'+id);if(window.confirm('Restaurer cette version ? La version actuelle restera dans l’historique.'))await save(old.data);}catch(error){setMessage((error as Error).message);}}
  if(!loaded)return <p>Vérification de ton accès…</p>;
  if(!allowed)return <section className="manager-lock"><h1>ADMINISTRATION</h1><p role="status">{message}</p><a className="account-primary" href="/compte.html">Ouvrir mon compte Discord</a></section>;
  return <>
    <header className="manager-heading"><p className="account-kicker">NEBULA // ADMINISTRATION</p><h1>GÉRER LA LIGUE</h1><p>Enregistre tes changements ici. Les matchs alimentent automatiquement les statistiques, valeurs et trophées.</p><div className="manager-summary"><span>{data.players?.length} joueurs</span><span>{data.matches?.length} matchs</span><span>{data.seasons?.length} saisons</span></div></header>
    <div className="manager-workspace"><nav className="manager-nav" aria-label="Rubriques de gestion">{Object.entries(schemas).map(([key,field])=><button type="button" aria-pressed={selected===key} key={key} onClick={()=>select(key)}>{field.label}</button>)}</nav>
    <section className="manager-content"><div className="manager-toolbar"><h2>{schema.label}</h2><button type="button" onClick={()=>void versions()}>Historique</button><button type="button" disabled={busy} onClick={()=>{if(discard()){setEditing(false);void load();}}}>Recharger</button></div>
    {message&&<p className="account-notice" role="status">{message}</p>}
    {showHistory&&<section className="manager-history"><h3>Versions précédentes</h3>{history.length?history.map(row=><div key={row.id}><span>{new Date(row.created_at).toLocaleString('fr-FR')} · version {row.revision}</span><button disabled={busy} onClick={()=>void restore(row.id)}>Restaurer</button></div>):<p>Aucune modification enregistrée pour le moment.</p>}</section>}
    {selected==='players'&&<section className="manager-directory"><h3>Membres du serveur Discord</h3><p>Choisis une personne pour créer sa fiche, ou associe-la à la fiche en cours. La connexion se fera ensuite avec son propre compte Discord.</p><button disabled={busy} onClick={()=>void directory()}>Charger les membres</button>{next&&<button onClick={()=>void directory(next)}>Charger la suite</button>}<p role="status">{membersMessage}</p>{members.length>0&&<><label>Rechercher un membre<input value={memberSearch} onChange={e=>setMemberSearch(e.target.value)}/></label><div className="manager-members">{members.filter(m=>(m.name+' '+m.id).toLowerCase().includes(memberSearch.toLowerCase())).map(member=><button key={member.id} onClick={()=>{if(editing)setDraft((old:any)=>({...old,discordId:member.id}));else open({...emptyValue(schemas.players.item as never) as object,name:member.name,discordId:member.id},null);}}><strong>{member.name}</strong><small>{member.id}</small></button>)}</div></>}</section>}
    {editing?<form onSubmit={event=>void saveDraft(event)} className="manager-form"><h3>{index===null?'Nouvelle entrée':'Modifier la fiche'}</h3>{selected==='matches'&&<p className="account-notice">Le score et les totaux des buteurs sont calculés depuis les buts saisis. Les notes laissées vides restent non évaluées.</p>}{selected==='seasons'&&<p className="account-notice">Terminer une saison archive les notes techniques actuelles des joueurs. Les trophées automatiques restent calculés depuis les résultats.</p>}<Editor schema={schema.kind==='array'?schema.item!:schema} value={draft} change={setDraft} data={data}/><div className="manager-save"><button className="account-primary" type="submit" disabled={busy}>{busy?'Enregistrement…':'Enregistrer dans la ligue'}</button><button type="button" onClick={()=>{if(discard()){setEditing(false);setDraft(null);}}}>Annuler</button></div></form>:schema.kind==='array'?<><button className="account-primary" onClick={create}>+ Ajouter une entrée</button><div className="manager-list">{current?.data.length?current.data.map((item:any,position:number)=><article key={position}><div><strong>{labelOf(item,position)}</strong>{selected==='matches'&&<small>{item.date} · {item.home} {item.scoreHome} — {item.scoreAway} {item.away}</small>}{selected==='players'&&<small>{item.club} · {item.discordId?'Discord associé':'Discord à associer'}</small>}</div><button disabled={busy} onClick={()=>open(item,position)}>Modifier</button><button disabled={busy} onClick={()=>{if(window.confirm('Retirer cette entrée ? Une copie sera conservée dans l’historique.'))void save(current.data.filter((_:any,i:number)=>i!==position));}}>Retirer</button></article>):<p>Aucune entrée pour le moment.</p>}</div></>:<><button className="account-primary" onClick={()=>open(current.data,0)}>Modifier les réglages</button><p>Les changements s’appliquent aux pages publiques après enregistrement.</p></>}
    </section></div>
  </>;
}
export function mountAdministration(){const root=document.getElementById('adminApp');if(root)createRoot(root).render(<Administration/>);}
