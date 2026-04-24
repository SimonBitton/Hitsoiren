#!/usr/bin/env node

/**
 * Script to add more historical events to the main timeline
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const TIMELINE_FILE = path.join(__dirname, '../data/timeline.json');

// Additional historical events to add
const ADDITIONAL_EVENTS = [
  // Préhistoire
  {
    era: "prehist",
    major: false,
    date: "≈ 3 000 000 av. J.-C.",
    name: "Premiers outils en os et bois",
    context: "Début de l'utilisation d'outils plus sophistiqués en os et bois",
    people: "Australopithecus garhi",
    category: "Science",
    catSlug: "science"
  },
  {
    era: "prehist",
    major: false,
    date: "≈ 2 500 000 av. J.-C.",
    name: "Premières huttes en pierre",
    context: "Construction des premiers abris permanents par les hominidés",
    people: "",
    category: "Science",
    catSlug: "science"
  },
  {
    era: "prehist",
    major: false,
    date: "≈ 500 000 av. J.-C.",
    name: "Invention de la lance",
    context: "Premières armes de jet pour la chasse à distance",
    people: "Homo heidelbergensis",
    category: "Science",
    catSlug: "science"
  },
  {
    era: "prehist",
    major: false,
    date: "≈ 100 000 av. J.-C.",
    name: "Premières sépultures intentionnelles",
    context: "Dépôts funéraires avec offrandes, preuve de pensée symbolique",
    people: "Néandertaliens",
    category: "Culture",
    catSlug: "culture"
  },
  {
    era: "prehist",
    major: false,
    date: "≈ 30 000 av. J.-C.",
    name: "Vénus de Lespugue et autres statuettes",
    context: "Prolifération des représentations féminines en ivoire et pierre",
    people: "",
    category: "Culture",
    catSlug: "culture"
  },
  {
    era: "prehist",
    major: false,
    date: "≈ 12 000 av. J.-C.",
    name: "Göbekli Tepe — premier temple mégalithique",
    context: "Site cultuel avec piliers en T sculptés, antérieur à l'agriculture",
    people: "",
    category: "Culture",
    catSlug: "culture"
  },
  
  // Antiquité
  {
    era: "antiquite",
    major: false,
    date: "≈ 1 600 av. J.-C.",
    name: "Invention de l'alphabet phénicien",
    context: "Premier alphabet consonantique, ancêtre de tous les alphabets modernes",
    people: "Civilisation phénicienne",
    category: "Culture",
    catSlug: "culture"
  },
  {
    era: "antiquite",
    major: false,
    date: "≈ 753 av. J.-C.",
    name: "Fondation de Rome selon la légende",
    context: "Romulus et Rémus, la louve, fondation de la Ville éternelle",
    people: "Romulus (légendaire)",
    category: "Culture",
    catSlug: "culture"
  },
  {
    era: "antiquite",
    major: false,
    date: "≈ 490 av. J.-C.",
    name: "Bataille de Marathon — course du messager",
    context: "Le messager Philippidès parcourt 42 km pour annoncer la victoire",
    people: "Miltiade, Darios Ier",
    category: "Politique",
    catSlug: "politique"
  },
  {
    era: "antiquite",
    major: false,
    date: "≈ 430 av. J.-C.",
    name: "Peste d'Athènes pendant la guerre du Péloponnèse",
    context: "Épidémie qui décime un tiers de la population athénienne",
    people: "Thucydide (témoin)",
    category: "Science",
    catSlug: "science"
  },
  {
    era: "antiquite",
    major: false,
    date: "216 av. J.-C.",
    name: "Bataille de Cannes — plus grande victoire d'Hannibal",
    context: "Encerclement et destruction de l'armée romaine par Hannibal",
    people: "Hannibal Barca",
    category: "Politique",
    catSlug: "politique"
  },
  {
    era: "antiquite",
    major: false,
    date: "44 av. J.-C.",
    name: "Adoption d'Octave par Jules César",
    context: "Testament de César faisant d'Octave son fils et héritier",
    people: "Jules César, Octave",
    category: "Politique",
    catSlug: "politique"
  },
  {
    era: "antiquite",
    major: false,
    date: "64",
    name: "Grand incendie de Rome sous Néron",
    context: "Incendie qui détruit la moitié de Rome, persécution des chrétiens",
    people: "Néron",
    category: "Politique",
    catSlug: "politique"
  },
  {
    era: "antiquite",
    major: false,
    date: "117",
    name: "Mort de Trajan — Empire romain à son apogée",
    context: "L'Empire romain atteint sa plus grande extension territoriale",
    people: "Trajan, Hadrien",
    category: "Politique",
    catSlug: "politique"
  },
  
  // Moyen Âge
  {
    era: "moyen-age",
    major: false,
    date: "1066",
    name: "Conquête normande de l'Angleterre",
    context: "Guillaume le Conquérant devient roi d'Angleterre après Hastings",
    people: "Guillaume le Conquérant, Harold II",
    category: "Politique",
    catSlug: "politique"
  },
  {
    era: "moyen-age",
    major: false,
    date: "1095",
    name: "Appel de Clermont — première croisade",
    context: "Le pape Urbain II appelle à la croisade pour libérer Jérusalem",
    people: "Urbain II",
    category: "Politique",
    catSlug: "politique"
  },
  {
    era: "moyen-age",
    major: false,
    date: "1187",
    name: "Prise de Jérusalem par Saladin",
    context: "Saladin reprend Jérusalem aux croisés après la bataille de Hattin",
    people: "Saladin, Guy de Lusignan",
    category: "Politique",
    catSlug: "politique"
  },
  {
    era: "moyen-age",
    major: false,
    date: "1204",
    name: "Sac de Constantinople par les Croisés",
    context: "La quatrième croisade détourne vers Constantinople et la pille",
    people: "Baudouin IX de Flandre, Enrico Dandolo",
    category: "Politique",
    catSlug: "politique"
  },
  {
    era: "moyen-age",
    major: false,
    date: "1347–1351",
    name: "Peste noire — pandémie dévastatrice",
    context: "La peste bubonique tue 30 à 60% de la population européenne",
    people: "",
    category: "Science",
    catSlug: "science"
  },
  {
    era: "moyen-age",
    major: false,
    date: "1431",
    name: "Mort de Jeanne d'Arc sur le bûcher",
    context: "La Pucelle d'Orléans est brûlée vive à Rouen pour hérésie",
    people: "Jeanne d'Arc",
    category: "Politique",
    catSlug: "politique"
  },
  
  // Temps Modernes
  {
    era: "modernes",
    major: false,
    date: "1498",
    name: "Vasco de Gama atteint l'Inde par la mer",
    context: "Première liaison maritime Europe-Inde par le cap de Bonne-Espérance",
    people: "Vasco de Gama",
    category: "Exploration",
    catSlug: "exploration"
  },
  {
    era: "modernes",
    major: false,
    date: "1517",
    name: "Martin Luther affiche ses 95 thèses",
    context: "Début de la Réforme protestante contre les indulgences",
    people: "Martin Luther",
    category: "Culture",
    catSlug: "culture"
  },
  {
    era: "modernes",
    major: false,
    date: "1519–1522",
    name: "Premier tour du monde par Magellan et Elcano",
    context: "Expédition qui prouve la rotondité de la Terre et l'unicité des océans",
    people: "Fernand de Magellan, Juan Sebastián Elcano",
    category: "Exploration",
    catSlug: "exploration"
  },
  {
    era: "modernes",
    major: false,
    date: "1543",
    name: "Copernic publie son héliocentrisme",
    context: "De revolutionibus orbium coelestium place le Soleil au centre",
    people: "Nicolas Copernic",
    category: "Science",
    catSlug: "science"
  },
  {
    era: "modernes",
    major: false,
    date: "1610",
    name: "Galilée observe les satellites de Jupiter",
    context: "Découverte des 4 lunes de Jupiter avec la lunette astronomique",
    people: "Galilée",
    category: "Science",
    catSlug: "science"
  },
  {
    era: "modernes",
    major: false,
    date: "1687",
    name: "Newton publie les Principia Mathematica",
    context: "Lois du mouvement et de la gravitation universelle",
    people: "Isaac Newton",
    category: "Science",
    catSlug: "science"
  },
  {
    era: "modernes",
    major: false,
    date: "1751–1772",
    name: "Publication de l'Encyclopédie de Diderot et d'Alembert",
    context: "35 volumes rassemblant tout le savoir des Lumières",
    people: "Denis Diderot, Jean le Rond d'Alembert",
    category: "Culture",
    catSlug: "culture"
  },
  
  // Époque Contemporaine
  {
    era: "contemporain",
    major: false,
    date: "1859",
    name: "Darwin publie L'Origine des espèces",
    context: "Théorie de l'évolution par sélection naturelle",
    people: "Charles Darwin",
    category: "Science",
    catSlug: "science"
  },
  {
    era: "contemporain",
    major: false,
    date: "1879",
    name: "Edison invente l'ampoule électrique",
    context: "Première ampoule à incandescence pratique et durable",
    people: "Thomas Edison",
    category: "Science",
    catSlug: "science"
  },
  {
    era: "contemporain",
    major: false,
    date: "1903",
    name: "Premier vol motorisé des frères Wright",
    context: "12 secondes de vol à Kitty Hawk, naissance de l'aviation",
    people: "Wilbur et Orville Wright",
    category: "Science",
    catSlug: "science"
  },
  {
    era: "contemporain",
    major: false,
    date: "1928",
    name: "Découverte de la pénicilline par Fleming",
    context: "Premier antibiotique, révolution de la médecine",
    people: "Alexander Fleming",
    category: "Science",
    catSlug: "science"
  },
  {
    era: "contemporain",
    major: false,
    date: "1957",
    name: "Lancement de Spoutnik — début de l'ère spatiale",
    context: "Premier satellite artificiel mis en orbite par l'URSS",
    people: "Sergueï Korolev",
    category: "Science",
    catSlug: "science"
  },
  {
    era: "contemporain",
    major: false,
    date: "1969",
    name: "ARPANET — naissance d'Internet",
    context: "Premier réseau de paquets, ancêtre d'Internet",
    people: "Vint Cerf, Bob Kahn",
    category: "Science",
    catSlug: "science"
  },
  {
    era: "contemporain",
    major: false,
    date: "1989",
    name: "Chute du rideau de fer en Europe de l'Est",
    context: "Effondrement des régimes communistes en Pologne, Hongrie, Tchécoslovaquie",
    people: "Lech Wałęsa, Václav Havel",
    category: "Politique",
    catSlug: "politique"
  },
  {
    era: "contemporain",
    major: false,
    date: "1991",
    name: "Naissance du World Wide Web",
    context: "Tim Berners-Lee rend le Web accessible au public",
    people: "Tim Berners-Lee",
    category: "Science",
    catSlug: "science"
  },
  {
    era: "contemporain",
    major: false,
    date: "2007",
    name: "Lancement de l'iPhone — révolution smartphone",
    context: "Apple transforme le téléphone en ordinateur de poche",
    people: "Steve Jobs",
    category: "Science",
    catSlug: "science"
  },
  {
    era: "contemporain",
    major: false,
    date: "2015",
    name: "Accord de Paris sur le climat",
    context: "196 pays s'engagent à limiter le réchauffement climatique",
    people: "",
    category: "Science",
    catSlug: "science"
  },
  {
    era: "contemporain",
    major: false,
    date: "2020",
    name: "Pandémie de COVID-19",
    context: "Confinement mondial, plus de 7 millions de morts",
    people: "",
    category: "Science",
    catSlug: "science"
  }
];

function addTimelineEvents() {
  console.log('📚 Loading timeline data...');
  
  const timelineData = JSON.parse(fs.readFileSync(TIMELINE_FILE, 'utf-8'));
  
  let addedCount = 0;
  
  for (const event of ADDITIONAL_EVENTS) {
    // Check if event already exists
    const exists = timelineData.events.some(e => 
      e.name === event.name && e.era === event.era
    );
    
    if (!exists) {
      // Generate a unique ID
      const id = `evt-${event.era}-${addedCount + 1000}`;
      timelineData.events.push({
        ...event,
        id: id
      });
      addedCount++;
      console.log(`✓ Added: ${event.name}`);
    }
  }
  
  console.log(`\n💾 Saving timeline data...`);
  fs.writeFileSync(
    TIMELINE_FILE,
    JSON.stringify(timelineData, null, 2),
    'utf-8'
  );
  
  console.log(`\n✅ Done!`);
  console.log(`   - Added ${addedCount} new events`);
  console.log(`   - Total events: ${timelineData.events.length}`);
}

addTimelineEvents();