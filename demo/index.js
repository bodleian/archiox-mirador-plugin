import Mirador from 'mirador';
import { relightMiradorPlugin } from '../src/index';

// Demo manifest with albedo and normal maps from Bodleian Library
const DEMO_MANIFEST = 'https://iiif.bodleian.ox.ac.uk/iiif/manifest/1fc3f35d-bbb5-4524-8fbe-a5bcb5468be2.json';

const config = {
  id: 'mirador',
  windows: [{
    loadedManifest: DEMO_MANIFEST,
    thumbnailNavigationPosition: 'far-bottom',
  }],
  window: {
    allowClose: false,
    allowMaximize: false,
    defaultSideBarPanel: 'info',
    sideBarOpenByDefault: false,
    imageToolsEnabled: true,
    imageToolsOpen: false,
  },
  osdConfig: {
    crossOriginPolicy: 'Anonymous',
    ajaxWithCredentials: false,
  },
  workspace: {
    showZoomControls: true,
  },
  requests: {
    preprocessors: [
      (url, options) => ({
        ...options,
        headers: {
          ...options.headers,
          Accept: url.endsWith('/info.json')
            ? 'application/ld+json;profile="http://iiif.io/api/image/3/context.json"'
            : 'application/ld+json;profile="http://iiif.io/api/presentation/3/context.json"',
          ...(url.endsWith('/info.json') && { 'Cache-Control': 'no-cache' })
        }
      })
    ]
  }
};

// Initialize Mirador with the ARCHiOx plugin
Mirador.viewer(config, [...relightMiradorPlugin]);

console.log('ARCHiOx Mirador Plugin loaded. Look for the torch button in the viewer toolbar.');
