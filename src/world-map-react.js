import { state } from './state.js';
import { worldRegions } from './world-map-data.js';
import { getCategoryLabel, getCategoryClass } from './utils.js';
import React, { useEffect, useMemo, useState } from 'https://esm.sh/react@18.3.1';
import ReactDOM from 'https://esm.sh/react-dom@18.3.1/client';
import htm from 'https://esm.sh/htm@3.2.0';
import { ComposableMap, Geographies, Geography, ZoomableGroup } from 'https://esm.sh/react-simple-maps@3.0.0';

const html = htm.bind(React.createElement);
const WORLD_TOPO_URL = 'https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json';
const REGION_BY_CONTINENT = {
  'North America': 'ameriques',
  'South America': 'ameriques',
  Europe: 'europe',
  Africa: 'afrique',
  Asia: 'asie',
  Oceania: 'oceanie'
};
const MIDDLE_EAST_COUNTRIES = new Set([
  'Egypt',
  'Saudi Arabia',
  'Israel',
  'Iraq',
  'Iran',
  'Turkey',
  'Syria',
  'Jordan',
  'Lebanon',
  'Palestine',
  'United Arab Emirates',
  'Qatar',
  'Kuwait',
  'Oman',
  'Yemen',
  'Bahrain'
]);

let topologyCache = null;
let reactRoot = null;

function fetchTopology() {
  if (!topologyCache) {
    topologyCache = fetch(WORLD_TOPO_URL).then((response) => {
      if (!response.ok) {
        throw new Error(`Impossible de charger la carte (${response.status})`);
      }
      return response.json();
    });
  }
  return topologyCache;
}

function getRegionIdFromGeography(geo) {
  const continent = geo.properties?.CONTINENT || geo.properties?.continent || '';
  const name = geo.properties?.NAME || geo.properties?.name || '';

  if (continent === 'Asia' && MIDDLE_EAST_COUNTRIES.has(name)) {
    return 'moyen-orient';
  }

  if (REGION_BY_CONTINENT[continent]) {
    return REGION_BY_CONTINENT[continent];
  }

  if (MIDDLE_EAST_COUNTRIES.has(name)) {
    return 'moyen-orient';
  }

  return null;
}

function getGeographyFill(geo, selectedRegionId) {
  const regionId = getRegionIdFromGeography(geo);
  if (!regionId) return '#1e293b';
  if (regionId === selectedRegionId) return 'rgba(124, 58, 237, 0.95)';
  return 'rgba(255, 255, 255, 0.08)';
}

function WorldMapApp({ selectedRegionId, onSelectRegion }) {
  const [topology, setTopology] = useState(null);
  const [loadError, setLoadError] = useState(null);

  useEffect(() => {
    fetchTopology()
      .then(setTopology)
      .catch((error) => setLoadError(error.message));
  }, []);

  const selectedRegion = worldRegions.find((region) => region.id === selectedRegionId) || worldRegions[0];
  const uniqueCategories = useMemo(
    () => [...new Set(selectedRegion.events.map((event) => getCategoryLabel(event.category)))],
    [selectedRegion]
  );

  return html`
    <section className="world-map-grid">
      <div className="world-map-stage">
        <div className="world-map-card">
          <div className="world-map-card-header">
            <div>
              <p className="world-map-kicker">Cliquez sur une région</p>
              <h2>Carte du monde historique</h2>
            </div>
            <div className="world-map-badge">${worldRegions.length} régions</div>
          </div>

          <div className="world-map-canvas" aria-label="Carte du monde interactive">
            ${loadError
              ? html`<div className="world-map-error">Erreur de chargement : ${loadError}</div>`
              : topology
              ? html`
                  <${ComposableMap} projection="geoEqualEarth" width=${1200} height=${720}>
                    <${ZoomableGroup}>
                      <${Geographies} geography=${topology}>
                        ${({ geographies }) =>
                          geographies.map((geo) => {
                            const regionId = getRegionIdFromGeography(geo);
                            return html`
                              <${Geography}
                                key=${geo.rsmKey}
                                geography=${geo}
                                fill=${getGeographyFill(geo, selectedRegion.id)}
                                stroke="#ffffff"
                                strokeOpacity=${0.12}
                                strokeWidth=${0.5}
                                onClick=${() => regionId && onSelectRegion(regionId)}
                                style=${{
                                  default: { outline: 'none' },
                                  hover: { fill: '#38bdf8', cursor: regionId ? 'pointer' : 'default', outline: 'none' },
                                  pressed: { outline: 'none' }
                                }}
                              />
                            `;
                          })}
                      <//>
                    <//>
                  <//>
                `
              : html`<div className="world-map-loading">Chargement de la carte…</div>`}
          </div>

          <div className="world-region-chips" aria-label="Choix des régions">
            ${worldRegions.map((region) => html`
              <button
                key=${region.id}
                type="button"
                className=${`world-region-chip ${region.id === selectedRegion.id ? 'active' : ''}`}
                aria-pressed=${String(region.id === selectedRegion.id)}
                onClick=${() => onSelectRegion(region.id)}
                style=${{ '--region-accent': region.accent }}
              >
                <span>${region.icon}</span>
                <span>${region.label}</span>
              </button>
            `)}
          </div>
        </div>
      </div>

      <aside className="world-map-panel">
        <div className="world-map-panel-card" style=${{ '--region-accent': selectedRegion.accent }}>
          <div className="world-map-panel-header">
            <div className="world-map-panel-icon" aria-hidden="true">${selectedRegion.icon}</div>
            <div>
              <p className="world-map-panel-kicker">Région sélectionnée</p>
              <h3>${selectedRegion.label}</h3>
            </div>
          </div>

          <p className="world-map-description">${selectedRegion.description}</p>

          <div className="world-map-metrics">
            <div className="world-map-metric">
              <strong>${selectedRegion.events.length}</strong>
              <span>Dates repérées</span>
            </div>
            <div className="world-map-metric">
              <strong>${uniqueCategories.length}</strong>
              <span>Catégories</span>
            </div>
          </div>

          <div className="world-region-list" role="list">
            ${selectedRegion.events.map((event) => html`
              <article key=${event.date + '-' + event.name} className=${`world-region-event ${event.major ? 'major' : ''}`} role="listitem">
                <div className="world-region-event-date">${event.date}</div>
                <div className="world-region-event-body">
                  <h4>${event.name}</h4>
                  <p>${event.context}</p>
                  <span className=${`world-region-event-cat ${getCategoryClass(event.category)}`}>${getCategoryLabel(event.category)}</span>
                </div>
              </article>
            `)}
          </div>
        </div>
      </aside>
    </section>
  `;
}

export function selectWorldMapRegion(regionId) {
  const nextRegion = worldRegions.find((region) => region.id === regionId);
  if (!nextRegion) return;
  state.worldMapRegion = nextRegion.id;
  renderWorldMap();
}

export function renderWorldMap() {
  const container = document.getElementById('worldMapContent');
  if (!container) return;
  const selectedRegionId = state.worldMapRegion || worldRegions[0].id;
  if (!reactRoot) {
    reactRoot = ReactDOM.createRoot(container);
  }
  reactRoot.render(html`<${WorldMapApp} selectedRegionId=${selectedRegionId} onSelectRegion=${selectWorldMapRegion} />`);
}
