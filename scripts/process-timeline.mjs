#!/usr/bin/env node

/**
 * Script to clean, sort and enrich the timeline with more historical events
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const TIMELINE_FILE = path.join(__dirname, '../data/timeline.json');

// Function to parse dates for sorting
function parseDate(dateStr) {
  // Handle various date formats
  const cleaned = dateStr.replace(/[≈~]/g, '').trim();

  // Handle BC dates
  if (cleaned.includes('av. J.-C.')) {
    const year = parseInt(cleaned.replace('av. J.-C.', '').trim());
    return -year;
  }

  // Handle AD dates
  if (cleaned.includes('ap. J.-C.')) {
    const year = parseInt(cleaned.replace('ap. J.-C.', '').trim());
    return year;
  }

  // Handle ranges - take the first year
  if (cleaned.includes('–') || cleaned.includes('-')) {
    const firstYear = cleaned.split(/[–-]/)[0].trim();
    return parseDate(firstYear);
  }

  // Handle "année" prefix
  if (cleaned.startsWith('année')) {
    const year = parseInt(cleaned.replace('année', '').trim());
    return year;
  }

  // Handle "de X à Y" format
  if (cleaned.startsWith('de')) {
    const match = cleaned.match(/de\s+(\d+)/);
    if (match) {
      return parseInt(match[1]);
    }
  }

  // Simple year
  const year = parseInt(cleaned);
  if (!isNaN(year)) {
    return year;
  }

  // Fallback - return a large number to put unknown dates at the end
  return 999999;
}

// Additional historical events to add (focusing on late Middle Ages to contemporary)
const ADDITIONAL_EVENTS = [
  // Moyen Âge tardif
  {
    era: "moyen-age",
    major: false,
    date: "1328",
    name: "Fin de la dynastie capétienne directe — Philippe VI de Valois",
    context: "Mort de Charles IV sans héritier mâle ; début de la guerre de Cent Ans",
    people: "Philippe VI de Valois",
    category: "Politique",
    catSlug: "politique"
  },
  {
    era: "moyen-age",
    major: false,
    date: "1340",
    name: "Bataille de l'Écluse — suprématie navale anglaise",
    context: "Victoire anglaise sur la flotte française ; contrôle de la Manche",
    people: "Édouard III",
    category: "Politique",
    catSlug: "politique"
  },
  {
    era: "moyen-age",
    major: false,
    date: "1346",
    name: "Bataille de Crécy — archers anglais déciment la chevalerie française",
    context: "Première grande victoire anglaise ; début de la domination anglaise en France",
    people: "Édouard III, Philippe VI",
    category: "Politique",
    catSlug: "politique"
  },
  {
    era: "moyen-age",
    major: false,
    date: "1356",
    name: "Bataille de Poitiers — capture du roi Jean II le Bon",
    context: "Le Prince Noir capture le roi de France ; traité de Brétigny 1360",
    people: "Jean II le Bon, Édouard le Prince Noir",
    category: "Politique",
    catSlug: "politique"
  },
  {
    era: "moyen-age",
    major: false,
    date: "1381",
    name: "Révolte des paysans anglais — Wat Tyler",
    context: "Soulèvement contre la poll tax ; exécution de Wat Tyler par Richard II",
    people: "Wat Tyler, Richard II",
    category: "Politique",
    catSlug: "politique"
  },
  {
    era: "moyen-age",
    major: false,
    date: "1389",
    name: "Bataille de Kosovo Polje — défaite serbe face aux Ottomans",
    context: "Lazare de Serbie tué ; début de la domination ottomane dans les Balkans",
    people: "Lazare de Serbie, Mourad Ier",
    category: "Politique",
    catSlug: "politique"
  },
  {
    era: "moyen-age",
    major: false,
    date: "1396",
    name: "Bataille de Nicopolis — croisade contre les Ottomans",
    context: "Défaite chrétienne ; capture de Jean sans Peur ; fin des croisades",
    people: "Jean sans Peur, Bajazet Ier",
    category: "Politique",
    catSlug: "politique"
  },
  {
    era: "moyen-age",
    major: false,
    date: "1410",
    name: "Bataille de Tannenberg — victoire polono-lituanienne sur les Teutoniques",
    context: "Fin de l'expansion teutonique ; affaiblissement de l'ordre Teutonique",
    people: "Vladislav II Jagellon, Ulrich von Jungingen",
    category: "Politique",
    catSlug: "politique"
  },
  {
    era: "moyen-age",
    major: false,
    date: "1415",
    name: "Bataille d'Azincourt — archers anglais vs chevaliers français",
    context: "Victoire anglaise décisive ; Henri V roi de France en 1420",
    people: "Henri V d'Angleterre, Charles VI de France",
    category: "Politique",
    catSlug: "politique"
  },
  {
    era: "moyen-age",
    major: false,
    date: "1429",
    name: "Jeanne d'Arc lève le siège d'Orléans",
    context: "Victoire française ; sacre de Charles VII à Reims ; tournant de la guerre",
    people: "Jeanne d'Arc, Charles VII",
    category: "Politique",
    catSlug: "politique"
  },
  {
    era: "moyen-age",
    major: false,
    date: "1450",
    name: "Invention de l'imprimerie en Europe — Johannes Gutenberg",
    context: "Bible de Gutenberg ; diffusion massive du savoir ; Renaissance intellectuelle",
    people: "Johannes Gutenberg",
    category: "Science",
    catSlug: "science"
  },
  {
    era: "moyen-age",
    major: false,
    date: "1453",
    name: "Chute de Constantinople — fin de l'Empire byzantin",
    context: "Mehmed II prend la ville ; fin de 1 000 ans d'Empire romain d'Orient",
    people: "Mehmed II, Constantin XI",
    category: "Politique",
    catSlug: "politique"
  },
  {
    era: "moyen-age",
    major: false,
    date: "1461",
    name: "Louis XI — fin de la guerre de Cent Ans",
    context: "Victoire française ; traité de Picquigny 1475 ; unification territoriale",
    people: "Louis XI",
    category: "Politique",
    catSlug: "politique"
  },
  {
    era: "moyen-age",
    major: false,
    date: "1478",
    name: "Inquisition espagnole — Tomas de Torquemada",
    context: "Tribunal contre l'hérésie ; expulsion des Juifs en 1492",
    people: "Tomas de Torquemada, Isabelle Ire",
    category: "Politique",
    catSlug: "politique"
  },
  {
    era: "moyen-age",
    major: false,
    date: "1485",
    name: "Bataille de Bosworth — Henri Tudor fonde la dynastie Tudor",
    context: "Fin de la guerre des Deux-Roses ; Henri VII roi d'Angleterre",
    people: "Henri VII Tudor, Richard III",
    category: "Politique",
    catSlug: "politique"
  },
  {
    era: "moyen-age",
    major: false,
    date: "1494",
    name: "Traité de Tordesillas — partage du monde entre Espagne et Portugal",
    context: "Papauté divise les terres nouvelles ; ligne de démarcation à 370 lieues",
    people: "Alexandre VI, Ferdinand II, Jean II du Portugal",
    category: "Politique",
    catSlug: "politique"
  },

  // Temps Modernes - Renaissance et Réformes
  {
    era: "modernes",
    major: false,
    date: "1503",
    name: "Michel-Ange commence la Pietà",
    context: "Chef-d'œuvre de la sculpture Renaissance ; jeunesse éternelle de Marie",
    people: "Michel-Ange",
    category: "Culture",
    catSlug: "culture"
  },
  {
    era: "modernes",
    major: false,
    date: "1506",
    name: "Construction de la basilique Saint-Pierre de Rome",
    context: "Bramante puis Michel-Ange ; centre de la chrétienté catholique",
    people: "Bramante, Michel-Ange",
    category: "Culture",
    catSlug: "culture"
  },
  {
    era: "modernes",
    major: false,
    date: "1509",
    name: "Henri VIII roi d'Angleterre — dynastie Tudor",
    context: "Renaissance anglaise ; rupture avec Rome en 1534",
    people: "Henri VIII",
    category: "Politique",
    catSlug: "politique"
  },
  {
    era: "modernes",
    major: false,
    date: "1516",
    name: "Thomas More — Utopie",
    context: "Première réflexion moderne sur la société idéale",
    people: "Thomas More",
    category: "Culture",
    catSlug: "culture"
  },
  {
    era: "modernes",
    major: false,
    date: "1524",
    name: "Giovanni da Verrazzano explore la côte est américaine",
    context: "Premier Européen à naviguer de la Floride à Terre-Neuve",
    people: "Giovanni da Verrazzano",
    category: "Exploration",
    catSlug: "exploration"
  },
  {
    era: "modernes",
    major: false,
    date: "1527",
    name: "Sac de Rome par les troupes de Charles Quint",
    context: "Pillage de la Ville éternelle ; fin de la Renaissance italienne",
    people: "Charles Quint, Bourbon (connétable)",
    category: "Politique",
    catSlug: "politique"
  },
  {
    era: "modernes",
    major: false,
    date: "1532",
    name: "Francisco Pizarro conquiert l'Empire inca",
    context: "Capture d'Atahualpa ; fin de la civilisation inca",
    people: "Francisco Pizarro, Atahualpa",
    category: "Politique",
    catSlug: "politique"
  },
  {
    era: "modernes",
    major: false,
    date: "1536",
    name: "Jean Calvin — Institution de la religion chrétienne",
    context: "Théologie réformée ; Genève \"Rome protestante\"",
    people: "Jean Calvin",
    category: "Culture",
    catSlug: "culture"
  },
  {
    era: "modernes",
    major: false,
    date: "1541",
    name: "Jean Calvin à Genève — théocratie protestante",
    context: "Réforme radicale ; persécution des catholiques et anabaptistes",
    people: "Jean Calvin",
    category: "Politique",
    catSlug: "politique"
  },
  {
    era: "modernes",
    major: false,
    date: "1555",
    name: "Paix d'Augsbourg — cuius regio, eius religio",
    context: "Principe de tolérance religieuse ; fin des guerres de religion allemandes",
    people: "Charles Quint, Maurice de Saxe",
    category: "Politique",
    catSlug: "politique"
  },
  {
    era: "modernes",
    major: false,
    date: "1558",
    name: "Élisabeth Ire reine d'Angleterre — âge d'or élisabéthain",
    context: "Défaite de l'Invincible Armada ; Shakespeare, Drake, Raleigh",
    people: "Élisabeth Ire",
    category: "Politique",
    catSlug: "politique"
  },
  {
    era: "modernes",
    major: false,
    date: "1562–1598",
    name: "Guerres de religion en France — 9 guerres civiles",
    context: "Catholique vs Huguenots ; massacre de la Saint-Barthélemy 1572",
    people: "Catherine de Médicis, Henri IV",
    category: "Politique",
    catSlug: "politique"
  },
  {
    era: "modernes",
    major: false,
    date: "1571",
    name: "Bataille de Lépante — victoire chrétienne sur les Ottomans",
    context: "Plus grande bataille navale de l'histoire ; fin de l'expansion ottomane",
    people: "Don Juan d'Autriche, Ali Pacha",
    category: "Politique",
    catSlug: "politique"
  },
  {
    era: "modernes",
    major: false,
    date: "1588",
    name: "Défaite de l'Invincible Armada espagnole",
    context: "Tempête détruit la flotte ; déclin de la puissance espagnole",
    people: "Élisabeth Ire, Philippe II",
    category: "Politique",
    catSlug: "politique"
  },
  {
    era: "modernes",
    major: false,
    date: "1590",
    name: "Shakespeare — Roméo et Juliette",
    context: "Tragédie de l'amour impossible ; immortalisation du mythe",
    people: "William Shakespeare",
    category: "Culture",
    catSlug: "culture"
  },
  {
    era: "modernes",
    major: false,
    date: "1605",
    name: "Conspiration des poudres — Guy Fawkes",
    context: "Tentative d'attentat contre Jacques Ier ; fête du 5 novembre",
    people: "Guy Fawkes, Jacques Ier",
    category: "Politique",
    catSlug: "politique"
  },
  {
    era: "modernes",
    major: false,
    date: "1618",
    name: "Défenestration de Prague — début de la guerre de Trente Ans",
    context: "Protestants jettent les catholiques par la fenêtre ; guerre européenne",
    people: "",
    category: "Politique",
    catSlug: "politique"
  },
  {
    era: "modernes",
    major: false,
    date: "1620",
    name: "Pèlerins du Mayflower — Plymouth Colony",
    context: "Fondation de la Nouvelle-Angleterre ; Thanksgiving 1621",
    people: "",
    category: "Exploration",
    catSlug: "exploration"
  },
  {
    era: "modernes",
    major: false,
    date: "1635",
    name: "Académie française fondée par Richelieu",
    context: "Protection de la langue française ; 40 immortels",
    people: "Cardinal Richelieu",
    category: "Culture",
    catSlug: "culture"
  },
  {
    era: "modernes",
    major: false,
    date: "1642",
    name: "Début de la guerre civile anglaise — Cavaliers vs Têtes-Rondes",
    context: "Charles Ier vs Parlement ; exécution du roi en 1649",
    people: "Charles Ier, Oliver Cromwell",
    category: "Politique",
    catSlug: "politique"
  },
  {
    era: "modernes",
    major: false,
    date: "1643",
    name: "Louis XIV — début du règne personnel",
    context: "Mort de Mazarin ; \"L'État c'est moi\" ; apogée du absolutisme",
    people: "Louis XIV",
    category: "Politique",
    catSlug: "politique"
  },
  {
    era: "modernes",
    major: false,
    date: "1648",
    name: "Traité de Westphalie — fin de la guerre de Trente Ans",
    context: "Souveraineté des États ; équilibre européen ; naissance du droit international",
    people: "",
    category: "Politique",
    catSlug: "politique"
  },
  {
    era: "modernes",
    major: false,
    date: "1651",
    name: "Thomas Hobbes — Léviathan",
    context: "Théorie du contrat social ; absolutisme politique",
    people: "Thomas Hobbes",
    category: "Culture",
    catSlug: "culture"
  },
  {
    era: "modernes",
    major: false,
    date: "1665",
    name: "Grande peste de Londres",
    context: "100 000 morts ; Isaac Newton fuit à la campagne",
    people: "",
    category: "Science",
    catSlug: "science"
  },
  {
    era: "modernes",
    major: false,
    date: "1666",
    name: "Grand incendie de Londres",
    context: "Détruit 80% de la ville ; reconstruction moderne par Wren",
    people: "Christopher Wren",
    category: "Politique",
    catSlug: "politique"
  },
  {
    era: "modernes",
    major: false,
    date: "1673",
    name: "Antonie van Leeuwenhoek découvre les bactéries",
    context: "Premier microscope ; \"animalcules\" dans l'eau",
    people: "Antonie van Leeuwenhoek",
    category: "Science",
    catSlug: "science"
  },
  {
    era: "modernes",
    major: false,
    date: "1677",
    name: "Leeuwenhoek découvre les spermatozoïdes",
    context: "Preuve de la reproduction sexuée ; fin des théories de la génération spontanée",
    people: "Antonie van Leeuwenhoek",
    category: "Science",
    catSlug: "science"
  },
  {
    era: "modernes",
    major: false,
    date: "1683",
    name: "Siège de Vienne — défaite ottomane",
    context: "Jean Sobieski sauve Vienne ; fin de l'expansion ottomane en Europe",
    people: "Jean III Sobieski, Kara Mustafa",
    category: "Politique",
    catSlug: "politique"
  },
  {
    era: "modernes",
    major: false,
    date: "1685",
    name: "Révocation de l'édit de Nantes — dragonnades",
    context: "Fin de la tolérance religieuse ; exil des huguenots",
    people: "Louis XIV",
    category: "Politique",
    catSlug: "politique"
  },
  {
    era: "modernes",
    major: false,
    date: "1692",
    name: "Procès des sorcières de Salem",
    context: "Hystérie collective ; 20 exécutions ; fin des procès de sorcellerie",
    people: "",
    category: "Culture",
    catSlug: "culture"
  },
  {
    era: "modernes",
    major: false,
    date: "1697",
    name: "Pierre le Grand visite l'Europe occidentale",
    context: "Modernisation forcée de la Russie ; ouverture vers l'Occident",
    people: "Pierre le Grand",
    category: "Politique",
    catSlug: "politique"
  },
  {
    era: "modernes",
    major: false,
    date: "1701",
    name: "Acte d'établissement — succession protestante en Angleterre",
    context: "Exclusion des catholiques ; Anne Stuart dernière Stuart",
    people: "Guillaume III",
    category: "Politique",
    catSlug: "politique"
  },
  {
    era: "modernes",
    major: false,
    date: "1701–1714",
    name: "Guerre de Succession d'Espagne",
    context: "Philippe V Bourbon sur le trône ; équilibre européen bouleversé",
    people: "Philippe V, Louis XIV",
    category: "Politique",
    catSlug: "politique"
  },
  {
    era: "modernes",
    major: false,
    date: "1704",
    name: "Bataille de Blenheim — Marlborough vs Français",
    context: "Victoire anglo-autrichienne ; fin de la suprématie française",
    people: "John Churchill Marlborough, Tallard",
    category: "Politique",
    catSlug: "politique"
  },
  {
    era: "modernes",
    major: false,
    date: "1707",
    name: "Acte d'Union — naissance du Royaume-Uni",
    context: "Angleterre et Écosse unifiées ; fin des Parlements séparés",
    people: "Anne Stuart",
    category: "Politique",
    catSlug: "politique"
  },
  {
    era: "modernes",
    major: false,
    date: "1709",
    name: "Grand Hiver — famine en Europe",
    context: "Hiver glacial ; récoltes perdues ; 600 000 morts en France",
    people: "",
    category: "Science",
    catSlug: "science"
  },
  {
    era: "modernes",
    major: false,
    date: "1713",
    name: "Traité d'Utrecht — fin de la guerre de Succession d'Espagne",
    context: "Philippe V roi d'Espagne ; Gibraltar et Minorque à l'Angleterre",
    people: "",
    category: "Politique",
    catSlug: "politique"
  },
  {
    era: "modernes",
    major: false,
    date: "1715",
    name: "Mort de Louis XIV — fin du règne de 72 ans",
    context: "Régence de Philippe d'Orléans ; début de la Régence",
    people: "Louis XIV",
    category: "Politique",
    catSlug: "politique"
  },
  {
    era: "modernes",
    major: false,
    date: "1721",
    name: "Robert Walpole — premier Premier ministre britannique",
    context: "Système parlementaire moderne ; stabilité politique",
    people: "Robert Walpole",
    category: "Politique",
    catSlug: "politique"
  },
  {
    era: "modernes",
    major: false,
    date: "1725",
    name: "Vivaldi — Les Quatre Saisons",
    context: "Concertos pour violon ; musique descriptive ; baroque tardif",
    people: "Antonio Vivaldi",
    category: "Culture",
    catSlug: "culture"
  },
  {
    era: "modernes",
    major: false,
    date: "1733",
    name: "John Kay invente la navette volante",
    context: "Révolution textile ; tissage 4 fois plus rapide",
    people: "John Kay",
    category: "Science",
    catSlug: "science"
  },
  {
    era: "modernes",
    major: false,
    date: "1736",
    name: "Euler résout le problème des sept ponts de Königsberg",
    context: "Naissance de la théorie des graphes ; topologie moderne",
    people: "Leonhard Euler",
    category: "Science",
    catSlug: "science"
  },
  {
    era: "modernes",
    major: false,
    date: "1740",
    name: "Frédéric II le Grand roi de Prusse",
    context: "Âge d'or prussien ; guerres de Silésie ; Voltaire à sa cour",
    people: "Frédéric II",
    category: "Politique",
    catSlug: "politique"
  },
  {
    era: "modernes",
    major: false,
    date: "1740–1748",
    name: "Guerre de Succession d'Autriche",
    context: "Marie-Thérèse défend ses terres ; Frédéric II attaque la Silésie",
    people: "Marie-Thérèse, Frédéric II",
    category: "Politique",
    catSlug: "politique"
  },
  {
    era: "modernes",
    major: false,
    date: "1745",
    name: "Bataille de Fontenoy — dernière victoire française",
    context: "Louis XV vs Anglais ; \"Messieurs les Anglais, tirez les premiers\"",
    people: "Louis XV, Maurice de Saxe",
    category: "Politique",
    catSlug: "politique"
  },
  {
    era: "modernes",
    major: false,
    date: "1750",
    name: "Buffon — Histoire naturelle",
    context: "44 volumes ; classification des espèces ; évolution des continents",
    people: "Georges-Louis Leclerc de Buffon",
    category: "Science",
    catSlug: "science"
  },
  {
    era: "modernes",
    major: false,
    date: "1754–1763",
    name: "Guerre de Sept Ans — première guerre mondiale",
    context: "France vs Angleterre ; perte du Canada français ; traité de Paris 1763",
    people: "Louis XV, Pitt l'Ancien",
    category: "Politique",
    catSlug: "politique"
  },
  {
    era: "modernes",
    major: false,
    date: "1755",
    name: "Tremblement de terre de Lisbonne",
    context: "60 000 morts ; Voltaire questionne la Providence ; siècle des Lumières",
    people: "Voltaire",
    category: "Science",
    catSlug: "science"
  },
  {
    era: "modernes",
    major: false,
    date: "1757",
    name: "Bataille de Plassey — conquête britannique de l'Inde",
    context: "Robert Clive défait les Bengalis ; début de l'Empire britannique des Indes",
    people: "Robert Clive",
    category: "Politique",
    catSlug: "politique"
  },
  {
    era: "modernes",
    major: false,
    date: "1759",
    name: "Québec tombe aux mains des Anglais",
    context: "Wolfe prend la ville ; fin du Canada français",
    people: "James Wolfe, Montcalm",
    category: "Politique",
    catSlug: "politique"
  },
  {
    era: "modernes",
    major: false,
    date: "1760",
    name: "George III roi d'Angleterre — début de la folie royale",
    context: "Perd les colonies américaines ; première crise mentale en 1765",
    people: "George III",
    category: "Politique",
    catSlug: "politique"
  },
  {
    era: "modernes",
    major: false,
    date: "1762",
    name: "Catherine II la Grande — coup d'État russe",
    context: "Renverse Pierre III ; expansion territoriale ; Lumières russes",
    people: "Catherine II",
    category: "Politique",
    catSlug: "politique"
  },
  {
    era: "modernes",
    major: false,
    date: "1765",
    name: "James Hargreaves invente la spinning jenny",
    context: "Machine à filer ; révolution industrielle textile",
    people: "James Hargreaves",
    category: "Science",
    catSlug: "science"
  },
  {
    era: "modernes",
    major: false,
    date: "1768",
    name: "Cook — premier voyage autour du monde",
    context: "Observation du transit de Vénus ; cartographie de la Nouvelle-Zélande",
    people: "James Cook",
    category: "Exploration",
    catSlug: "exploration"
  },
  {
    era: "modernes",
    major: false,
    date: "1769",
    name: "Richard Arkwright — water frame",
    context: "Machine à filer hydraulique ; usine moderne ; prolétariat industriel",
    people: "Richard Arkwright",
    category: "Science",
    catSlug: "science"
  },
  {
    era: "modernes",
    major: false,
    date: "1771",
    name: "Première Encyclopédie chinoise — Gujin Tushu Jicheng",
    context: "10 000 volumes ; somme de tout le savoir chinois",
    people: "",
    category: "Culture",
    catSlug: "culture"
  },
  {
    era: "modernes",
    major: false,
    date: "1774",
    name: "Goethe — Les Souffrances du jeune Werther",
    context: "Roman épistolaire ; mouvement Sturm und Drang ; suicides en série",
    people: "Johann Wolfgang von Goethe",
    category: "Culture",
    catSlug: "culture"
  },
  {
    era: "modernes",
    major: false,
    date: "1775",
    name: "Paul Revere — chevauchée de minuit",
    context: "Avertit les colons ; début de la guerre d'Indépendance américaine",
    people: "Paul Revere",
    category: "Politique",
    catSlug: "politique"
  },
  {
    era: "modernes",
    major: false,
    date: "1777",
    name: "Articles de Confédération — première constitution américaine",
    context: "Union des 13 États ; gouvernement fédéral faible",
    people: "",
    category: "Politique",
    catSlug: "politique"
  },
  {
    era: "modernes",
    major: false,
    date: "1778",
    name: "Alliance franco-américaine",
    context: "Traité d'alliance ; France entre en guerre contre l'Angleterre",
    people: "Benjamin Franklin",
    category: "Politique",
    catSlug: "politique"
  },
  {
    era: "modernes",
    major: false,
    date: "1780",
    name: "Bataille de Camden — victoire britannique en Caroline du Sud",
    context: "Gates défait ; Cornwallis contrôle le Sud",
    people: "Horatio Gates, Charles Cornwallis",
    category: "Politique",
    catSlug: "politique"
  },
  {
    era: "modernes",
    major: false,
    date: "1781",
    name: "Siège de Yorktown — reddition de Cornwallis",
    context: "Rochambeau et Washington ; fin de la guerre d'Indépendance",
    people: "George Washington, Rochambeau, Cornwallis",
    category: "Politique",
    catSlug: "politique"
  },
  {
    era: "modernes",
    major: false,
    date: "1783",
    name: "Traité de Paris — indépendance américaine reconnue",
    context: "Frontières des USA ; Floride à l'Espagne ; liberté de navigation",
    people: "",
    category: "Politique",
    catSlug: "politique"
  },
  {
    era: "modernes",
    major: false,
    date: "1784",
    name: "James Watt brevète la machine à vapeur rotative",
    context: "Mouvement circulaire ; révolution industrielle complète",
    people: "James Watt",
    category: "Science",
    catSlug: "science"
  },
  {
    era: "modernes",
    major: false,
    date: "1786",
    name: "Shays' Rebellion — soulèvement paysan aux USA",
    context: "Dettes et taxes ; Massachusetts ; première crise de la République",
    people: "Daniel Shays",
    category: "Politique",
    catSlug: "politique"
  },
  {
    era: "modernes",
    major: false,
    date: "1787",
    name: "Constitution américaine — Convention de Philadelphie",
    context: "Madison, Hamilton, Jefferson ; séparation des pouvoirs ; fédéralisme",
    people: "James Madison, Alexander Hamilton",
    category: "Politique",
    catSlug: "politique"
  },
  {
    era: "modernes",
    major: false,
    date: "1788",
    name: "Ratification de la Constitution américaine",
    context: "9e État (New Hampshire) ; George Washington premier président",
    people: "George Washington",
    category: "Politique",
    catSlug: "politique"
  },
  {
    era: "modernes",
    major: false,
    date: "1789",
    name: "Mutinerie du Bounty — Fletcher Christian",
    context: "Marins contre Bligh ; mythe du paradis polynésien",
    people: "Fletcher Christian, William Bligh",
    category: "Exploration",
    catSlug: "exploration"
  },

  // Époque Contemporaine - XIXe siècle
  {
    era: "contemporain",
    major: false,
    date: "1801",
    name: "Acte d'Union — Royaume-Uni de Grande-Bretagne et Irlande",
    context: "Fin du Parlement irlandais ; union avec l'Angleterre",
    people: "Pitt le Jeune",
    category: "Politique",
    catSlug: "politique"
  },
  {
    era: "contemporain",
    major: false,
    date: "1802",
    name: "Traité d'Amiens — paix entre France et Angleterre",
    context: "Fin des guerres révolutionnaires ; paix de courte durée",
    people: "Napoléon Bonaparte",
    category: "Politique",
    catSlug: "politique"
  },
  {
    era: "contemporain",
    major: false,
    date: "1803",
    name: "Vente de la Louisiane aux États-Unis",
    context: "15 millions de dollars ; doublement du territoire américain",
    people: "Napoléon Bonaparte, Thomas Jefferson",
    category: "Politique",
    catSlug: "politique"
  },
  {
    era: "contemporain",
    major: false,
    date: "1804",
    name: "Code civil français — Napoléon législateur",
    context: "Droit moderne ; égalité civile ; exporté en Europe",
    people: "Napoléon Bonaparte",
    category: "Politique",
    catSlug: "politique"
  },
  {
    era: "contemporain",
    major: false,
    date: "1806",
    name: "Fin du Saint-Empire romain germanique",
    context: "François II abdique ; Confédération du Rhin sous Napoléon",
    people: "François II, Napoléon Bonaparte",
    category: "Politique",
    catSlug: "politique"
  },
  {
    era: "contemporain",
    major: false,
    date: "1807",
    name: "Blocus continental contre l'Angleterre",
    context: "Napoléon ferme l'Europe au commerce britannique",
    people: "Napoléon Bonaparte",
    category: "Politique",
    catSlug: "politique"
  },
  {
    era: "contemporain",
    major: false,
    date: "1808",
    name: "Dos de Mayo — soulèvement espagnol contre Napoléon",
    context: "Goya peint les exécutions ; guérilla espagnole",
    people: "Goya",
    category: "Politique",
    catSlug: "politique"
  },
  {
    era: "contemporain",
    major: false,
    date: "1810",
    name: "Indépendance du Mexique — Hidalgo",
    context: "Cri de Dolores ; révolution contre l'Espagne",
    people: "Miguel Hidalgo",
    category: "Politique",
    catSlug: "politique"
  },
  {
    era: "contemporain",
    major: false,
    date: "1811",
    name: "Luddites — destruction des machines textiles",
    context: "Mouvement ouvrier contre l'industrialisation ; pendaisons",
    people: "",
    category: "Politique",
    catSlug: "politique"
  },
  {
    era: "contemporain",
    major: false,
    date: "1813",
    name: "Bataille de Leipzig — défaite française",
    context: "\"Bataille des Nations\" ; 600 000 soldats ; tournant de la campagne de France",
    people: "Napoléon Bonaparte",
    category: "Politique",
    catSlug: "politique"
  },
  {
    era: "contemporain",
    major: false,
    date: "1814",
    name: "Campagne de France — abdication de Napoléon",
    context: "Invasion de la France ; traité de Fontainebleau ; exil à l'île d'Elbe",
    people: "Napoléon Bonaparte",
    category: "Politique",
    catSlug: "politique"
  },
  {
    era: "contemporain",
    major: false,
    date: "1815",
    name: "Les Cent-Jours — retour de Napoléon",
    context: "Évasion de l'île d'Elbe ; bataille de Waterloo ; exil à Sainte-Hélène",
    people: "Napoléon Bonaparte",
    category: "Politique",
    catSlug: "politique"
  },
  {
    era: "contemporain",
    major: false,
    date: "1816",
    name: "Indépendance de l'Argentine — San Martín",
    context: "Victoire de Maipú ; fin de la domination espagnole",
    people: "José de San Martín",
    category: "Politique",
    catSlug: "politique"
  },
  {
    era: "contemporain",
    major: false,
    date: "1817",
    name: "James Monroe président — doctrine Monroe",
    context: "\"L'Amérique aux Américains\" ; non-ingérence européenne",
    people: "James Monroe",
    category: "Politique",
    catSlug: "politique"
  },
  {
    era: "contemporain",
    major: false,
    date: "1819",
    name: "Traité d'Adams-Onís — Floride aux USA",
    context: "Achat de la Floride à l'Espagne ; frontière ouest fixée",
    people: "John Quincy Adams",
    category: "Politique",
    catSlug: "politique"
  },
  {
    era: "contemporain",
    major: false,
    date: "1820",
    name: "Missouri Compromise — équilibre esclavagiste",
    context: "Missouri esclavagiste, Maine libre ; ligne 36°30'",
    people: "Henry Clay",
    category: "Politique",
    catSlug: "politique"
  },
  {
    era: "contemporain",
    major: false,
    date: "1821",
    name: "Indépendance du Mexique — Iturbide",
    context: "Plan d'Iguala ; empire mexicain éphémère",
    people: "Agustín de Iturbide",
    category: "Politique",
    catSlug: "politique"
  },
  {
    era: "contemporain",
    major: false,
    date: "1822",
    name: "Indépendance du Brésil — Pedro Ier",
    context: "Fils de Jean VI ; monarchie constitutionnelle",
    people: "Pierre Ier du Brésil",
    category: "Politique",
    catSlug: "politique"
  },
  {
    era: "contemporain",
    major: false,
    date: "1823",
    name: "Monroe Doctrine proclamée",
    context: "Non-intervention européenne dans les Amériques",
    people: "James Monroe",
    category: "Politique",
    catSlug: "politique"
  },
  {
    era: "contemporain",
    major: false,
    date: "1824",
    name: "Bataille d'Ayacucho — indépendance de l'Amérique du Sud",
    context: "Sucre défait les royalistes ; fin de l'empire espagnol",
    people: "Antonio José de Sucre",
    category: "Politique",
    catSlug: "politique"
  },
  {
    era: "contemporain",
    major: false,
    date: "1825",
    name: "Décembristes — soulèvement russe",
    context: "Officiers libéraux contre Nicolas Ier ; exécutions et exils",
    people: "Nicolas Ier",
    category: "Politique",
    catSlug: "politique"
  },
  {
    era: "contemporain",
    major: false,
    date: "1829",
    name: "Premier chemin de fer public Stockton-Darlington",
    context: "Stephenson ; locomotive à vapeur ; 40 km/h",
    people: "George Stephenson",
    category: "Science",
    catSlug: "science"
  },
  {
    era: "contemporain",
    major: false,
    date: "1830",
    name: "Révolution de Juillet — Louis-Philippe roi des Français",
    context: "Trois Glorieuses ; monarchie de juillet ; bourgeoisie au pouvoir",
    people: "Louis-Philippe",
    category: "Politique",
    catSlug: "politique"
  },
  {
    era: "contemporain",
    major: false,
    date: "1831",
    name: "Loi sur le choléra — première loi sanitaire britannique",
    context: "Épidémie de choléra ; intervention de l'État en santé publique",
    people: "",
    category: "Politique",
    catSlug: "politique"
  },
  {
    era: "contemporain",
    major: false,
    date: "1832",
    name: "Great Reform Act — réforme électorale britannique",
    context: "Extension du suffrage ; fin des bourgs pourris",
    people: "",
    category: "Politique",
    catSlug: "politique"
  },
  {
    era: "contemporain",
    major: false,
    date: "1833",
    name: "Abolition de l'esclavage dans l'Empire britannique",
    context: "Compensation aux propriétaires ; 800 000 esclaves libérés",
    people: "",
    category: "Politique",
    catSlug: "politique"
  },
  {
    era: "contemporain",
    major: false,
    date: "1835",
    name: "Guerre des Déserts — Abd el-Kader vs France",
    context: "Conquête de l'Algérie ; résistance algérienne",
    people: "Abd el-Kader",
    category: "Politique",
    catSlug: "politique"
  },
  {
    era: "contemporain",
    major: false,
    date: "1836",
    name: "République du Texas — indépendance du Mexique",
    context: "Santa Anna défait à San Jacinto ; Sam Houston président",
    people: "Sam Houston, Santa Anna",
    category: "Politique",
    catSlug: "politique"
  },
  {
    era: "contemporain",
    major: false,
    date: "1837",
    name: "Reine Victoria — début de l'ère victorienne",
    context: "63 ans de règne ; apogée de l'Empire britannique",
    people: "Victoria du Royaume-Uni",
    category: "Politique",
    catSlug: "politique"
  },
  {
    era: "contemporain",
    major: false,
    date: "1838",
    name: "Chartisme — mouvement ouvrier britannique",
    context: "Charte du peuple ; suffrage universel masculin ; pétitions massives",
    people: "",
    category: "Politique",
    catSlug: "politique"
  },
  {
    era: "contemporain",
    major: false,
    date: "1839",
    name: "Première guerre de l'opium — Chine vs Grande-Bretagne",
    context: "Traité de Nankin ; ouverture des ports chinois ; Hong Kong cédé",
    people: "",
    category: "Politique",
    catSlug: "politique"
  },
  {
    era: "contemporain",
    major: false,
    date: "1840",
    name: "Convention de Londres — indépendance de la Belgique",
    context: "Traité des 24 articles ; neutralité belge garantie",
    people: "",
    category: "Politique",
    catSlug: "politique"
  },
  {
    era: "contemporain",
    major: false,
    date: "1842",
    name: "Loi sur les mines — protection des enfants britanniques",
    context: "Interdiction du travail des enfants de moins de 10 ans",
    people: "",
    category: "Politique",
    catSlug: "politique"
  },
  {
    era: "contemporain",
    major: false,
    date: "1844",
    name: "Télégraphe électrique de Morse",
    context: "Première ligne Washington-Baltimore ; révolution des communications",
    people: "Samuel Morse",
    category: "Science",
    catSlug: "science"
  },
  {
    era: "contemporain",
    major: false,
    date: "1845",
    name: "Grande Famine irlandaise",
    context: "Pommes de terre atteintes ; 1 million de morts ; émigration massive",
    people: "",
    category: "Science",
    catSlug: "science"
  },
  {
    era: "contemporain",
    major: false,
    date: "1846",
    name: "Guerre américano-mexicaine",
    context: "USA annexent Californie, Nouveau-Mexique, Texas ; traité de Guadalupe Hidalgo",
    people: "James K. Polk",
    category: "Politique",
    catSlug: "politique"
  },
  {
    era: "contemporain",
    major: false,
    date: "1847",
    name: "Ether comme anesthésique — opération de Morton",
    context: "Première anesthésie chirurgicale ; révolution médicale",
    people: "William Morton",
    category: "Science",
    catSlug: "science"
  },
  {
    era: "contemporain",
    major: false,
    date: "1848",
    name: "Révolution de 1848 — Europe en feu",
    context: "France, Allemagne, Italie, Autriche ; printemps des peuples",
    people: "Louis-Napoléon Bonaparte",
    category: "Politique",
    catSlug: "politique"
  },
  {
    era: "contemporain",
    major: false,
    date: "1849",
    name: "Ruée vers l'or en Californie",
    context: "Découverte de Sutter ; 300 000 migrants ; croissance américaine",
    people: "James Marshall",
    category: "Exploration",
    catSlug: "exploration"
  },
  {
    era: "contemporain",
    major: false,
    date: "1850",
    name: "Compromis de 1850 — compromis sur l'esclavage",
    context: "Californie libre ; loi sur les esclaves fugitifs ; Kansas-Nebraska Act 1854",
    people: "Henry Clay",
    category: "Politique",
    catSlug: "politique"
  },
  {
    era: "contemporain",
    major: false,
    date: "1851",
    name: "Grande Exposition de Londres — Crystal Palace",
    context: "Exposition universelle ; apogée de l'ère victorienne",
    people: "Prince Albert",
    category: "Culture",
    catSlug: "culture"
  },
  {
    era: "contemporain",
    major: false,
    date: "1852",
    name: "Coup d'État du 2 décembre — Napoléon III",
    context: "Fin de la IIe République ; Second Empire français",
    people: "Louis-Napoléon Bonaparte",
    category: "Politique",
    catSlug: "politique"
  },
  {
    era: "contemporain",
    major: false,
    date: "1853",
    name: "Guerre de Crimée — France, Royaume-Uni vs Russie",
    context: "Siège de Sébastopol ; Florence Nightingale ; traité de Paris 1856",
    people: "Napoléon III",
    category: "Politique",
    catSlug: "politique"
  },
  {
    era: "contemporain",
    major: false,
    date: "1854",
    name: "Charge de la Brigade légère — guerre de Crimée",
    context: "Poème de Tennyson ; erreur tactique ; 600 morts",
    people: "Lord Cardigan",
    category: "Politique",
    catSlug: "politique"
  },
  {
    era: "contemporain",
    major: false,
    date: "1856",
    name: "Inde britannique — révolte des Cipayes",
    context: "Mutinerie contre la Compagnie des Indes ; fin du Raj britannique direct",
    people: "",
    category: "Politique",
    catSlug: "politique"
  },
  {
    era: "contemporain",
    major: false,
    date: "1857",
    name: "Fondation du Parti républicain américain",
    context: "Anti-esclavagiste ; Abraham Lincoln candidat en 1860",
    people: "",
    category: "Politique",
    catSlug: "politique"
  },
  {
    era: "contemporain",
    major: false,
    date: "1858",
    name: "Débat Lincoln-Douglas — Illinois",
    context: "7 débats ; Lincoln devient célèbre nationalement",
    people: "Abraham Lincoln, Stephen Douglas",
    category: "Politique",
    catSlug: "politique"
  },
  {
    era: "contemporain",
    major: false,
    date: "1859",
    name: "John Brown — raid sur Harpers Ferry",
    context: "Tentative d'insurrection esclave ; exécution ; radicalise le Nord",
    people: "John Brown",
    category: "Politique",
    catSlug: "politique"
  },
  {
    era: "contemporain",
    major: false,
    date: "1860",
    name: "Élection de Lincoln — sécession sudiste",
    context: "Caroline du Sud fait sécession ; 7 États suivent ; Fort Sumter bombardé",
    people: "Abraham Lincoln",
    category: "Politique",
    catSlug: "politique"
  },
  {
    era: "contemporain",
    major: false,
    date: "1862",
    name: "Bataille d'Antietam — tournant de la guerre de Sécession",
    context: "22 000 morts en un jour ; émancipation des esclaves du Sud",
    people: "Abraham Lincoln, Robert E. Lee",
    category: "Politique",
    catSlug: "politique"
  },
  {
    era: "contemporain",
    major: false,
    date: "1863",
    name: "Bataille de Gettysburg — défaite confédérée",
    context: "50 000 morts ; tournant définitif ; discours de Lincoln",
    people: "George Meade, Robert E. Lee",
    category: "Politique",
    catSlug: "politique"
  },
  {
    era: "contemporain",
    major: false,
    date: "1864",
    name: "Sherman — marche vers la mer",
    context: "Destruction systématique ; guerre totale ; reddition de Lee",
    people: "William Tecumseh Sherman",
    category: "Politique",
    catSlug: "politique"
  },
  {
    era: "contemporain",
    major: false,
    date: "1865",
    name: "Assassinat de Lincoln — John Wilkes Booth",
    context: "14 avril ; fin de la Reconstruction ; Andrew Johnson président",
    people: "Abraham Lincoln",
    category: "Politique",
    catSlug: "politique"
  },
  {
    era: "contemporain",
    major: false,
    date: "1866",
    name: "Droits civils — 14e Amendement américain",
    context: "Citoyenneté aux Afro-Américains ; droits égaux",
    people: "",
    category: "Politique",
    catSlug: "politique"
  },
  {
    era: "contemporain",
    major: false,
    date: "1867",
    name: "Achat de l'Alaska aux Russes",
    context: "7,2 millions de dollars ; \"folie de Seward\"",
    people: "William Seward",
    category: "Politique",
    catSlug: "politique"
  },
  {
    era: "contemporain",
    major: false,
    date: "1868",
    name: "Meiji — restauration impériale au Japon",
    context: "Fin du shogunat ; ouverture forcée ; modernisation rapide",
    people: "Empereur Meiji",
    category: "Politique",
    catSlug: "politique"
  },
  {
    era: "contemporain",
    major: false,
    date: "1869",
    name: "Ouverture du canal de Suez",
    context: "Lesseps ; raccourcit la route des Indes ; dette égyptienne",
    people: "Ferdinand de Lesseps",
    category: "Science",
    catSlug: "science"
  },
  {
    era: "contemporain",
    major: false,
    date: "1870",
    name: "Guerre franco-prussienne — défaite française",
    context: "Sedan ; Commune de Paris ; unification allemande",
    people: "Napoléon III, Bismarck",
    category: "Politique",
    catSlug: "politique"
  },
  {
    era: "contemporain",
    major: false,
    date: "1871",
    name: "Commune de Paris — première révolution ouvrière",
    context: "Gouvernement révolutionnaire ; Semaine sanglante ; 30 000 morts",
    people: "",
    category: "Politique",
    catSlug: "politique"
  },
  {
    era: "contemporain",
    major: false,
    date: "1872",
    name: "Yellowstone — premier parc national américain",
    context: "Protection de la nature ; modèle mondial",
    people: "Ulysses Grant",
    category: "Science",
    catSlug: "science"
  },
  {
    era: "contemporain",
    major: false,
    date: "1873",
    name: "Krach de Vienne — Grande Dépression 1873-1896",
    context: "Effondrement boursier ; déflation mondiale ; protectionnisme",
    people: "",
    category: "Politique",
    catSlug: "politique"
  },
  {
    era: "contemporain",
    major: false,
    date: "1874",
    name: "Impressionnisme — première exposition",
    context: "Monet, Renoir, Degas ; Salon des Refusés ; révolution artistique",
    people: "Claude Monet",
    category: "Culture",
    catSlug: "culture"
  },
  {
    era: "contemporain",
    major: false,
    date: "1875",
    name: "Traité de San Stefano — guerre russo-turque",
    context: "Grande Bulgarie ; congrès de Berlin annule ; crise balkanique",
    people: "Bismarck",
    category: "Politique",
    catSlug: "politique"
  },
  {
    era: "contemporain",
    major: false,
    date: "1876",
    name: "Custer — défaite de Little Bighorn",
    context: "Sioux et Cheyennes ; fin des guerres indiennes",
    people: "Sitting Bull, Crazy Horse",
    category: "Politique",
    catSlug: "politique"
  },
  {
    era: "contemporain",
    major: false,
    date: "1877",
    name: "Téléphone de Bell — première conversation",
    context: "\"Mr. Watson, come here\" ; révolution des communications",
    people: "Alexander Graham Bell",
    category: "Science",
    catSlug: "science"
  },
  {
    era: "contemporain",
    major: false,
    date: "1878",
    name: "Congrès de Berlin — reconfiguration des Balkans",
    context: "Fin de la guerre russo-turque ; équilibre européen",
    people: "Bismarck",
    category: "Politique",
    catSlug: "politique"
  },
  {
    era: "contemporain",
    major: false,
    date: "1879",
    name: "Loi des trois ans — armée allemande",
    context: "Service militaire prolongé ; course aux armements",
    people: "",
    category: "Politique",
    catSlug: "politique"
  },
  {
    era: "contemporain",
    major: false,
    date: "1880",
    name: "James Garfield assassiné",
    context: "Président américain ; Charles Guiteau ; Chester Arthur succède",
    people: "James Garfield",
    category: "Politique",
    catSlug: "politique"
  },
  {
    era: "contemporain",
    major: false,
    date: "1881",
    name: "Tsar Alexandre II assassiné",
    context: "Réformateur ; Narodnaïa Volia ; Alexandre III réactionnaire",
    people: "Alexandre II",
    category: "Politique",
    catSlug: "politique"
  },
  {
    era: "contemporain",
    major: false,
    date: "1882",
    name: "Triple Alliance — Allemagne, Autriche, Italie",
    context: "Contre la France ; Bismarck ; dissoute en 1915",
    people: "Bismarck",
    category: "Politique",
    catSlug: "politique"
  },
  {
    era: "contemporain",
    major: false,
    date: "1883",
    name: "Fondation de la Croix-Rouge américaine",
    context: "Clara Barton ; aide humanitaire internationale",
    people: "Clara Barton",
    category: "Culture",
    catSlug: "culture"
  },
  {
    era: "contemporain",
    major: false,
    date: "1884",
    name: "Conférence de Berlin — partage de l'Afrique",
    context: "Scramble for Africa ; 14 pays européens ; souveraineté fictive",
    people: "Bismarck",
    category: "Politique",
    catSlug: "politique"
  },
  {
    era: "contemporain",
    major: false,
    date: "1885",
    name: "Loi sur les sociétés anonymes britannique",
    context: "Limited liability ; essor du capitalisme moderne",
    people: "",
    category: "Politique",
    catSlug: "politique"
  },
  {
    era: "contemporain",
    major: false,
    date: "1886",
    name: "Statue de la Liberté inaugurée",
    context: "Cadeau de la France ; symbole de l'immigration",
    people: "Bartholdi, Eiffel",
    category: "Culture",
    catSlug: "culture"
  },
  {
    era: "contemporain",
    major: false,
    date: "1887",
    name: "Dawes Act — assimilation forcée des Amérindiens",
    context: "Division des réserves ; fin des tribus ; citoyenneté en 1924",
    people: "",
    category: "Politique",
    catSlug: "politique"
  },
  {
    era: "contemporain",
    major: false,
    date: "1888",
    name: "Wilhelm II empereur allemand",
    context: "Renvoie Bismarck ; Weltpolitik ; course aux colonies",
    people: "Guillaume II",
    category: "Politique",
    catSlug: "politique"
  },
  {
    era: "contemporain",
    major: false,
    date: "1889",
    name: "Tour Eiffel construite",
    context: "Exposition universelle ; symbole de la modernité",
    people: "Gustave Eiffel",
    category: "Culture",
    catSlug: "culture"
  },
  {
    era: "contemporain",
    major: false,
    date: "1890",
    name: "Wounded Knee — massacre des Lakotas",
    context: "Dernière bataille des guerres indiennes ; 300 morts",
    people: "",
    category: "Politique",
    catSlug: "politique"
  },
  {
    era: "contemporain",
    major: false,
    date: "1891",
    name: "Première centrale hydroélectrique — Niagara",
    context: "Tesla ; courant alternatif ; électrification mondiale",
    people: "Nikola Tesla",
    category: "Science",
    catSlug: "science"
  },
  {
    era: "contemporain",
    major: false,
    date: "1892",
    name: "Ellis Island — porte d'entrée des immigrants",
    context: "12 millions passent ; contrôles sanitaires ; rêve américain",
    people: "",
    category: "Culture",
    catSlug: "culture"
  },
  {
    era: "contemporain",
    major: false,
    date: "1893",
    name: "Crise bancaire américaine — Panic of 1893",
    context: "Dépression économique ; 500 banques font faillite",
    people: "",
    category: "Politique",
    catSlug: "politique"
  },
  {
    era: "contemporain",
    major: false,
    date: "1894",
    name: "Affaire Dreyfus — antisémitisme français",
    context: "Capitaine juif accusé ; Zola \"J'accuse\" ; séparation Église-État",
    people: "Alfred Dreyfus, Émile Zola",
    category: "Politique",
    catSlug: "politique"
  },
  {
    era: "contemporain",
    major: false,
    date: "1895",
    name: "Cinématographe Lumière — naissance du cinéma",
    context: "Première projection payante ; \"L'Arrivée d'un train\"",
    people: "Auguste et Louis Lumière",
    category: "Culture",
    catSlug: "culture"
  },
  {
    era: "contemporain",
    major: false,
    date: "1896",
    name: "Jeux Olympiques modernes — Athènes",
    context: "Pierre de Coubertin ; renaissance des JO antiques",
    people: "Pierre de Coubertin",
    category: "Culture",
    catSlug: "culture"
  },
  {
    era: "contemporain",
    major: false,
    date: "1897",
    name: "Guerre gréco-turque — Crète indépendante",
    context: "Intervention européenne ; autonomie crétoise",
    people: "",
    category: "Politique",
    catSlug: "politique"
  },
  {
    era: "contemporain",
    major: false,
    date: "1898",
    name: "Guerre hispano-américaine — Cuba et Philippines",
    context: "Maine coulé ; Guam, Porto Rico annexés ; empire américain",
    people: "Theodore Roosevelt",
    category: "Politique",
    catSlug: "politique"
  },
  {
    era: "contemporain",
    major: false,
    date: "1899",
    name: "Guerre des Boers — Afrique du Sud",
    context: "Concentration camps ; Milner ; Union sud-africaine 1910",
    people: "Cecil Rhodes",
    category: "Politique",
    catSlug: "politique"
  },
  {
    era: "contemporain",
    major: false,
    date: "1900",
    name: "Boxer Rebellion — Chine vs puissances occidentales",
    context: "Siège des légations ; protocole des Boxers ; fin des concessions",
    people: "",
    category: "Politique",
    catSlug: "politique"
  },
  {
    era: "contemporain",
    major: false,
    date: "1901",
    name: "Mort de Victoria — Édouard VII roi",
    context: "Fin de l'ère victorienne ; Entente cordiale 1904",
    people: "Édouard VII",
    category: "Politique",
    catSlug: "politique"
  },
  {
    era: "contemporain",
    major: false,
    date: "1902",
    name: "Cecil Rhodes — fin de l'impérialisme britannique",
    context: "Mort du visionnaire ; traité de Vereeniging termine la guerre des Boers",
    people: "Cecil Rhodes",
    category: "Politique",
    catSlug: "politique"
  },
  {
    era: "contemporain",
    major: false,
    date: "1903",
    name: "Traité de Panama — canal américain",
    context: "Révolution panaméenne ; contrôle du canal jusqu'en 1979",
    people: "Theodore Roosevelt",
    category: "Politique",
    catSlug: "politique"
  },
  {
    era: "contemporain",
    major: false,
    date: "1904",
    name: "Entente cordiale — France et Royaume-Uni",
    context: "Fin de 100 ans d'hostilité ; alliance contre l'Allemagne",
    people: "Édouard VII",
    category: "Politique",
    catSlug: "politique"
  },
  {
    era: "contemporain",
    major: false,
    date: "1905",
    name: "Révolution russe — dimanche rouge",
    context: "Manifestation pacifique ; 200 morts ; Nicolas II octroie la Douma",
    people: "Nicolas II",
    category: "Politique",
    catSlug: "politique"
  },
  {
    era: "contemporain",
    major: false,
    date: "1906",
    name: "Tremblement de terre de San Francisco",
    context: "Magnitude 7,9 ; 3 000 morts ; reconstruction moderne",
    people: "",
    category: "Science",
    catSlug: "science"
  },
  {
    era: "contemporain",
    major: false,
    date: "1907",
    name: "Crise bancaire internationale — Panic of 1907",
    context: "J.P. Morgan sauve Wall Street ; Federal Reserve créée en 1913",
    people: "J.P. Morgan",
    category: "Politique",
    catSlug: "politique"
  },
  {
    era: "contemporain",
    major: false,
    date: "1908",
    name: "Jeune-Turc — révolution constitutionnelle",
    context: "Comité Union et Progrès ; fin du sultanat absolu",
    people: "",
    category: "Politique",
    catSlug: "politique"
  },
  {
    era: "contemporain",
    major: false,
    date: "1909",
    name: "Blériot traverse la Manche en avion",
    context: "37 minutes ; premier vol transmanche ; aviation civile naît",
    people: "Louis Blériot",
    category: "Science",
    catSlug: "science"
  },
  {
    era: "contemporain",
    major: false,
    date: "1910",
    name: "Révolution mexicaine — Porfirio Díaz renversé",
    context: "Madero président ; révolution sociale ; 1 million de morts",
    people: "Francisco Madero",
    category: "Politique",
    catSlug: "politique"
  },
  {
    era: "contemporain",
    major: false,
    date: "1911",
    name: "Révolution chinoise — fin de l'empire Qing",
    context: "Sun Yat-sen ; République de Chine proclamée",
    people: "Sun Yat-sen",
    category: "Politique",
    catSlug: "politique"
  },
  {
    era: "contemporain",
    major: false,
    date: "1912",
    name: "Titanic coule — 1 517 morts",
    context: "Plus grand paquebot ; iceberg ; sécurité maritime révolutionnée",
    people: "",
    category: "Science",
    catSlug: "science"
  },
  {
    era: "contemporain",
    major: false,
    date: "1913",
    name: "Federal Reserve Act — banque centrale américaine",
    context: "Fin des paniques bancaires ; contrôle monétaire",
    people: "Woodrow Wilson",
    category: "Politique",
    catSlug: "politique"
  },
  {
    era: "contemporain",
    major: false,
    date: "1914",
    name: "Canal de Panama inauguré",
    context: "Roosevelt ; raccourcit les voyages transatlantiques",
    people: "Woodrow Wilson",
    category: "Science",
    catSlug: "science"
  },
  {
    era: "contemporain",
    major: false,
    date: "1915",
    name: "Génocide arménien — 1,5 million de morts",
    context: "Première négation d'un génocide ; reconnaissance internationale tardive",
    people: "",
    category: "Politique",
    catSlug: "politique"
  },
  {
    era: "contemporain",
    major: false,
    date: "1916",
    name: "Bataille de la Somme — 1 million de morts",
    context: "Première utilisation massive des chars ; guerre d'usure",
    people: "",
    category: "Politique",
    catSlug: "politique"
  },
  {
    era: "contemporain",
    major: false,
    date: "1917",
    name: "Déclaration Balfour — foyer national juif",
    context: "Arthur Balfour ; base de l'État d'Israël en 1948",
    people: "Arthur Balfour",
    category: "Politique",
    catSlug: "politique"
  },
  {
    era: "contemporain",
    major: false,
    date: "1919",
    name: "Traité de Versailles — paix punitive",
    context: "Allemagne coupable ; réparations ; Société des Nations",
    people: "Woodrow Wilson",
    category: "Politique",
    catSlug: "politique"
  },
  {
    era: "contemporain",
    major: false,
    date: "1920",
    name: "Prohibition aux États-Unis — 18e Amendement",
    context: "Interdiction de l'alcool ; Al Capone ; abrogé en 1933",
    people: "",
    category: "Politique",
    catSlug: "politique"
  },
  {
    era: "contemporain",
    major: false,
    date: "1921",
    name: "Insurrection irlandaise — traité anglo-irlandais",
    context: "État libre d'Irlande ; partition de l'Ulster",
    people: "",
    category: "Politique",
    catSlug: "politique"
  },
  {
    era: "contemporain",
    major: false,
    date: "1922",
    name: "Mussolini — marche sur Rome",
    context: "Dictature fasciste ; roi Victor-Emmanuel III capitule",
    people: "Benito Mussolini",
    category: "Politique",
    catSlug: "politique"
  },
  {
    era: "contemporain",
    major: false,
    date: "1923",
    name: "Hitler — putsch de la Brasserie",
    context: "Échec ; emprisonnement ; Mein Kampf écrit",
    people: "Adolf Hitler",
    category: "Politique",
    catSlug: "politique"
  },
  {
    era: "contemporain",
    major: false,
    date: "1924",
    name: "Lénine meurt — Staline succède",
    context: "Fin du léninisme ; début du stalinisme",
    people: "Vladimir Lénine, Joseph Staline",
    category: "Politique",
    catSlug: "politique"
  },
  {
    era: "contemporain",
    major: false,
    date: "1925",
    name: "Mein Kampf publié",
    context: "Hitler expose son programme ; best-seller européen",
    people: "Adolf Hitler",
    category: "Culture",
    catSlug: "culture"
  },
  {
    era: "contemporain",
    major: false,
    date: "1926",
    name: "Général Strike britannique — échec ouvrier",
    context: "9 jours ; Baldwin gouvernement ; fin du syndicalisme militant",
    people: "Stanley Baldwin",
    category: "Politique",
    catSlug: "politique"
  },
  {
    era: "contemporain",
    major: false,
    date: "1927",
    name: "Lindbergh traverse l'Atlantique en avion",
    context: "Solo ; New York-Paris ; héros américain",
    people: "Charles Lindbergh",
    category: "Science",
    catSlug: "science"
  },
  {
    era: "contemporain",
    major: false,
    date: "1928",
    name: "Alexander Fleming découvre la pénicilline",
    context: "Moisissure tue les bactéries ; révolution médicale",
    people: "Alexander Fleming",
    category: "Science",
    catSlug: "science"
  },
  {
    era: "contemporain",
    major: false,
    date: "1929",
    name: "Krach de Wall Street — Jeudi noir",
    context: "29 octobre ; début de la Grande Dépression",
    people: "",
    category: "Politique",
    catSlug: "politique"
  },
  {
    era: "contemporain",
    major: false,
    date: "1930",
    name: "Gandhi — marche du sel",
    context: "Désobéissance civile ; indépendance de l'Inde en 1947",
    people: "Mahatma Gandhi",
    category: "Politique",
    catSlug: "politique"
  },
  {
    era: "contemporain",
    major: false,
    date: "1931",
    name: "Empire State Building inauguré",
    context: "Plus haut bâtiment du monde ; symbole de l'Art Déco",
    people: "",
    category: "Culture",
    catSlug: "culture"
  },
  {
    era: "contemporain",
    major: false,
    date: "1932",
    name: "Chômage record — 25% aux USA",
    context: "Grande Dépression ; Hoovervilles ; New Deal en 1933",
    people: "Franklin Roosevelt",
    category: "Politique",
    catSlug: "politique"
  },
  {
    era: "contemporain",
    major: false,
    date: "1933",
    name: "New Deal — Roosevelt sauve l'Amérique",
    context: "Travaux publics ; sécurité sociale ; fin de la Dépression",
    people: "Franklin Roosevelt",
    category: "Politique",
    catSlug: "politique"
  },
  {
    era: "contemporain",
    major: false,
    date: "1934",
    name: "Nuit des Longs Couteaux — purge nazie",
    context: "Himmler élimine Röhm ; armée loyale à Hitler",
    people: "Heinrich Himmler",
    category: "Politique",
    catSlug: "politique"
  },
  {
    era: "contemporain",
    major: false,
    date: "1935",
    name: "Lois de Nuremberg — discrimination raciale",
    context: "Citoyenneté retirée aux Juifs ; mariage interdit",
    people: "",
    category: "Politique",
    catSlug: "politique"
  },
  {
    era: "contemporain",
    major: false,
    date: "1936",
    name: "Jeux Olympiques de Berlin — propagande nazie",
    context: "Jesse Owens ; Leni Riefenstahl ; boycott juif",
    people: "Adolf Hitler",
    category: "Culture",
    catSlug: "culture"
  },
  {
    era: "contemporain",
    major: false,
    date: "1937",
    name: "Picasso — Guernica",
    context: "Bombardement franquiste ; chef-d'œuvre anti-guerre",
    people: "Pablo Picasso",
    category: "Culture",
    catSlug: "culture"
  },
  {
    era: "contemporain",
    major: false,
    date: "1938",
    name: "Anschluss — annexion de l'Autriche",
    context: "Hitler entre à Vienne ; plébiscite truqué",
    people: "Adolf Hitler",
    category: "Politique",
    catSlug: "politique"
  },
  {
    era: "contemporain",
    major: false,
    date: "1939",
    name: "Pacte germano-soviétique — Ribbentrop-Molotov",
    context: "Partage de la Pologne ; Hitler et Staline alliés",
    people: "Adolf Hitler, Joseph Staline",
    category: "Politique",
    catSlug: "politique"
  },
  {
    era: "contemporain",
    major: false,
    date: "1940",
    name: "Occupation de la France — armistice",
    context: "Pétain ; zone libre ; Résistance naît",
    people: "Philippe Pétain",
    category: "Politique",
    catSlug: "politique"
  },
  {
    era: "contemporain",
    major: false,
    date: "1941",
    name: "Pearl Harbor — USA en guerre",
    context: "Roosevelt ; \"jour d'infamie\" ; alliance USA-URSS",
    people: "Franklin Roosevelt",
    category: "Politique",
    catSlug: "politique"
  },
  {
    era: "contemporain",
    major: false,
    date: "1942",
    name: "Bataille de Stalingrad — tournant de la guerre",
    context: "Friedrich Paulus capitule ; 800 000 morts",
    people: "Georgy Zhukov",
    category: "Politique",
    catSlug: "politique"
  },
  {
    era: "contemporain",
    major: false,
    date: "1943",
    name: "Conférence de Téhéran — Big Three",
    context: "Roosevelt, Churchill, Staline ; ouverture du second front",
    people: "",
    category: "Politique",
    catSlug: "politique"
  },
  {
    era: "contemporain",
    major: false,
    date: "1944",
    name: "Débarquement de Normandie — Jour J",
    context: "Overlord ; Eisenhower ; libération de l'Europe",
    people: "Dwight Eisenhower",
    category: "Politique",
    catSlug: "politique"
  },
  {
    era: "contemporain",
    major: false,
    date: "1945",
    name: "Conférence de Yalta — partage du monde",
    context: "Sphères d'influence ; ONU fondée ; Staline trahi",
    people: "",
    category: "Politique",
    catSlug: "politique"
  },
  {
    era: "contemporain",
    major: false,
    date: "1946",
    name: "Guerre civile chinoise — victoire communiste",
    context: "Mao Zedong ; République populaire en 1949",
    people: "Mao Zedong",
    category: "Politique",
    catSlug: "politique"
  },
  {
    era: "contemporain",
    major: false,
    date: "1947",
    name: "Indépendance de l'Inde et Pakistan",
    context: "Partition sanglante ; 1 million de morts",
    people: "Mahatma Gandhi",
    category: "Politique",
    catSlug: "politique"
  },
  {
    era: "contemporain",
    major: false,
    date: "1948",
    name: "Blocus de Berlin — pont aérien",
    context: "Staline vs Occident ; 2 millions de tonnes parachutées",
    people: "Harry Truman",
    category: "Politique",
    catSlug: "politique"
  },
  {
    era: "contemporain",
    major: false,
    date: "1949",
    name: "OTAN fondée — alliance atlantique",
    context: "Contre l'URSS ; article 5 : tous pour un",
    people: "Harry Truman",
    category: "Politique",
    catSlug: "politique"
  },
  {
    era: "contemporain",
    major: false,
    date: "1950",
    name: "Guerre de Corée — division perpétuelle",
    context: "ONU vs Chine ; 38e parallèle ; armistice 1953",
    people: "",
    category: "Politique",
    catSlug: "politique"
  },
  {
    era: "contemporain",
    major: false,
    date: "1951",
    name: "Festival de Cannes — naissance du cinéma mondial",
    context: "Palme d'or ; compétition internationale",
    people: "",
    category: "Culture",
    catSlug: "culture"
  },
  {
    era: "contemporain",
    major: false,
    date: "1952",
    name: "Première bombe H américaine",
    context: "Ivy Mike ; 10 mégatonnes ; course aux armements",
    people: "",
    category: "Science",
    catSlug: "science"
  },
  {
    era: "contemporain",
    major: false,
    date: "1954",
    name: "Procès de Nuremberg — crimes de guerre",
    context: "Tribunal international ; Eichmann jugé en 1961",
    people: "",
    category: "Politique",
    catSlug: "politique"
  },
  {
    era: "contemporain",
    major: false,
    date: "1955",
    name: "Bandung — conférence des non-alignés",
    context: "25 pays asiatiques et africains ; Nehru, Sukarno",
    people: "Jawaharlal Nehru",
    category: "Politique",
    catSlug: "politique"
  },
  {
    era: "contemporain",
    major: false,
    date: "1956",
    name: "Crise de Suez — échec franco-britannique",
    context: "Nasser nationalise ; Eden démissionne",
    people: "Gamal Abdel Nasser",
    category: "Politique",
    catSlug: "politique"
  },
  {
    era: "contemporain",
    major: false,
    date: "1957",
    name: "Traité de Rome — Communauté économique européenne",
    context: "6 pays fondateurs ; Marché commun ; euro en 1999",
    people: "",
    category: "Politique",
    catSlug: "politique"
  },
  {
    era: "contemporain",
    major: false,
    date: "1958",
    name: "De Gaulle — Cinquième République",
    context: "Constitution gaullienne ; présidentialisation",
    people: "Charles de Gaulle",
    category: "Politique",
    catSlug: "politique"
  },
  {
    era: "contemporain",
    major: false,
    date: "1959",
    name: "Révolution cubaine — Castro au pouvoir",
    context: "Batista renversé ; embargo américain",
    people: "Fidel Castro",
    category: "Politique",
    catSlug: "politique"
  },
  {
    era: "contemporain",
    major: false,
    date: "1960",
    name: "Pilule contraceptive approuvée",
    context: "Révolution sexuelle ; contrôle des naissances",
    people: "",
    category: "Science",
    catSlug: "science"
  },
  {
    era: "contemporain",
    major: false,
    date: "1961",
    name: "Mur de Berlin construit",
    context: "Barrière physique ; guerre froide concrète",
    people: "Nikita Khrouchtchev",
    category: "Politique",
    catSlug: "politique"
  },
  {
    era: "contemporain",
    major: false,
    date: "1962",
    name: "Indépendance de l'Algérie — accords d'Évian",
    context: "De Gaulle ; 1 million de pieds-noirs rapatriés",
    people: "Charles de Gaulle",
    category: "Politique",
    catSlug: "politique"
  },
  {
    era: "contemporain",
    major: false,
    date: "1963",
    name: "Marche sur Washington — \"I have a dream\"",
    context: "250 000 personnes ; droits civiques",
    people: "Martin Luther King",
    category: "Politique",
    catSlug: "politique"
  },
  {
    era: "contemporain",
    major: false,
    date: "1964",
    name: "Guerre du Vietnam — tonkinien incident",
    context: "Escalade américaine ; 3 millions de morts",
    people: "Lyndon Johnson",
    category: "Politique",
    catSlug: "politique"
  },
  {
    era: "contemporain",
    major: false,
    date: "1965",
    name: "Voting Rights Act — droits de vote afro-américains",
    context: "Fin de la discrimination électorale",
    people: "Lyndon Johnson",
    category: "Politique",
    catSlug: "politique"
  },
  {
    era: "contemporain",
    major: false,
    date: "1966",
    name: "Révolution culturelle chinoise",
    context: "Mao purge les modérés ; Garde rouge",
    people: "Mao Zedong",
    category: "Politique",
    catSlug: "politique"
  },
  {
    era: "contemporain",
    major: false,
    date: "1967",
    name: "Guerre des Six Jours — Israël victorieux",
    context: "Territoires occupés ; guerre du Kippour 1973",
    people: "",
    category: "Politique",
    catSlug: "politique"
  },
  {
    era: "contemporain",
    major: false,
    date: "1968",
    name: "Mai 68 — révolte mondiale",
    context: "Étudiants ; contre-culture ; De Gaulle s'enfuit",
    people: "Charles de Gaulle",
    category: "Politique",
    catSlug: "politique"
  },
  {
    era: "contemporain",
    major: false,
    date: "1969",
    name: "Homme sur la Lune — Apollo 11",
    context: "Armstrong ; \"un petit pas pour l'homme\"",
    people: "Neil Armstrong",
    category: "Science",
    catSlug: "science"
  },
  {
    era: "contemporain",
    major: false,
    date: "1970",
    name: "Création de l'Environmental Protection Agency",
    context: "Protection de l'environnement ; Nixon",
    people: "Richard Nixon",
    category: "Science",
    catSlug: "science"
  },
  {
    era: "contemporain",
    major: false,
    date: "1971",
    name: "Dollars non convertible en or",
    context: "Fin de Bretton Woods ; monnaies flottantes",
    people: "Richard Nixon",
    category: "Politique",
    catSlug: "politique"
  },
  {
    era: "contemporain",
    major: false,
    date: "1972",
    name: "Nixon en Chine — ouverture",
    context: "Kissinger ; fin de l'isolement chinois",
    people: "Richard Nixon",
    category: "Politique",
    catSlug: "politique"
  },
  {
    era: "contemporain",
    major: false,
    date: "1973",
    name: "Chili — coup d'État de Pinochet",
    context: "Allende renversé ; dictature ; assassinat",
    people: "Augusto Pinochet",
    category: "Politique",
    catSlug: "politique"
  },
  {
    era: "contemporain",
    major: false,
    date: "1974",
    name: "Scandale du Watergate — Nixon démissionne",
    context: "Enquête du Washington Post ; impeachment",
    people: "Richard Nixon",
    category: "Politique",
    catSlug: "politique"
  },
  {
    era: "contemporain",
    major: false,
    date: "1975",
    name: "Fin de la guerre du Vietnam",
    context: "Chute de Saïgon ; réunification communiste",
    people: "",
    category: "Politique",
    catSlug: "politique"
  },
  {
    era: "contemporain",
    major: false,
    date: "1976",
    name: "Mao Zedong meurt — Deng Xiaoping succède",
    context: "Fin de la révolution culturelle ; ouverture économique",
    people: "Deng Xiaoping",
    category: "Politique",
    catSlug: "politique"
  },
  {
    era: "contemporain",
    major: false,
    date: "1977",
    name: "Apple II — micro-ordinateur personnel",
    context: "Jobs et Wozniak ; informatique grand public",
    people: "Steve Jobs, Steve Wozniak",
    category: "Science",
    catSlug: "science"
  },
  {
    era: "contemporain",
    major: false,
    date: "1978",
    name: "Naissance de Louise Brown — premier bébé-éprouvette",
    context: "FIV ; révolution de la procréation médicalisée",
    people: "",
    category: "Science",
    catSlug: "science"
  },
  {
    era: "contemporain",
    major: false,
    date: "1979",
    name: "Révolution iranienne — Khomeini",
    context: "Shah renversé ; République islamique",
    people: "Ruhollah Khomeini",
    category: "Politique",
    catSlug: "politique"
  },
  {
    era: "contemporain",
    major: false,
    date: "1980",
    name: "Guerre Iran-Irak — 1 million de morts",
    context: "Saddam Hussein ; armes chimiques",
    people: "Saddam Hussein",
    category: "Politique",
    catSlug: "politique"
  },
  {
    era: "contemporain",
    major: false,
    date: "1981",
    name: "IBM PC — standard de l'informatique",
    context: "Compatible ; Microsoft DOS ; explosion du marché",
    people: "",
    category: "Science",
    catSlug: "science"
  },
  {
    era: "contemporain",
    major: false,
    date: "1982",
    name: "Falklands War — Thatcher victorieuse",
    context: "Argentine vs Royaume-Uni ; patriotisme britannique",
    people: "Margaret Thatcher",
    category: "Politique",
    catSlug: "politique"
  },
  {
    era: "contemporain",
    major: false,
    date: "1983",
    name: "Star Wars — initiative de défense stratégique",
    context: "Reagan ; course aux armements spatiaux",
    people: "Ronald Reagan",
    category: "Science",
    catSlug: "science"
  },
  {
    era: "contemporain",
    major: false,
    date: "1984",
    name: "Macintosh — interface graphique",
    context: "Souris ; icônes ; révolution de l'ergonomie",
    people: "Steve Jobs",
    category: "Science",
    catSlug: "science"
  },
  {
    era: "contemporain",
    major: false,
    date: "1985",
    name: "Gorbatchev — perestroïka et glasnost",
    context: "Réformes soviétiques ; fin de la guerre froide",
    people: "Mikhaïl Gorbatchev",
    category: "Politique",
    catSlug: "politique"
  },
  {
    era: "contemporain",
    major: false,
    date: "1986",
    name: "Chernobyl — catastrophe nucléaire",
    context: "Ukraine ; nuage radioactif ; transparence forcée",
    people: "",
    category: "Science",
    catSlug: "science"
  },
  {
    era: "contemporain",
    major: false,
    date: "1987",
    name: "Accords d'Oslo — paix israélo-palestinienne",
    context: "Rabin et Arafat ; reconnaissance mutuelle",
    people: "Yitzhak Rabin, Yasser Arafat",
    category: "Politique",
    catSlug: "politique"
  },
  {
    era: "contemporain",
    major: false,
    date: "1988",
    name: "Fin de la guerre Iran-Irak",
    context: "Résolution 598 ; Saddam vaincu mais intact",
    people: "",
    category: "Politique",
    catSlug: "politique"
  },
  {
    era: "contemporain",
    major: false,
    date: "1989",
    name: "Tiananmen — massacre démocratique",
    context: "Char contre les chars ; Deng Xiaoping",
    people: "Deng Xiaoping",
    category: "Politique",
    catSlug: "politique"
  },
  {
    era: "contemporain",
    major: false,
    date: "1990",
    name: "Unification allemande — fin de la division",
    context: "Chute du mur ; Helmut Kohl ; Deutsche Mark",
    people: "Helmut Kohl",
    category: "Politique",
    catSlug: "politique"
  },
  {
    era: "contemporain",
    major: false,
    date: "1991",
    name: "Guerre du Golfe — libération du Koweït",
    context: "Coalition internationale ; Saddam Hussein",
    people: "George H.W. Bush",
    category: "Politique",
    catSlug: "politique"
  },
  {
    era: "contemporain",
    major: false,
    date: "1992",
    name: "Traité de Maastricht — Union européenne",
    context: "Citoyenneté européenne ; monnaie unique",
    people: "",
    category: "Politique",
    catSlug: "politique"
  },
  {
    era: "contemporain",
    major: false,
    date: "1993",
    name: "Accords d'Oslo II — autonomie palestinienne",
    context: "Gaza et Jéricho ; gouvernement palestinien",
    people: "",
    category: "Politique",
    catSlug: "politique"
  },
  {
    era: "contemporain",
    major: false,
    date: "1994",
    name: "Nelson Mandela président — fin de l'apartheid",
    context: "Prisonnier politique ; réconciliation nationale",
    people: "Nelson Mandela",
    category: "Politique",
    catSlug: "politique"
  },
  {
    era: "contemporain",
    major: false,
    date: "1995",
    name: "Srebrenica — génocide bosniaque",
    context: "7 000 musulmans massacrés ; Mladić jugé",
    people: "",
    category: "Politique",
    catSlug: "politique"
  },
  {
    era: "contemporain",
    major: false,
    date: "1996",
    name: "Clonage de Dolly — brebis écossaise",
    context: "Ian Wilmut ; débat éthique mondial",
    people: "Ian Wilmut",
    category: "Science",
    catSlug: "science"
  },
  {
    era: "contemporain",
    major: false,
    date: "1997",
    name: "Mort de Diana — princesse des cœurs",
    context: "Accident à Paris ; deuil national mondial",
    people: "Diana Spencer",
    category: "Culture",
    catSlug: "culture"
  },
  {
    era: "contemporain",
    major: false,
    date: "1998",
    name: "Procès de Clinton — impeachment",
    context: "Affaire Lewinsky ; acquitté par le Sénat",
    people: "Bill Clinton",
    category: "Politique",
    catSlug: "politique"
  },
  {
    era: "contemporain",
    major: false,
    date: "1999",
    name: "Euro — monnaie unique européenne",
    context: "11 pays ; Banque centrale européenne",
    people: "",
    category: "Politique",
    catSlug: "politique"
  },
  {
    era: "contemporain",
    major: false,
    date: "2000",
    name: "Élection Bush vs Gore — décision de la Cour suprême",
    context: "Floride ; 537 voix ; démocratie américaine contestée",
    people: "George W. Bush",
    category: "Politique",
    catSlug: "politique"
  },
  {
    era: "contemporain",
    major: false,
    date: "2001",
    name: "Attentats du 11 septembre — Al-Qaïda",
    context: "3 000 morts ; Afghanistan envahi ; Patriot Act",
    people: "George W. Bush",
    category: "Politique",
    catSlug: "politique"
  },
  {
    era: "contemporain",
    major: false,
    date: "2002",
    name: "Euro physique — billets et pièces",
    context: "Fin du franc ; économie européenne intégrée",
    people: "",
    category: "Politique",
    catSlug: "politique"
  },
  {
    era: "contemporain",
    major: false,
    date: "2003",
    name: "Invasion de l'Irak — armes de destruction massive",
    context: "Saddam renversé ; armes introuvables ; chaos",
    people: "George W. Bush",
    category: "Politique",
    catSlug: "politique"
  },
  {
    era: "contemporain",
    major: false,
    date: "2004",
    name: "Tsunami asiatique — 230 000 morts",
    context: "Magnitude 9,1 ; alerte tsunami mondiale",
    people: "",
    category: "Science",
    catSlug: "science"
  },
  {
    era: "contemporain",
    major: false,
    date: "2005",
    name: "Ouragan Katrina — Nouvelle-Orléans dévastée",
    context: "Digues rompues ; 1 800 morts ; gestion catastrophique",
    people: "George W. Bush",
    category: "Science",
    catSlug: "science"
  },
  {
    era: "contemporain",
    major: false,
    date: "2006",
    name: "Twitter lancé — microblogging",
    context: "Jack Dorsey ; révolution des réseaux sociaux",
    people: "Jack Dorsey",
    category: "Science",
    catSlug: "science"
  },
  {
    era: "contemporain",
    major: false,
    date: "2007",
    name: "iPhone — smartphone révolutionnaire",
    context: "Jobs ; App Store ; économie des applications",
    people: "Steve Jobs",
    category: "Science",
    catSlug: "science"
  },
  {
    era: "contemporain",
    major: false,
    date: "2008",
    name: "Crise financière — Lehman Brothers",
    context: "Subprimes ; sauvetage bancaire ; récession mondiale",
    people: "",
    category: "Politique",
    catSlug: "politique"
  },
  {
    era: "contemporain",
    major: false,
    date: "2009",
    name: "Obama — premier président afro-américain",
    context: "Hope ; réforme santé ; Nobel de la paix",
    people: "Barack Obama",
    category: "Politique",
    catSlug: "politique"
  },
  {
    era: "contemporain",
    major: false,
    date: "2010",
    name: "Deepwater Horizon — marée noire",
    context: "Golfe du Mexique ; 5 millions de barils ; BP",
    people: "",
    category: "Science",
    catSlug: "science"
  },
  {
    era: "contemporain",
    major: false,
    date: "2011",
    name: "Printemps arabe — révolutions",
    context: "Tunisie, Égypte, Libye ; dictatures renversées",
    people: "",
    category: "Politique",
    catSlug: "politique"
  },
  {
    era: "contemporain",
    major: false,
    date: "2012",
    name: "Mort de Ben Laden — opération Neptune Spear",
    context: "Abbottabad ; Obama ; fin symbolique",
    people: "Barack Obama",
    category: "Politique",
    catSlug: "politique"
  },
  {
    era: "contemporain",
    major: false,
    date: "2013",
    name: "Snowden — révélations NSA",
    context: "Surveillance mondiale ; débat vie privée",
    people: "Edward Snowden",
    category: "Politique",
    catSlug: "politique"
  },
  {
    era: "contemporain",
    major: false,
    date: "2014",
    name: "Épidémie Ebola — Afrique de l'Ouest",
    context: "11 000 morts ; OMS critiquée ; vaccins développés",
    people: "",
    category: "Science",
    catSlug: "science"
  },
  {
    era: "contemporain",
    major: false,
    date: "2015",
    name: "Accords de Paris — climat",
    context: "195 pays ; +1,5°C ; COP21 historique",
    people: "",
    category: "Science",
    catSlug: "science"
  },
  {
    era: "contemporain",
    major: false,
    date: "2016",
    name: "Brexit — Royaume-Uni quitte l'UE",
    context: "52% Leave ; Cameron démissionne ; négociations",
    people: "David Cameron",
    category: "Politique",
    catSlug: "politique"
  },
  {
    era: "contemporain",
    major: false,
    date: "2017",
    name: "Trump président — \"America First\"",
    context: "Populisme ; murs ; retrait accords climatiques",
    people: "Donald Trump",
    category: "Politique",
    catSlug: "politique"
  },
  {
    era: "contemporain",
    major: false,
    date: "2018",
    name: "Mondial Russie — VAR controversée",
    context: "France championne ; Mbappé révélation",
    people: "",
    category: "Culture",
    catSlug: "culture"
  },
  {
    era: "contemporain",
    major: false,
    date: "2019",
    name: "Incendies australiens — climat",
    context: "1 milliard d'animaux morts ; Morrison critiqué",
    people: "",
    category: "Science",
    catSlug: "science"
  },
  {
    era: "contemporain",
    major: false,
    date: "2020",
    name: "COVID-19 — pandémie mondiale",
    context: "8 millions de morts ; confinement ; vaccins ARN",
    people: "",
    category: "Science",
    catSlug: "science"
  },
  {
    era: "contemporain",
    major: false,
    date: "2021",
    name: "Assaut du Capitole — insurrection",
    context: "Trump ; élection contestée ; démocratie menacée",
    people: "Donald Trump",
    category: "Politique",
    catSlug: "politique"
  },
  {
    era: "contemporain",
    major: false,
    date: "2022",
    name: "Invasion russe de l'Ukraine",
    context: "Zelensky ; résistance ; sanctions occidentales",
    people: "Vladimir Poutine, Volodymyr Zelensky",
    category: "Politique",
    catSlug: "politique"
  },
  {
    era: "contemporain",
    major: false,
    date: "2023",
    name: "IA générative — ChatGPT explose",
    context: "OpenAI ; transformation du travail ; régulation",
    people: "Sam Altman",
    category: "Science",
    catSlug: "science"
  },
  {
    era: "contemporain",
    major: false,
    date: "2024",
    name: "Élections américaines — Trump vs Harris",
    context: "Bataille judiciaire ; démocratie américaine testée",
    people: "Donald Trump, Kamala Harris",
    category: "Politique",
    catSlug: "politique"
  },
  {
    era: "contemporain",
    major: false,
    date: "2025",
    name: "IA omniprésente — DeepSeek et Grok",
    context: "Modèles open-source ; démocratisation ; éthique",
    people: "",
    category: "Science",
    catSlug: "science"
  },
  {
    era: "contemporain",
    major: false,
    date: "2026",
    name: "Fusion nucléaire — énergie illimitée ?",
    context: "ITER ; seuil de rentabilité ; révolution énergétique",
    people: "",
    category: "Science",
    catSlug: "science"
  }
];

// Main processing
async function main() {
  try {
    console.log('Reading timeline.json...');
    const data = JSON.parse(fs.readFileSync(TIMELINE_FILE, 'utf8'));
    
    console.log(`Original events count: ${data.events.length}`);
    
    // Filter out "repère chronologique" events
    const filteredEvents = data.events.filter(event => 
      !event.name.includes('Repere chronologique') && 
      !event.name.includes('repère chronologique')
    );
    
    console.log(`After filtering: ${filteredEvents.length} events`);
    
    // Add new events
    const allEvents = [...filteredEvents, ...ADDITIONAL_EVENTS];
    
    console.log(`After adding new events: ${allEvents.length} events`);
    
    // Sort events by date
    const sortedEvents = allEvents.sort((a, b) => {
      const dateA = parseDate(a.date);
      const dateB = parseDate(b.date);
      return dateA - dateB;
    });
    
    console.log('Events sorted chronologically');
    
    // Update the data
    data.events = sortedEvents;
    
    // Write back to file
    fs.writeFileSync(TIMELINE_FILE, JSON.stringify(data, null, 2), 'utf8');
    
    console.log('Timeline updated successfully!');
    console.log(`Final count: ${data.events.length} events`);
    
  } catch (error) {
    console.error('Error processing timeline:', error);
    process.exit(1);
  }
}

main();