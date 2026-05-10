import { state } from './state.js';
import { getCategoryClass, getCategoryLabel, normalizeText } from './utils.js';

function getHistoricalSignificance(event) {
  const category = normalizeText(event.category || '');

  if (event.major) {
    return "Cet événement majeur a profondément transformé le cours de l'histoire et ses conséquences se font encore ressentir aujourd'hui.";
  }

  if (category.includes('science')) {
    return 'Cette avancée scientifique a contribué à élargir les connaissances humaines et a ouvert la voie à de nouvelles découvertes.';
  }

  if (category.includes('politique')) {
    return "Cet événement politique a redéfini les équilibres de pouvoir et influence l'organisation des sociétés de l'époque.";
  }

  if (category.includes('culture')) {
    return "Cet accomplissement culturel a enrichi le patrimoine artistique et intellectuel de l'humanité.";
  }

  if (category.includes('exploration')) {
    return 'Cette exploration a repoussé les frontières du monde connu et permis de nouvelles connexions entre civilisations.';
  }

  return "Cet événement a marqué son époque et constitue un jalon important dans la compréhension de cette période historique.";
}

function getCategoryContext(event) {
  const era = event.era || '';

  if (era === 'prehist') {
    return 'À cette époque reculée, les humains développaient progressivement des techniques et des organisations sociales qui allaient poser les fondations des civilisations futures.';
  }
  if (era === 'antiquite') {
    return "Durant l'Antiquité, les grandes civilisations établissaient les bases de la philosophie, des sciences, du droit et de l'organisation politique qui influencent encore notre monde.";
  }
  if (era === 'moyen-age') {
    return "Au Moyen Âge, entre transformations politiques, avancées techniques et échanges culturels, se construisaient les nations et les identités européennes.";
  }
  if (era === 'modernes') {
    return "Les Temps Modernes voient l'émergence de nouvelles conceptions du monde, des révolutions scientifiques et politiques qui façonnent la modernité.";
  }
  if (era === 'contemporain') {
    return "L'époque contemporaine est marquée par des transformations accélérées, des conflits mondiaux, des révolutions technologiques et une mondialisation sans précédent.";
  }

  return "Cet événement s'inscrit dans un contexte historique plus large de transformations sociales, politiques et culturelles.";
}

function getLegacyStatement(event) {
  const name = (event.name || '').toLowerCase();

  if (name.includes('invention') || name.includes('decouverte') || name.includes('découverte')) {
    return "Cette innovation a eu des répercussions durables et continue d'influencer notre vie quotidienne.";
  }
  if (name.includes('bataille') || name.includes('guerre')) {
    return 'Les conséquences de ce conflit ont redessiné la carte politique et laissé une empreinte indélébile dans la mémoire collective.';
  }
  if (name.includes('naissance') || name.includes('mort')) {
    return "La vie et l'œuvre de cette personne ont eu un impact profond sur l'histoire des idées et des civilisations.";
  }

  return "Son héritage perdure à travers les siècles et continue d'inspirer les générations futures.";
}

function generateDetailedSummary(event) {
  const parts = [];
  const era = state.timelineData?.eras.find((entry) => entry.id === event.era);
  const eraName = era ? era.name.toLowerCase() : "l'histoire";

  parts.push(`Cet événement s'inscrit dans ${eraName}, plus précisément ${event.date}.`);
  parts.push(`${event.name}.`);

  if (event.context) {
    parts.push(`Contexte : ${event.context}`);
  }
  if (event.people && event.people.trim()) {
    parts.push(`Personnages clés impliqués : ${event.people}.`);
  }

  parts.push(getHistoricalSignificance(event));
  parts.push(getCategoryContext(event));
  parts.push(getLegacyStatement(event));

  return parts.join(' ');
}

export function showDetailPage(event) {
  const detailPage = document.getElementById('detailPage');
  if (!detailPage) return;

  const era = state.timelineData?.eras.find((entry) => entry.id === event.era);
  const badge = era ? era.icon : '📜';

  document.getElementById('detailBadge').textContent = badge;
  document.getElementById('detailCategory').textContent = getCategoryLabel(event.category);
  document.getElementById('detailCategory').className = `detail-category ${getCategoryClass(event.category)}`;
  document.getElementById('detailDate').textContent = event.date;
  document.getElementById('detailTitle').textContent = event.name;
  document.getElementById('detailSummary').textContent = generateDetailedSummary(event);

  const peopleSection = document.getElementById('detailPeopleSection');
  const peopleEl = document.getElementById('detailPeople');
  if (event.people && event.people.trim()) {
    peopleEl.textContent = event.people;
    peopleSection.style.display = 'block';
  } else {
    peopleSection.style.display = 'none';
  }

  const contextSection = document.getElementById('detailContextSection');
  const contextEl = document.getElementById('detailContext');
  if (event.context && event.context.length > 100) {
    contextEl.textContent = event.context;
    contextSection.style.display = 'block';
  } else {
    contextSection.style.display = 'none';
  }

  const searchQuery = encodeURIComponent(event.name);
  document.getElementById('detailSearchLink').href = `https://www.google.com/search?q=${searchQuery}`;

  const wikiLink = document.getElementById('detailWikipediaLink');
  if (event.source?.eventQid) {
    wikiLink.href = `https://fr.wikipedia.org/wiki/Special:EntityPage/${event.source.eventQid}`;
    wikiLink.style.display = 'inline-flex';
  } else {
    wikiLink.style.display = 'none';
  }

  const pressLinkEl = document.getElementById('detailPressLink');
  const possiblePressUrl = event.source?.pressUrl || event.source?.articleUrl || event.source?.url || event.pressUrl || event.articleUrl;
  if (possiblePressUrl) {
    pressLinkEl.href = possiblePressUrl;
    pressLinkEl.style.display = 'inline-flex';
  } else {
    pressLinkEl.style.display = 'none';
  }

  const backBtn = document.getElementById('detailBackBtn');
  backBtn.onclick = () => {
    detailPage.classList.remove('active');
    if (state.detailSource === 'timeline') {
      const eventEl = document.querySelector(`[data-id="${event.id}"]`);
      if (eventEl) eventEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }

    if (state.detailSource === 'country' && state.detailCountryId && typeof window.showCountryDetail === 'function') {
      window.showCountryDetail(state.detailCountryId);
    }
  };

  detailPage.classList.add('active');
  detailPage.scrollTop = 0;
}
