const featuredDatesLimit = 150;
const searchInput = document.getElementById('searchInput');
const detailPage = document.getElementById('detailPage');
const detailKicker = document.getElementById('detailKicker');
const detailDate = document.getElementById('detailDate');
const detailTitle = document.getElementById('detailTitle');
const detailSummary = document.getElementById('detailSummary');
const detailBullets = document.getElementById('detailBullets');
const detailArticleTitle = document.getElementById('detailArticleTitle');
const detailArticleBody = document.getElementById('detailArticleBody');
const detailMeta = document.getElementById('detailMeta');
const detailBackLink = document.getElementById('detailBackLink');
const detailSearchLink = document.getElementById('detailSearchLink');
const urlParams = new URLSearchParams(window.location.search);
const state = { 
  era: 'all', 
  type: 'all', 
  search: '',
  currentView: 'timeline' // 'timeline', 'countries', 'stats'
};

// ══════════════════ VIEW ROUTER ══════════════════
function setView(viewName) {
  state.currentView = viewName;
  
  // Update Tabs UI
  document.querySelectorAll('.nav-tab').forEach(tab => {
    tab.classList.toggle('active', tab.dataset.view === viewName);
  });
  
  // Update Containers UI
  document.querySelectorAll('.view-container').forEach(container => {
    container.classList.toggle('active', container.id === `view-${viewName}`);
  });
  
  // Rebuild Sidebar based on view
  buildSidebarContent();
  
  // Specific view logic
  if (viewName === 'countries') {
    renderCountriesList();
  } else if (viewName === 'stats') {
    renderStatsView();
  }
}

document.querySelectorAll('.nav-tab').forEach(tab => {
  tab.addEventListener('click', () => setView(tab.dataset.view));
});

const eraConfigs = {
  prehist: { label: 'Préhistoire', kind: 'ère' },
  antiquite: { label: 'Antiquité', kind: 'ère' },
  'moyen-age': { label: 'Moyen Âge', kind: 'ère' },
  modernes: { label: 'Temps modernes', kind: 'ère' },
  contemporain: { label: 'Époque contemporaine', kind: 'ère' },
  top50: { label: 'Top 150', kind: 'sélection' }
};

