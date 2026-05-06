import { readFileSync, writeFileSync } from 'fs';

const data = JSON.parse(readFileSync('data/countries.json', 'utf-8'));

// Patterns d'événements génériques à supprimer
const genericPatterns = [
  /fête nationale ou commémoration fondatrice/i,
  /naissance ou consolidation de l'état contemporain/i,
  /reconnaissance internationale par l'onu/i,
  /entrée dans la coopération culturelle internationale de l'unesco/i,
  /entrée dans le système de financement de la banque mondiale/i,
  /intégration au système monétaire international \(fmi\)/i,
  /accès au programme international d'aide au développement \(ida\)/i,
  /accès au mécanisme international de garantie des investissements \(miga\)/i,
  /ouverture au financement international du secteur privé \(ifc\)/i,
  /jalon majeur de l'histoire politique contemporaine/i,
  /reconnaissance durable de la souveraineté nationale/i,
  /ancrage culturel international/i,
  /construction institutionnelle moderne/i,
  /mise en circulation de l'euro/i,
];

let totalBefore = 0;
let totalAfter = 0;

const cleaned = data.map(country => {
  const before = country.events.length;
  totalBefore += before;

  const filtered = country.events.filter(event => {
    return !genericPatterns.some(pattern => pattern.test(event.name));
  });

  totalAfter += filtered.length;

  return { ...country, events: filtered };
});

// Supprimer les pays sans événements
const withEvents = cleaned.filter(c => c.events.length > 0);

console.log(`Événements avant : ${totalBefore}`);
console.log(`Événements après : ${totalAfter}`);
console.log(`Supprimés : ${totalBefore - totalAfter}`);
console.log(`Pays avant : ${data.length}, après : ${withEvents.length}`);

writeFileSync('data/countries.json', JSON.stringify(withEvents, null, 2), 'utf-8');
console.log('✅ countries.json nettoyé');
