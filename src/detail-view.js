import { state } from './state.js';
import { normalizeText } from './utils.js';

function getCategoryClass(category) {
  const normalized = normalizeText(category);
  if (normalized.includes('politique')) return 'cat-politique';
  if (normalized.includes('science')) return 'cat-science';
  if (normalized.includes('culture')) return 'cat-culture';
  if (normalized.includes('exploration')) return 'cat-exploration';
  return 'cat-politique';
}

function getHistoricalSignificance(event) {
  const category = normalizeText(event.category || '');

  if (event.major) {
    return "Cet evenement majeur a profondement transforme le cours de l'histoire et ses consequences se font encore ressentir aujourd'hui.";
  }

  if (category.includes('science')) {
    return 'Cette avancee scientifique a contribue a elargir les connaissances humaines et a ouvert la voie a de nouvelles decouvertes.';
  }

  if (category.includes('politique')) {
    return "Cet evenement politique a redefine les equilibres de pouvoir et influence l'organisation des societes de l'epoque.";
  }

  if (category.includes('culture')) {
    return "Cet accomplissement culturel a enrichi le patrimoine artistique et intellectuel de l'humanite.";
  }

  if (category.includes('exploration')) {
    return 'Cette exploration a repousse les frontieres du monde connu et permis de nouvelles connexions entre civilisations.';
  }

  return "Cet evenement a marque son epoque et constitue un jalon important dans la comprehension de cette periode historique.";
}

function getCategoryContext(event) {
  const era = event.era || '';

  if (era === 'prehist') {
    return 'A cette epoque reculee, les humains developpaient progressivement des techniques et des organisations sociales qui allaient poser les fondations des civilisations futures.';
  }
  if (era === 'antiquite') {
    return "Durant l'Antiquite, les grandes civilisations etablissaient les bases de la philosophie, des sciences, du droit et de l'organisation politique qui influencent encore notre monde.";
  }
  if (era === 'moyen-age') {
    return "Au Moyen Age, entre transformations politiques, avancees techniques et echanges culturels, se construisaient les nations et les identites europeennes.";
  }
  if (era === 'modernes') {
    return "Les Temps Modernes voient l'emergence de nouvelles conceptions du monde, des revolutions scientifiques et politiques qui faconnent la modernite.";
  }
  if (era === 'contemporain') {
    return "L'epoque contemporaine est marquee par des transformations accelerees, des conflits mondiaux, des revolutions technologiques et une mondialisation sans precedent.";
  }

  return "Cet evenement s'inscrit dans un contexte historique plus large de transformations sociales, politiques et culturelles.";
}

function getLegacyStatement(event) {
  const name = (event.name || '').toLowerCase();

  if (name.includes('invention') || name.includes('decouverte') || name.includes('découverte')) {
    return "Cette innovation a eu des repercussions durables et continue d'influencer notre vie quotidienne.";
  }
  if (name.includes('bataille') || name.includes('guerre')) {
    return 'Les consequences de ce conflit ont redessine la carte politique et laisse une empreinte indelebile dans la memoire collective.';
  }
  if (name.includes('naissance') || name.includes('mort')) {
    return "La vie et l'oeuvre de cette personne ont eu un impact profond sur l'histoire des idees et des civilisations.";
  }

  return "Son heritage perdure a travers les siecles et continue d'inspirer les generations futures.";
}

function generateDetailedSummary(event) {
  const parts = [];
  const era = state.timelineData?.eras.find((entry) => entry.id === event.era);
  const eraName = era ? era.name.toLowerCase() : "l'histoire";

  parts.push(`Cet evenement s'inscrit dans ${eraName}, plus precisement ${event.date}.`);
  parts.push(`${event.name}.`);

  if (event.context) {
    parts.push(`Contexte : ${event.context}`);
  }
  if (event.people && event.people.trim()) {
    parts.push(`Personnages cles impliques : ${event.people}.`);
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
  document.getElementById('detailCategory').textContent = event.category;
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