const supplementalEventsByEra = {
  prehist: [
    { date: '≈ 2 600 000 av. J.-C.', name: 'Premières industries lithiques oldowayennes d’Afrique de l’Est', context: 'Les galets aménagés montrent une production répétée d’outils et un apprentissage technique.', people: 'Homo habilis', category: 'Science' },
    { date: '≈ 1 400 000 av. J.-C.', name: 'Développement du biface acheuléen', context: 'L’outil standardisé témoigne d’une meilleure planification technique et d’une longue transmission culturelle.', people: 'Homo erectus', category: 'Science' },
    { date: '≈ 700 000 av. J.-C.', name: 'Occupation humaine durable de l’Europe occidentale', context: 'Les sites européens attestent une adaptation progressive aux climats tempérés puis froids.', category: 'Exploration' },
    { date: '≈ 120 000 av. J.-C.', name: 'Sépultures néandertaliennes attestées au Proche-Orient', context: 'Les inhumations suggèrent des comportements symboliques et des formes de rites funéraires.', people: 'Homo neanderthalensis', category: 'Culture' },
    { date: '≈ 45 000 av. J.-C.', name: 'Arrivée d’Homo sapiens en Europe', context: 'La diffusion de Sapiens transforme les cultures matérielles et l’occupation du continent.', category: 'Exploration' },
    { date: '≈ 23 000 av. J.-C.', name: 'Maximum glaciaire du Dernier Âge glaciaire', context: 'Le climat mondial très froid modifie les migrations humaines, la faune et les paysages.', category: 'Science' },
    { date: '≈ 9 600 av. J.-C.', name: 'Göbekli Tepe : sanctuaires monumentaux en Anatolie', context: 'Les piliers sculptés indiquent des rassemblements rituels antérieurs aux grandes villes agricoles.', category: 'Culture' },
    { date: '≈ 6 500 av. J.-C.', name: 'Diffusion du Néolithique en Europe du Sud-Est', context: 'Agriculture, élevage et céramique se propagent des Balkans vers le continent européen.', category: 'Exploration' },
    { date: '≈ 4 000 av. J.-C.', name: 'Premières grandes nécropoles mégalithiques atlantiques', context: 'Dolmens et tombes collectives manifestent des sociétés plus hiérarchisées et organisées.', category: 'Culture' },
    { date: '≈ 3 300 av. J.-C.', name: 'Ötzi, homme des glaces des Alpes', context: 'Son équipement offre une photographie exceptionnelle de la vie chalcolithique européenne.', category: 'Science' },
    { date: '≈ 1 900 000 av. J.-C.', name: 'Premiers peuplements du Caucase attestés à Dmanisi', context: 'Les fossiles géorgiens montrent une sortie d’Afrique plus ancienne qu’on ne le pensait.', category: 'Exploration' },
    { date: '≈ 800 000 av. J.-C.', name: 'Premières traces de foyers aménagés en Eurasie', context: 'Le contrôle du feu transforme l’alimentation, la protection et l’occupation des milieux froids.', category: 'Science' },
    { date: '≈ 100 000 av. J.-C.', name: 'Parures en coquillage au Levant et en Afrique du Nord', context: 'Ces ornements témoignent de réseaux symboliques et d’identités de groupe plus affirmées.', category: 'Culture' },
    { date: '≈ 18 000 av. J.-C.', name: 'Solutréen et perfectionnement des pointes de chasse', context: 'Les techniques lithiques deviennent extrêmement fines et spécialisées en Europe occidentale.', category: 'Science' },
    { date: '≈ 8 500 av. J.-C.', name: 'Premiers villages agricoles d’Anatolie centrale', context: 'La sédentarisation s’accompagne d’architectures plus durables et d’une économie mixte.', category: 'Politique' },
    { date: '≈ 5 000 av. J.-C.', name: 'Expansion des cultures néolithiques en Europe occidentale', context: 'Les sociétés d’agriculteurs gagnent la façade atlantique et transforment les paysages.', category: 'Exploration' }
  ],
  antiquite: [
    { date: '≈ 2 700 av. J.-C.', name: 'Début de la civilisation minoenne en Crète', context: 'Palais, échanges maritimes et écriture linéaire A annoncent une Méditerranée déjà connectée.', category: 'Culture' },
    { date: '≈ 1 600 av. J.-C.', name: 'Apogée mycénienne en Grèce', context: 'Des royaumes guerriers dominent la mer Égée et inspireront plus tard la tradition homérique.', category: 'Politique' },
    { date: '≈ 1 050 av. J.-C.', name: 'Diffusion de l’alphabet phénicien', context: 'Ce système d’écriture simple facilite les échanges et inspire les alphabets grec puis latin.', category: 'Culture' },
    { date: '814 av. J.-C.', name: 'Fondation traditionnelle de Carthage', context: 'La cité phénicienne devient une grande puissance commerciale et maritime de Méditerranée.', people: 'Didon selon la tradition', category: 'Politique' },
    { date: '776 av. J.-C.', name: 'Premiers Jeux olympiques grecs traditionnellement datés', context: 'Le sanctuaire d’Olympie devient un rendez-vous panhellénique majeur.', category: 'Culture' },
    { date: '753 av. J.-C.', name: 'Fondation légendaire de Rome', context: 'Ce repère structure la mémoire romaine et la narration politique de la cité.', people: 'Romulus et Rémus', category: 'Politique' },
    { date: '509 av. J.-C.', name: 'Naissance de la République romaine', context: 'La chute des rois marque le début d’institutions républicaines durables.', category: 'Politique' },
    { date: '499 av. J.-C.', name: 'Révolte ionienne contre les Perses', context: 'Elle ouvre le cycle des guerres médiques entre Grecs et Perses.', category: 'Politique' },
    { date: '490 av. J.-C.', name: 'Bataille de Marathon', context: 'La victoire athénienne devient un symbole majeur de résistance face à l’Empire perse.', category: 'Politique' },
    { date: '443 av. J.-C.', name: 'Périclès domine la vie politique d’Athènes', context: 'Le Parthénon, la démocratie athénienne et l’impérialisme maritime atteignent leur apogée.', people: 'Périclès', category: 'Culture' },
    { date: '431–404 av. J.-C.', name: 'Guerre du Péloponnèse', context: 'Athènes et Sparte épuisent le monde grec dans un conflit long et destructeur.', category: 'Politique' },
    { date: '221 av. J.-C.', name: 'Qin Shi Huang unifie la Chine', context: 'Mesures, écriture et administration sont standardisées à l’échelle impériale.', people: 'Qin Shi Huang', category: 'Politique' },
    { date: '146 av. J.-C.', name: 'Rome détruit Carthage', context: 'La troisième guerre punique consacre la domination romaine en Méditerranée occidentale.', category: 'Politique' },
    { date: '44 av. J.-C.', name: 'Assassinat de Jules César', context: 'Le meurtre relance les guerres civiles et précipite la fin de la République.', people: 'Jules César, Brutus, Cassius', category: 'Politique' },
    { date: '79', name: 'Éruption du Vésuve : destruction de Pompéi et Herculanum', context: 'La catastrophe offre un témoignage archéologique exceptionnel sur la vie romaine.', category: 'Science' },
    { date: '594 av. J.-C.', name: 'Réformes de Solon à Athènes', context: 'Les bases d’un nouvel équilibre civique et juridique sont posées dans la cité grecque.', people: 'Solon', category: 'Politique' },
    { date: '480 av. J.-C.', name: 'Bataille navale de Salamine', context: 'La flotte grecque repousse les Perses et sauve l’indépendance des cités helléniques.', category: 'Politique' },
    { date: '399 av. J.-C.', name: 'Procès et mort de Socrate', context: 'La condamnation du philosophe devient un épisode fondateur de l’histoire intellectuelle occidentale.', people: 'Socrate', category: 'Culture' },
    { date: '334 av. J.-C.', name: 'Alexandre le Grand lance sa conquête de l’Empire perse', context: 'Une expansion fulgurante diffuse durablement la culture hellénistique de la Méditerranée à l’Asie.', people: 'Alexandre le Grand', category: 'Exploration' },
    { date: '31 av. J.-C.', name: 'Bataille d’Actium', context: 'La victoire d’Octave sur Antoine et Cléopâtre ouvre la voie à l’Empire romain.', people: 'Octave, Marc Antoine, Cléopâtre', category: 'Politique' },
    { date: '64', name: 'Grand incendie de Rome sous Néron', context: 'Le désastre urbain marque profondément la capitale impériale et nourrit les persécutions.', people: 'Néron', category: 'Politique' },
    { date: '212', name: 'Édit de Caracalla', context: 'La citoyenneté romaine est étendue à presque tous les hommes libres de l’Empire.', people: 'Caracalla', category: 'Politique' }
  ],
  'moyen-age': [
    { date: '711', name: 'Conquête musulmane de la péninsule Ibérique', context: 'La chute rapide du royaume wisigoth ouvre l’histoire d’al-Andalus.', category: 'Politique' },
    { date: '793', name: 'Raid viking contre le monastère de Lindisfarne', context: 'L’événement marque symboliquement le début des grandes incursions vikings.', category: 'Politique' },
    { date: '987', name: 'Hugues Capet devient roi de France', context: 'La dynastie capétienne s’installe durablement au cœur de l’histoire française.', people: 'Hugues Capet', category: 'Politique' },
    { date: '1066', name: 'Domesday Book en préparation après la conquête normande', context: 'Le grand inventaire foncier anglais illustre l’administration du nouveau pouvoir normand.', category: 'Politique' },
    { date: '1098', name: 'Fondation de l’ordre cistercien', context: 'L’ordre réforme la vie monastique et devient une puissance économique et spirituelle.', category: 'Culture' },
    { date: '1122', name: 'Concordat de Worms', context: 'Le compromis met fin à la querelle des Investitures entre papauté et Empire.', category: 'Politique' },
    { date: '1189–1192', name: 'Troisième Croisade', context: 'Richard Cœur de Lion, Philippe Auguste et Frédéric Barberousse affrontent Saladin.', category: 'Politique' },
    { date: '1204', name: 'Saccage de Constantinople par la quatrième croisade', context: 'Le monde byzantin est durablement affaibli par les croisés latins.', category: 'Politique' },
    { date: '1231', name: 'Inquisition pontificale institutionnalisée', context: 'La papauté met en place des tribunaux spécialisés contre les hérésies.', category: 'Culture' },
    { date: '1274', name: 'Mort de Thomas d’Aquin', context: 'La scolastique atteint un sommet avec l’articulation de la foi et de la raison.', people: 'Thomas d’Aquin', category: 'Culture' },
    { date: '1302', name: 'États généraux convoqués en France', context: 'Le roi cherche un appui politique élargi dans son conflit avec la papauté.', category: 'Politique' },
    { date: '1307', name: 'Arrestation des Templiers', context: 'Philippe le Bel frappe l’ordre du Temple et renforce la monarchie.', category: 'Politique' },
    { date: '1358', name: 'Grande Jacquerie en France', context: 'Les campagnes se soulèvent dans un contexte de guerre, d’impôts et de crise.', category: 'Politique' },
    { date: '1381', name: 'Révolte des paysans en Angleterre', context: 'La contestation fiscale et sociale secoue le royaume anglais.', category: 'Politique' },
    { date: '1485', name: 'Bataille de Bosworth et début des Tudor', context: 'La guerre des Deux-Roses s’achève et une nouvelle dynastie prend le pouvoir.', category: 'Politique' },
    { date: '800–900', name: 'Expansion du commerce viking sur l’Atlantique Nord et les fleuves russes', context: 'Les Scandinaves relient durablement l’Europe du Nord, Byzance et le monde slave.', category: 'Exploration' },
    { date: '962', name: 'Otton Ier fonde le Saint-Empire romain germanique', context: 'La renaissance impériale en Occident structure durablement la politique européenne.', people: 'Otton Ier', category: 'Politique' },
    { date: '1170', name: 'Assassinat de Thomas Becket à Cantorbéry', context: 'Le meurtre illustre le conflit profond entre pouvoir royal et autorité ecclésiastique.', people: 'Thomas Becket, Henri II', category: 'Politique' },
    { date: '1212', name: 'Bataille de Las Navas de Tolosa', context: 'La victoire chrétienne accélère le recul des Almohades dans la péninsule Ibérique.', category: 'Politique' },
    { date: '1265', name: 'Premier Parlement représentatif convoqué en Angleterre', context: 'Simon de Montfort associe plus largement les communes au jeu politique.', category: 'Politique' },
    { date: '1429', name: 'Jeanne d’Arc fait lever le siège d’Orléans', context: 'Le succès français marque un tournant psychologique majeur dans la guerre de Cent Ans.', people: 'Jeanne d’Arc', category: 'Politique' }
  ],
  modernes: [
    { date: '1498', name: 'Savonarole exécuté à Florence', context: 'La crise religieuse florentine symbolise les tensions morales de la Renaissance italienne.', category: 'Culture' },
    { date: '1503', name: 'Début du pontificat de Jules II', context: 'Le pape mécène fait de Rome un immense chantier artistique et politique.', category: 'Culture' },
    { date: '1513', name: 'Machiavel rédige Le Prince', context: 'Le texte renouvelle profondément la réflexion sur le pouvoir et l’État.', people: 'Nicolas Machiavel', category: 'Culture' },
    { date: '1525', name: 'Bataille de Pavie', context: 'François Ier est capturé par Charles Quint, bouleversant l’équilibre européen.', category: 'Politique' },
    { date: '1533', name: 'Pizarro fait exécuter Atahualpa', context: 'La conquête espagnole de l’empire inca franchit alors un point de non-retour.', category: 'Politique' },
    { date: '1547', name: 'Couronnement d’Ivan IV dit le Terrible', context: 'Le titre de tsar affirme une nouvelle ambition impériale russe.', category: 'Politique' },
    { date: '1555', name: 'Paix d’Augsbourg', context: 'Le compromis “cujus regio, ejus religio” tente de stabiliser l’Empire germanique.', category: 'Politique' },
    { date: '1588', name: 'Défaite de l’Invincible Armada', context: 'L’échec espagnol renforce durablement la puissance maritime anglaise.', category: 'Politique' },
    { date: '1605', name: 'Plot des Poudres en Angleterre', context: 'La tentative contre le Parlement marque durablement l’histoire politique anglaise.', category: 'Politique' },
    { date: '1607', name: 'Fondation de Jamestown', context: 'La première implantation anglaise durable en Amérique du Nord s’enracine.', category: 'Exploration' },
    { date: '1633', name: 'Procès de Galilée à Rome', context: 'Le savant est condamné, illustrant la tension entre science et autorité religieuse.', category: 'Science' },
    { date: '1682', name: 'La cour de Louis XIV s’installe à Versailles', context: 'Le palais devient l’outil politique central de la monarchie absolue.', category: 'Politique' },
    { date: '1683', name: 'Siège de Vienne repoussé', context: 'L’échec ottoman devant Vienne reconfigure le rapport de force en Europe centrale.', category: 'Politique' },
    { date: '1773', name: 'Boston Tea Party', context: 'Le geste radical accélère la rupture entre les colonies américaines et Londres.', category: 'Politique' },
    { date: '1787', name: 'Constitution des États-Unis adoptée', context: 'Le texte fonde un nouvel État fédéral moderne et durable.', category: 'Politique' },
    { date: '1511', name: 'Portugais prennent Malacca', context: 'Le contrôle du détroit renforce l’empire commercial lusitanien en Asie.', category: 'Exploration' },
    { date: '1564', name: 'Naissance de Shakespeare', context: 'Le futur dramaturge incarnera l’un des sommets de la culture anglaise moderne.', people: 'William Shakespeare', category: 'Culture' },
    { date: '1582', name: 'Adoption du calendrier grégorien', context: 'La réforme du temps corrige le décalage accumulé par le calendrier julien.', people: 'Pape Grégoire XIII', category: 'Science' },
    { date: '1600', name: 'Fondation de la Compagnie anglaise des Indes orientales', context: 'Une nouvelle puissance commerciale privée s’installe dans l’océan Indien.', category: 'Exploration' },
    { date: '1660', name: 'Création de la Royal Society à Londres', context: 'L’institution devient un foyer majeur de la révolution scientifique moderne.', category: 'Science' },
    { date: '1740–1748', name: 'Guerre de Succession d’Autriche', context: 'Le conflit remodèle l’équilibre européen avant les affrontements de la seconde moitié du siècle.', category: 'Politique' }
  ],
  contemporain: [
    { date: '1830', name: 'Révolution de Juillet en France', context: 'La monarchie de Charles X s’effondre et laisse place à la monarchie de Juillet.', category: 'Politique' },
    { date: '1831', name: 'Soulèvement polonais contre la Russie', context: 'L’insurrection devient un symbole européen des luttes nationales.', category: 'Politique' },
    { date: '1837', name: 'Le télégraphe électrique progresse vers l’usage pratique', context: 'La communication longue distance entre dans une nouvelle ère technique.', people: 'Samuel Morse', category: 'Science' },
    { date: '1846–1848', name: 'Grande famine en Irlande', context: 'La catastrophe démographique provoque une émigration massive et durable.', category: 'Politique' },
    { date: '1851', name: 'Grande Exposition de Londres', context: 'Le Crystal Palace célèbre la puissance industrielle britannique.', category: 'Culture' },
    { date: '1869', name: 'Ouverture du canal de Suez', context: 'La route maritime entre Europe et Asie est profondément raccourcie.', category: 'Exploration' },
    { date: '1870', name: 'Concile Vatican I et affirmation de l’infaillibilité pontificale', context: 'La papauté redéfinit son autorité dans un siècle de bouleversements politiques.', category: 'Culture' },
    { date: '1884–1885', name: 'Conférence de Berlin sur le partage de l’Afrique', context: 'Les puissances européennes fixent les règles de la conquête coloniale.', category: 'Politique' },
    { date: '1899', name: 'Première conférence de La Haye', context: 'Les États tentent de codifier la guerre et l’arbitrage international.', category: 'Politique' },
    { date: '1900', name: 'Révolte des Boxers en Chine', context: 'La crise révèle la fragilité de l’empire Qing face aux puissances étrangères.', category: 'Politique' },
    { date: '1911', name: 'Révolution chinoise et chute des Qing', context: 'La Chine impériale s’effondre et la République est proclamée.', category: 'Politique' },
    { date: '1922', name: 'Marche sur Rome et arrivée de Mussolini au pouvoir', context: 'Le fascisme s’installe en Italie et inspire d’autres régimes autoritaires.', category: 'Politique' },
    { date: '1928', name: 'Découverte de la pénicilline', context: 'Le hasard de laboratoire ouvre l’ère des antibiotiques.', people: 'Alexander Fleming', category: 'Science' },
    { date: '1947', name: 'Indépendance et partition de l’Inde', context: 'La décolonisation s’accompagne de violences massives entre Inde et Pakistan.', category: 'Politique' },
    { date: '1955', name: 'Conférence de Bandung', context: 'Les pays d’Asie et d’Afrique affirment une voie indépendante dans la guerre froide.', category: 'Politique' },
    { date: '1964', name: 'Civil Rights Act aux États-Unis', context: 'Le texte devient un jalon majeur de la lutte contre la ségrégation.', category: 'Politique' },
    { date: '1971', name: 'Naissance de Bangladesh', context: 'La guerre d’indépendance redessine l’Asie du Sud.', category: 'Politique' },
    { date: '1989', name: 'World Wide Web proposé au CERN', context: 'Avant sa mise en ligne publique, le projet pose les bases du web moderne.', people: 'Tim Berners-Lee', category: 'Science' },
    { date: '1999', name: 'Création de l’euro scriptural', context: 'Une nouvelle étape d’intégration économique européenne est franchie.', category: 'Politique' },
    { date: '2001', name: 'Entrée de la Chine dans l’OMC', context: 'L’intégration commerciale accélère la mondialisation des chaînes de production.', category: 'Politique' },
    { date: '2004', name: 'Élargissement majeur de l’Union européenne à l’Est', context: 'L’UE change d’échelle avec l’entrée de dix nouveaux États.', category: 'Politique' },
    { date: '2011', name: 'Catastrophe nucléaire de Fukushima', context: 'Le séisme et le tsunami provoquent une crise nucléaire mondiale au Japon.', category: 'Science' },
    { date: '2013', name: 'Révélations Snowden sur la surveillance mondiale', context: 'Le débat sur la vie privée numérique prend une dimension planétaire.', category: 'Politique' },
    { date: '2020', name: 'Premiers vaccins à ARN messager déployés à grande échelle', context: 'La biotechnologie entre dans une nouvelle phase d’application massive.', category: 'Science' },
    { date: '1832', name: 'Première grande loi de réforme électorale au Royaume-Uni', context: 'La représentation parlementaire britannique commence à s’adapter à la société industrielle.', category: 'Politique' },
    { date: '1848', name: 'Abolition définitive de l’esclavage dans les colonies françaises', context: 'La IIe République met fin de manière durable au système esclavagiste français.', people: 'Victor Schœlcher', category: 'Politique' },
    { date: '1871', name: 'Unification de l’Italie achevée avec Rome capitale', context: 'Le Risorgimento atteint son terme et stabilise un nouvel État national.', category: 'Politique' },
    { date: '1896', name: 'Premiers Jeux olympiques modernes à Athènes', context: 'Le mouvement olympique renaît dans un cadre international nouveau.', people: 'Pierre de Coubertin', category: 'Culture' },
    { date: '1912', name: 'Naufrage du Titanic', context: 'Le drame maritime devient un symbole mondial de la modernité vulnérable.', category: 'Science' },
    { date: '1949', name: 'Création de l’OTAN', context: 'L’Alliance atlantique institutionnalise le bloc occidental au début de la guerre froide.', category: 'Politique' },
    { date: '1957', name: 'Traité de Rome fonde la CEE', context: 'L’intégration européenne prend une forme institutionnelle décisive.', category: 'Politique' },
    { date: '1967', name: 'Première transplantation cardiaque humaine réussie', context: 'La chirurgie moderne franchit un seuil spectaculaire en Afrique du Sud.', people: 'Christiaan Barnard', category: 'Science' },
    { date: '1981', name: 'Premier vol de la navette spatiale Columbia', context: 'Les États-Unis inaugurent une nouvelle phase des vols spatiaux habités réutilisables.', category: 'Science' },
    { date: '1987', name: 'Protocole de Montréal contre les CFC', context: 'Un accord environnemental mondial majeur est adopté pour protéger la couche d’ozone.', category: 'Science' },
    { date: '1994', name: 'Fin officielle de l’apartheid en Afrique du Sud', context: 'Les premières élections multiraciales ouvrent une nouvelle ère politique.', people: 'Nelson Mandela', category: 'Politique' },
    { date: '2008', name: 'Premier smartphone Android commercialisé', context: 'Une nouvelle plateforme mobile s’impose durablement dans l’écosystème numérique mondial.', category: 'Science' },
    { date: '2012', name: 'Découverte du boson de Higgs annoncée au CERN', context: 'La physique des particules confirme un élément central du modèle standard.', category: 'Science' },
    { date: '2023', name: 'Essor mondial des IA génératives dans les usages du quotidien', context: 'Texte, image, code et recherche sont massivement transformés par de nouveaux outils grand public.', category: 'Science' }
  ]
};

