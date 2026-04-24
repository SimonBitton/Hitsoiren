#!/usr/bin/env node

/**
 * Script to add more historical events to countries still needing them
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const COUNTRIES_FILE = path.join(__dirname, '../data/countries.json');
const MIN_EVENTS = 10;

// Additional curated historical events
const MORE_EVENTS = {
  'Q30': [ // États-Unis
    { date: '4 juillet 1776', isoDate: '1776-07-04', year: 1776, name: 'Déclaration d\'indépendance', context: 'Les treize colonies proclament leur indépendance du Royaume-Uni', category: 'Politique' },
    { date: '7 décembre 1941', isoDate: '1941-12-07', year: 1941, name: 'Attaque de Pearl Harbor', context: 'Attaque surprise japonaise qui fait entrer les États-Unis dans la Seconde Guerre mondiale', category: 'Politique' },
    { date: '6 août 1945', isoDate: '1945-08-06', year: 1945, name: 'Bombardement atomique d\'Hiroshima', context: 'Première utilisation d\'une arme nucléaire en temps de guerre', category: 'Politique' },
    { date: '22 novembre 1963', isoDate: '1963-11-22', year: 1963, name: 'Assassinat de JFK', context: 'Le président John F. Kennedy est assassiné à Dallas', category: 'Politique' },
    { date: '20 juillet 1969', isoDate: '1969-07-20', year: 1969, name: 'Premier pas sur la Lune', context: 'Neil Armstrong et Buzz Aldrin marchent sur la Lune', category: 'Science' },
    { date: '11 septembre 2001', isoDate: '2001-09-11', year: 2001, name: 'Attentats du 11 septembre', context: 'Attaques terroristes contre le World Trade Center et le Pentagone', category: 'Politique' },
    { date: '4 novembre 2008', isoDate: '2008-11-04', year: 2008, name: 'Élection de Barack Obama', context: 'Premier président afro-américain des États-Unis', category: 'Politique' },
    { date: '29 août 2005', isoDate: '2005-08-29', year: 2005, name: 'Ouragan Katrina', context: 'Catastrophe naturelle dévastatrice à La Nouvelle-Orléans', category: 'Science' },
    { date: '6 janvier 2021', isoDate: '2021-01-06', year: 2021, name: 'Assaut du Capitole', context: 'Tentative d\'insurrection au Capitole des États-Unis', category: 'Politique' },
  ],
  'Q145': [ // Royaume-Uni
    { date: '15 juin 1215', isoDate: '1215-06-15', year: 1215, name: 'Magna Carta', context: 'Charte limitant les pouvoirs du roi Jean sans Terre', category: 'Politique' },
    { date: '21 octobre 1805', isoDate: '1805-10-21', year: 1805, name: 'Bataille de Trafalgar', context: 'Victoire navale britannique contre la flotte franco-espagnole', category: 'Politique' },
    { date: '18 juin 1815', isoDate: '1815-06-18', year: 1815, name: 'Bataille de Waterloo', context: 'Défaite finale de Napoléon Bonaparte', category: 'Politique' },
    { date: '1 septembre 1939', isoDate: '1939-09-01', year: 1939, name: 'Déclaration de guerre à l\'Allemagne', context: 'Le Royaume-Uni entre dans la Seconde Guerre mondiale', category: 'Politique' },
    { date: '15 février 1971', isoDate: '1971-02-15', year: 1971, name: 'Décimalisation de la livre sterling', context: 'Passage au système décimal pour la monnaie britannique', category: 'Politique' },
    { date: '2 avril 1982', isoDate: '1982-04-02', year: 1982, name: 'Guerre des Malouines', context: 'Conflit avec l\'Argentine pour les îles Falkland', category: 'Politique' },
    { date: '31 août 1997', isoDate: '1997-08-31', year: 1997, name: 'Mort de la princesse Diana', context: 'Décès tragique de Diana Spencer à Paris', category: 'Culture' },
    { date: '7 juillet 2005', isoDate: '2005-07-07', year: 2005, name: 'Attentats de Londres', context: 'Attaques terroristes dans les transports londoniens', category: 'Politique' },
    { date: '23 juin 2016', isoDate: '2016-06-23', year: 2016, name: 'Référendum sur le Brexit', context: 'Vote pour la sortie du Royaume-Uni de l\'Union européenne', category: 'Politique' },
  ],
  'Q29': [ // Espagne
    { date: '12 octobre 1492', isoDate: '1492-10-12', year: 1492, name: 'Découverte de l\'Amérique', context: 'Christophe Colomb atteint les Amériques', category: 'Exploration' },
    { date: '17 juillet 1936', isoDate: '1936-07-17', year: 1936, name: 'Début de la guerre civile', context: 'Coup d\'État militaire menant à la guerre civile espagnole', category: 'Politique' },
    { date: '26 avril 1937', isoDate: '1937-04-26', year: 1937, name: 'Bombardement de Guernica', context: 'Destruction de la ville basque par l\'aviation allemande', category: 'Politique' },
    { date: '1 avril 1939', isoDate: '1939-04-01', year: 1939, name: 'Fin de la guerre civile', context: 'Victoire des nationalistes et début de la dictature franquiste', category: 'Politique' },
    { date: '20 novembre 1975', isoDate: '1975-11-20', year: 1975, name: 'Mort de Franco', context: 'Fin de la dictature et début de la transition démocratique', category: 'Politique' },
    { date: '23 février 1981', isoDate: '1981-02-23', year: 1981, name: 'Tentative de coup d\'État', context: 'Le colonel Tejero prend le Congrès en otage', category: 'Politique' },
    { date: '11 mars 2004', isoDate: '2004-03-11', year: 2004, name: 'Attentats de Madrid', context: 'Attaques terroristes dans les trains de banlieue', category: 'Politique' },
    { date: '1 octobre 2017', isoDate: '2017-10-01', year: 2017, name: 'Référendum catalan', context: 'Référendum d\'indépendance controversé en Catalogne', category: 'Politique' },
    { date: '19 juin 2014', isoDate: '2014-06-19', year: 2014, name: 'Abdication de Juan Carlos', context: 'Le roi Juan Carlos abdique en faveur de son fils Felipe VI', category: 'Politique' },
  ],
  'Q148': [ // Chine
    { date: '1 octobre 1949', isoDate: '1949-10-01', year: 1949, name: 'Proclamation de la République populaire', context: 'Mao Zedong proclame la République populaire de Chine', category: 'Politique' },
    { date: '1 février 1958', isoDate: '1958-02-01', year: 1958, name: 'Grand Bond en avant', context: 'Campagne de collectivisation et d\'industrialisation forcée', category: 'Politique' },
    { date: '16 mai 1966', isoDate: '1966-05-16', year: 1966, name: 'Début de la Révolution culturelle', context: 'Mouvement sociopolitique radical lancé par Mao', category: 'Politique' },
    { date: '9 septembre 1976', isoDate: '1976-09-09', year: 1976, name: 'Mort de Mao Zedong', context: 'Décès du fondateur de la République populaire de Chine', category: 'Politique' },
    { date: '4 juin 1989', isoDate: '1989-06-04', year: 1989, name: 'Massacre de Tian\'anmen', context: 'Répression sanglante des manifestations étudiantes', category: 'Politique' },
    { date: '1 juillet 1997', isoDate: '1997-07-01', year: 1997, name: 'Rétrocession de Hong Kong', context: 'Hong Kong redevient chinoise après 156 ans de colonisation britannique', category: 'Politique' },
    { date: '12 mai 2008', isoDate: '2008-05-12', year: 2008, name: 'Séisme du Sichuan', context: 'Tremblement de terre dévastateur faisant près de 90 000 victimes', category: 'Science' },
    { date: '8 août 2008', isoDate: '2008-08-08', year: 2008, name: 'Jeux olympiques de Pékin', context: 'La Chine organise les Jeux olympiques d\'été', category: 'Culture' },
    { date: '1 janvier 2020', isoDate: '2020-01-01', year: 2020, name: 'Pandémie de COVID-19', context: 'Début de la pandémie mondiale partie de Wuhan', category: 'Science' },
  ],
  'Q668': [ // Inde
    { date: '15 août 1947', isoDate: '1947-08-15', year: 1947, name: 'Indépendance de l\'Inde', context: 'L\'Inde obtient son indépendance du Royaume-Uni', category: 'Politique' },
    { date: '30 janvier 1948', isoDate: '1948-01-30', year: 1948, name: 'Assassinat de Gandhi', context: 'Mahatma Gandhi est assassiné à New Delhi', category: 'Politique' },
    { date: '18 mai 1974', isoDate: '1974-05-18', year: 1974, name: 'Premier essai nucléaire', context: 'L\'Inde devient la sixième puissance nucléaire', category: 'Science' },
    { date: '3 décembre 1984', isoDate: '1984-12-03', year: 1984, name: 'Catastrophe de Bhopal', context: 'Fuite de gaz toxique dans une usine chimique', category: 'Science' },
    { date: '26 décembre 2004', isoDate: '2004-12-26', year: 2004, name: 'Tsunami de l\'océan Indien', context: 'Tsunami dévastateur affectant les côtes indiennes', category: 'Science' },
    { date: '26 novembre 2008', isoDate: '2008-11-26', year: 2008, name: 'Attentats de Mumbai', context: 'Série d\'attaques terroristes coordonnées à Mumbai', category: 'Politique' },
    { date: '5 août 2019', isoDate: '2019-08-05', year: 2019, name: 'Révocation du statut spécial du Cachemire', context: 'Abrogation de l\'article 370 de la Constitution', category: 'Politique' },
    { date: '24 mars 2020', isoDate: '2020-03-24', year: 2020, name: 'Confinement national COVID-19', context: 'Plus grand confinement de l\'histoire affectant 1,3 milliard de personnes', category: 'Science' },
    { date: '26 janvier 1950', isoDate: '1950-01-26', year: 1950, name: 'Proclamation de la République', context: 'L\'Inde devient une république', category: 'Politique' },
  ],
  'Q17': [ // Japon
    { date: '6 août 1945', isoDate: '1945-08-06', year: 1945, name: 'Bombardement atomique d\'Hiroshima', context: 'Première bombe atomique larguée sur une ville', category: 'Politique' },
    { date: '9 août 1945', isoDate: '1945-08-09', year: 1945, name: 'Bombardement atomique de Nagasaki', context: 'Deuxième et dernière bombe atomique utilisée en guerre', category: 'Politique' },
    { date: '15 août 1945', isoDate: '1945-08-15', year: 1945, name: 'Capitulation du Japon', context: 'Fin de la Seconde Guerre mondiale', category: 'Politique' },
    { date: '17 janvier 1995', isoDate: '1995-01-17', year: 1995, name: 'Séisme de Kobe', context: 'Tremblement de terre dévastateur faisant plus de 6 000 morts', category: 'Science' },
  ],
  'Q159': [ // Russie
    { date: '7 novembre 1917', isoDate: '1917-11-07', year: 1917, name: 'Révolution d\'Octobre', context: 'Les bolcheviks prennent le pouvoir en Russie', category: 'Politique' },
    { date: '30 décembre 1922', isoDate: '1922-12-30', year: 1922, name: 'Création de l\'URSS', context: 'Formation de l\'Union des républiques socialistes soviétiques', category: 'Politique' },
    { date: '5 mars 1953', isoDate: '1953-03-05', year: 1953, name: 'Mort de Staline', context: 'Décès de Joseph Staline après 30 ans au pouvoir', category: 'Politique' },
    { date: '12 avril 1961', isoDate: '1961-04-12', year: 1961, name: 'Premier vol spatial habité', context: 'Youri Gagarine devient le premier homme dans l\'espace', category: 'Science' },
    { date: '26 avril 1986', isoDate: '1986-04-26', year: 1986, name: 'Catastrophe de Tchernobyl', context: 'Accident nucléaire majeur en Ukraine soviétique', category: 'Science' },
    { date: '19 août 1991', isoDate: '1991-08-19', year: 1991, name: 'Putsch de Moscou', context: 'Tentative de coup d\'État contre Gorbatchev', category: 'Politique' },
    { date: '25 décembre 1991', isoDate: '1991-12-25', year: 1991, name: 'Dissolution de l\'URSS', context: 'Fin de l\'Union soviétique', category: 'Politique' },
    { date: '24 février 2022', isoDate: '2022-02-24', year: 2022, name: 'Invasion de l\'Ukraine', context: 'Début de l\'invasion russe de l\'Ukraine', category: 'Politique' },
    { date: '23 octobre 2002', isoDate: '2002-10-23', year: 2002, name: 'Prise d\'otages du théâtre de Moscou', context: 'Prise d\'otages terroriste au théâtre Dubrovka', category: 'Politique' },
  ],
};

function addMoreEvents() {
  console.log('📚 Loading countries data...');
  
  const countriesData = JSON.parse(fs.readFileSync(COUNTRIES_FILE, 'utf-8'));
  let enrichedCount = 0;
  let totalAdded = 0;
  
  for (const country of countriesData) {
    const currentEventCount = country.events.length;
    
    if (currentEventCount >= MIN_EVENTS) {
      continue;
    }
    
    const curatedEvents = MORE_EVENTS[country.qid];
    
    if (curatedEvents && curatedEvents.length > 0) {
      const neededEvents = MIN_EVENTS - currentEventCount;
      const eventsToAdd = curatedEvents.slice(0, neededEvents).map(event => ({
        ...event,
        source: {
          type: 'curated',
          countryQid: country.qid
        }
      }));
      
      const existingKeys = new Set(
        country.events.map(e => `${e.isoDate}-${e.name}`)
      );
      
      const uniqueEvents = eventsToAdd.filter(e => 
        !existingKeys.has(`${e.isoDate}-${e.name}`)
      );
      
      if (uniqueEvents.length > 0) {
        country.events.push(...uniqueEvents);
        country.events.sort((a, b) => a.isoDate.localeCompare(b.isoDate));
        
        console.log(`✓ ${country.flag} ${country.name}: Added ${uniqueEvents.length} events (now ${country.events.length})`);
        enrichedCount++;
        totalAdded += uniqueEvents.length;
      }
    }
  }
  
  console.log(`\n💾 Saving enriched data...`);
  fs.writeFileSync(
    COUNTRIES_FILE,
    JSON.stringify(countriesData, null, 2),
    'utf-8'
  );
  
  console.log(`\n✅ Done!`);
  console.log(`   - Enriched ${enrichedCount} countries`);
  console.log(`   - Added ${totalAdded} total events`);
}

addMoreEvents();