function normalizeText(value) {
  return (value || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

function estimateYearFromText(text) {
  if (!text) return null;
  const clean = text
    .toLowerCase()
    .replace(/≈|vers|ca\.?|env\.?/g, '')
    .replace(/[–—]/g, '-')
    .replace(/\s+/g, ' ')
    .trim();
  const firstYear = clean.match(/(\d[\d\s]*)/);
  if (!firstYear) return null;
  const numeric = parseInt(firstYear[1].replace(/\s/g, ''), 10);
  if (Number.isNaN(numeric)) return null;
  return clean.includes('av. j.-c') ? -numeric : numeric;
}

function formatYear(year) {
  const abs = Math.abs(year);
  const formatted = abs.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
  return year < 0 ? `${formatted} av. J.-C.` : `${formatted}`;
}

function escapeHtml(value) {
  return (value || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function getCategoryClass(category) {
  const normalized = normalizeText(category);
  if (normalized.includes('science')) return 'cat-science';
  if (normalized.includes('culture')) return 'cat-culture';
  if (normalized.includes('exploration')) return 'cat-exploration';
  return 'cat-politique';
}

function createEventMarkup(item, era, index) {
  const peopleMarkup = item.people ? `<span class="event-people">${escapeHtml(item.people)}</span>` : '';
  return `
    <div class="event${item.isMajor ? ' major' : ''}" data-era="${era}" data-supplemental="true" data-supplemental-index="${index}">
      <div class="event-dot"></div>
      <div class="event-content">
        <span class="event-date">${escapeHtml(item.date)}</span>
        <span class="event-text">
          <span class="event-name">${escapeHtml(item.name)}</span>
          <span class="event-context">${escapeHtml(item.context)}</span>
          ${peopleMarkup}
        </span>
        <span class="event-cat ${getCategoryClass(item.category)}">${escapeHtml(item.category)}</span>
      </div>
    </div>
  `;
}

function injectSupplementalEvents() {
  Object.entries(supplementalEventsByEra).forEach(([era, items]) => {
    const section = document.getElementById(`era-${era}`);
    const markerGroup = section?.querySelector('.marker-group');
    if (!section || !markerGroup || !items.length) return;
    const html = `
      <div class="geo-label">➕ Événements complémentaires</div>
      ${items.map((item, index) => createEventMarkup(item, era, index)).join('')}
    `;
    markerGroup.insertAdjacentHTML('afterend', html);
  });
}

injectSupplementalEvents();

const eventEntries = Array.from(document.querySelectorAll('.event')).map((event, index) => {
  const date = event.querySelector('.event-date')?.textContent.trim() || '';
  const name = event.querySelector('.event-name')?.textContent.trim() || '';
  const context = event.querySelector('.event-context')?.textContent.trim() || '';
  const people = event.querySelector('.event-people')?.textContent.trim() || '';
  const category = event.querySelector('.event-cat')?.textContent.trim() || '';
  const era = event.dataset.era || '';
  const year = estimateYearFromText(date);
  const summary = context || `${name} marque un jalon important dans ${eraConfigs[era]?.label?.toLowerCase() || "l'histoire mondiale"}.`;
  const bullets = [
    `Ce qu'il se passe : ${name}.`,
    context ? `Pourquoi c'est important : ${context}.` : `Pourquoi c'est important : cet événement transforme durablement le cours de l'histoire.`,
    people ? `Acteurs ou peuples liés : ${people}.` : `Portée : l'événement s'inscrit dans la période ${eraConfigs[era]?.label || 'historique'} et aide à comprendre sa dynamique.`
  ];
  const articleParagraphs = [
    `${date} : ${name}. ${context || "L'événement s'impose comme un moment charnière dans la chronologie mondiale."}`,
    people ? `Les principaux acteurs associés sont ${people}. Leur rôle aide à comprendre comment cette rupture s'est produite et pourquoi elle a marqué son époque.` : `L'intérêt de cet événement tient à ses conséquences politiques, culturelles, scientifiques ou sociales, selon le contexte de la période.`,
    `Replacé dans ${eraConfigs[era]?.label || 'sa période'}, ce moment sert de repère pour lire les enchaînements historiques qui suivent.`
  ];
  const entry = {
    id: `event-${index}`,
    type: 'event',
    era,
    date,
    year,
    name,
    context,
    people,
    category,
    isMajor: event.classList.contains('major'),
    summary,
    bullets,
    articleTitle: `${name} : le fait à retenir`,
    articleParagraphs,
    sourceLabel: event.classList.contains('major') ? 'Événement majeur' : 'Événement'
  };
  event.dataset.entryId = entry.id;
  event.id = entry.id;
  event.classList.add('interactive');
  event.tabIndex = 0;
  event.setAttribute('role', 'button');
  return entry;
});

const eventMap = new Map(eventEntries.map(entry => [entry.id, entry]));
const allEntries = [...eventEntries];

const seenFeaturedDates = new Set();
const featuredDates = [...eventEntries]
  .sort((a, b) => {
    if (a.isMajor !== b.isMajor) return a.isMajor ? -1 : 1;
    return (a.year ?? Number.MAX_SAFE_INTEGER) - (b.year ?? Number.MAX_SAFE_INTEGER);
  })
  .filter(item => {
    const key = `${item.date}__${item.name}`;
    if (!item.date || !item.name || seenFeaturedDates.has(key)) return false;
    seenFeaturedDates.add(key);
    return true;
  })
  .slice(0, featuredDatesLimit)
  .map((item, index) => ({ ...item, num: index + 1 }));

const grid = document.getElementById('top50Grid');
grid.innerHTML = featuredDates.map(item => `
  <div class="top50-item interactive" id="top-${item.id}" data-entry-id="${item.id}" tabindex="0" role="button">
    <div class="top50-num">${item.num}</div>
    <div class="top50-content">
      <div class="top50-date">${item.date}</div>
      <div class="top50-name">${item.name}</div>
    </div>
  </div>
`).join('');

function updateStats() {
  const uniqueDates = new Set(eventEntries.map(entry => entry.date)).size;
  document.getElementById('statDates').textContent = `${uniqueDates}+`;
  document.getElementById('statEvents').textContent = `${eventEntries.length}+`;
  const peopleCount = new Set(eventEntries.flatMap(entry => entry.people ? entry.people.split(',').map(item => item.trim()) : []).filter(Boolean)).size;
  document.getElementById('statPeople').textContent = `${peopleCount}+`;
  document.getElementById('statMarkers').textContent = '0';
}

function getEntryById(id) {
  return eventMap.get(id) || null;
}

function buildDetailUrl(entryId, backId) {
  const url = new URL(window.location.href);
  url.searchParams.set('view', 'detail');
  url.searchParams.set('id', entryId);
  url.searchParams.set('back', backId || entryId);
  url.hash = '';
  return url.toString();
}

function renderDetail(entry) {
  if (!entry) return;
  detailKicker.textContent = `${entry.sourceLabel} · ${eraConfigs[entry.era]?.label || 'Chronologie'}`;
  detailDate.textContent = entry.date;
  detailTitle.textContent = entry.name;
  detailSummary.textContent = entry.summary;
  detailBullets.innerHTML = entry.bullets.map(item => `<li>${item}</li>`).join('');
  detailArticleTitle.textContent = entry.articleTitle;
  detailArticleBody.innerHTML = entry.articleParagraphs.map(item => `<p>${item}</p>`).join('');
  detailMeta.innerHTML = '';

  const chips = [
    eraConfigs[entry.era]?.label || '',
    entry.category || '',
    entry.isMajor ? 'Majeur' : '',
    'Fiche cliquable'
  ].filter(Boolean);

  chips.forEach(label => {
    const span = document.createElement('span');
    span.textContent = label;
    detailMeta.appendChild(span);
  });

  detailSearchLink.href = `https://www.google.com/search?q=${encodeURIComponent(entry.name + ' ' + entry.date + ' article presse')}`;
}

function activateEntryFromElement(element) {
  const backId = element.classList.contains('top50-item') ? element.dataset.entryId : (element.id || element.dataset.entryId);
  window.location.href = buildDetailUrl(element.dataset.entryId, backId);
}

function syncActiveButtons(selector, matcher) {
  document.querySelectorAll(selector).forEach(button => {
    button.classList.toggle('active', matcher(button));
  });
}

function applyFilters() {
  state.search = normalizeText(searchInput.value.trim());
  const showEvents = state.type === 'all' || state.type === 'events' || state.type === 'people';
  const peopleOnly = state.type === 'people';

  document.querySelectorAll('.event').forEach(event => {
    const entry = getEntryById(event.dataset.entryId);
    const haystack = normalizeText([entry.date, entry.name, entry.context, entry.people, entry.category].join(' '));
    const matchesSearch = !state.search || haystack.includes(state.search);
    const matchesType = showEvents && (!peopleOnly || !!entry.people);
    const matchesEra = state.era === 'all' || state.era === entry.era;
    const visible = matchesSearch && matchesType && matchesEra;
    event.classList.toggle('hidden', !visible);
  });

  document.querySelectorAll('.geo-label').forEach(label => {
    const nextItems = [];
    let node = label.nextElementSibling;
    while (node && !node.classList.contains('geo-label') && !node.classList.contains('era-header')) {
      nextItems.push(node);
      node = node.nextElementSibling;
    }
    label.classList.toggle('hidden', !nextItems.some(item => !item.classList.contains('hidden')));
  });

  document.querySelectorAll('.era-section').forEach(section => {
    if (section.id === 'era-top50') {
      section.style.display = state.era === 'top50' ? 'block' : 'none';
      return;
    }
    if (state.era === 'top50') {
      section.style.display = 'none';
      return;
    }
    const matchesEra = state.era === 'all' || section.id === `era-${state.era}`;
    const hasVisibleContent = !!section.querySelector('.event:not(.hidden)');
    section.style.display = matchesEra && hasVisibleContent ? 'block' : 'none';
  });

  document.querySelectorAll('.top50-item').forEach(item => {
    const entry = getEntryById(item.dataset.entryId);
    const haystack = normalizeText([entry.date, entry.name, entry.context, entry.people].join(' '));
    const visible = (!state.search || haystack.includes(state.search)) && (state.era === 'all' || state.era === 'top50');
    item.style.display = visible ? 'flex' : 'none';
  });
  syncActiveButtons('#periodMenu button', button => button.dataset.era === state.era);
  syncActiveButtons('#typeMenu button', button => button.dataset.type === state.type);
}

function showAll() {
  state.era = 'all';
  applyFilters();
}

function filterEra(era) {
  state.era = era;
  applyFilters();
}

function setEraFilter(era) {
  state.era = era;
  applyFilters();
}

function setTypeFilter(type) {
  state.type = type === 'markers' ? 'events' : type;
  applyFilters();
}

function filterSearch() {
  if (state.era === 'top50' && searchInput.value.trim()) {
    state.era = 'all';
  }
  applyFilters();
}

document.addEventListener('click', event => {
  const target = event.target.closest('.event, .top50-item');
  if (target) {
    activateEntryFromElement(target);
  }
});

document.addEventListener('keydown', event => {
  if (event.key !== 'Enter' && event.key !== ' ') return;
  const target = event.target.closest('.event, .top50-item');
  if (!target) return;
  event.preventDefault();
  activateEntryFromElement(target);
});

updateStats();
applyFilters();

// ══════════════════ COUNTRIES & STATS RENDERING ══════════════════
let countriesData = [];

async function loadCountriesData() {
  try {
    const response = await fetch('data/countries.json');
    countriesData = await response.json();
  } catch (error) {
    console.error('Failed to load countries.json:', error);
  }
}

function renderCountriesList() {
  const grid = document.getElementById('countriesGrid');
  if (!grid) return;
  
  const search = normalizeText(document.getElementById('countrySearchInput').value);
  const filtered = countriesData.filter(c => normalizeText(c.name).includes(search));
  
  grid.innerHTML = filtered.map(country => `
    <div class="country-card" onclick="showCountryDetail('${country.id}')">
      <div class="country-flag">${country.flag}</div>
      <div class="country-info">
        <h3>${country.name}</h3>
        <p>${country.events.length} Événements</p>
      </div>
    </div>
  `).join('');
}

function filterCountries() {
  renderCountriesList();
}

function showCountryDetail(countryId) {
  const country = countriesData.find(c => c.id === countryId);
  if (!country) return;
  
  // Create a temporary "Detail" overlay or reuse the existing one
  // For now, let's just use the existing detail logic if possible, 
  // but country events are structured differently.
  // Let's implement a simple modal-like view for country history.
  const modalHtml = `
    <div id="countryModal" class="country-modal">
      <div class="country-modal-content">
        <div class="modal-header">
          <span class="close-modal" onclick="closeCountryModal()">&times;</span>
          <h2>${country.flag} ${country.name}</h2>
          <p>Chronologie nationale</p>
        </div>
        <div class="modal-body">
          ${country.events.map(event => `
            <div class="country-event">
              <div class="event-date">${event.date}</div>
              <div class="event-info">
                <strong>${event.name}</strong>
                <p>${event.context}</p>
                <span class="event-cat ${getCategoryClass(event.category)}">${event.category}</span>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    </div>
  `;
  document.body.insertAdjacentHTML('beforeend', modalHtml);
  setTimeout(() => document.getElementById('countryModal').classList.add('active'), 10);
}

window.closeCountryModal = function() {
  const modal = document.getElementById('countryModal');
  modal.classList.remove('active');
  setTimeout(() => modal.remove(), 300);
};

function renderStatsView() {
  const container = document.getElementById('statsContent');
  if (!container) return;
  
  const totalEvents = eventEntries.length;
  const countriesCount = countriesData.length;
  const categories = {};
  eventEntries.forEach(e => {
    categories[e.category] = (categories[e.category] || 0) + 1;
  });
  
  container.innerHTML = `
    <div class="stats-grid">
      <div class="stat-card">
        <strong>${totalEvents}</strong>
        <span>Événements chronologiques</span>
      </div>
      <div class="stat-card">
        <strong>${countriesCount}</strong>
        <span>Pays documentés</span>
      </div>
      ${Object.entries(categories).map(([cat, count]) => `
        <div class="stat-card">
          <strong>${count}</strong>
          <span>${cat}</span>
        </div>
      `).join('')}
    </div>
    <div class="stats-extra">
      <h3>Dernières mises à jour</h3>
      <p>Base de données enrichie avec les drapeaux et les histoires nationales de plus de 25 pays.</p>
    </div>
  `;
}

loadCountriesData();

// ═════════════════════════════════════════════════════════ SIDEBAR NAVIGATION
const sidebar = document.getElementById('sidebar');
const sidebarToggle = document.getElementById('sidebarToggle');
const sidebarContent = document.getElementById('sidebarContent');
const main = document.querySelector('main');

let sidebarOpen = false;

function toggleSidebar() {
  sidebarOpen = !sidebarOpen;
  sidebar.classList.toggle('active', sidebarOpen);
  sidebarToggle.classList.toggle('active', sidebarOpen);
  main.classList.toggle('sidebar-open', sidebarOpen);
}

sidebarToggle.addEventListener('click', toggleSidebar);

function buildSidebarContent() {
  let sections = [];
  
  if (state.currentView === 'timeline') {
    sections = [
      {
        title: '📜 Périodes historiques',
        items: [
          { label: 'Préhistoire', id: 'era-prehist' },
          { label: 'Antiquité', id: 'era-antiquite' },
          { label: 'Moyen Âge', id: 'era-moyen-age' },
          { label: 'Temps modernes', id: 'era-modernes' },
          { label: 'Époque contemporaine', id: 'era-contemporain' },
          { label: '⭐ Top 150 dates', id: 'era-top50' }
        ]
      }
    ];
  } else if (state.currentView === 'countries') {
    sections = [
      {
        title: '🌍 Pays disponibles',
        items: countriesData.map(c => ({ label: `${c.flag} ${c.name}`, id: c.id, type: 'country' }))
      }
    ];
  } else {
    sections = [
      {
        title: '📊 Statistiques',
        items: [
          { label: 'Aperçu général', id: 'stats-overview' },
          { label: 'Répartition thématique', id: 'stats-categories' }
        ]
      }
    ];
  }

  sidebarContent.innerHTML = sections.map(section => `
    <div class="sidebar-section">
      <div class="sidebar-section-title">${section.title}</div>
      <div class="sidebar-items">
        ${section.items.map(item => `
          <div class="sidebar-item" data-target="${item.id}" data-type="${item.type || ''}">${item.label}</div>
        `).join('')}
      </div>
    </div>
  `).join('');

  document.querySelectorAll('.sidebar-item').forEach(item => {
    item.addEventListener('click', () => {
      const targetId = item.dataset.target;
      const type = item.dataset.type;
      
      if (type === 'country') {
        showCountryDetail(targetId);
        if (window.innerWidth < 640) toggleSidebar();
        return;
      }
      
      const target = document.getElementById(targetId);
      if (target) {
        if (window.innerWidth < 640) {
          toggleSidebar();
        }
        setTimeout(() => {
          target.scrollIntoView({ behavior: 'smooth', block: 'start' });
          target.style.backgroundColor = 'rgba(0, 113, 227, 0.05)';
          setTimeout(() => {
            target.style.backgroundColor = '';
          }, 2000);
        }, 100);
      }
    });
  });
}

buildSidebarContent();

const detailMode = urlParams.get('view') === 'detail';
if (detailMode) {
  document.body.classList.add('detail-mode');
  const entry = getEntryById(urlParams.get('id'));
  const backId = urlParams.get('back');
  detailBackLink.href = `${window.location.pathname}${backId ? `#${backId}` : ''}`;
  if (entry) {
    renderDetail(entry);
  } else {
    detailKicker.textContent = 'Fiche historique';
    detailDate.textContent = '';
    detailTitle.textContent = 'Événement introuvable';
    detailSummary.textContent = 'Cette fiche n’a pas pu être chargée. Utilise le bouton de retour pour revenir à la frise.';
    detailBullets.innerHTML = '<li>Le lien ne correspond peut-être plus à un événement existant.</li>';
    detailArticleTitle.textContent = 'Retour conseillé';
    detailArticleBody.innerHTML = '<p>Reviens à la frise et reclique sur une date pour ouvrir une fiche à jour.</p>';
  }
}
