# Project Title and Description

## Title: ARCHiOx Mirador Viewer Plug-in

## Description:

ARCHiOx is a multi year collaborative project between the Bodleian Libraries and Factum Arte, funded by
the Helen Hamlyn Trust.  Seeking to "see the unseen"; Factum, the Imaging Studio and Digital Collections Discovery team
have worked together to surface the digital recordings captured using the Selene photometric stereo scanner.

Here we share the code for the IIIF viewer Mirador plug-in that allows users to relight and render these scans in realtime
in your web browser, allowing users to share interoperable collections of "2.5D" dimensional interactive images.

Being able to relight these images in an interactive way is more than just an engagement exercise, as users are able
to artificially exaggerate shadows and highlights and even take screenshots of what they are seeing on the digital canvas
to share with collegues in active research of objects after scanning.

# Table of Contents
[Installation Instructions](#installation-instructions)
[Usage](#usage)
[Key Features](#key-features)
[Contributing](#contributing)
[License](#license)
[Contact Information](#contact-information)
[Acknowledgements](#acknoledgements)

# Installation

## Dependencies
You need at least `node.js` version 22 and a version of `npm` that supports this installed as a minimum.  
Use of a node version manager such as `nvm` can help you manage this if you need to support multiple node versions
on your local machine.  The inclusion of a .nvmrc config file in this project means that npm will automatically use
this node.js version for the project if it is installed.

## IIIF Presentation and Image API Support
The plug-in depends upon IIIF Presentation version 3 and IIIF Image API version 3 and makes use of a currently unregistered presentation API extension
that we wrote called LightingMap.

Include the LightingMap context in your IIIF manifest as follows:

```json
"@context": [
    "http://iiif.io/api/presentation/3/context.json",
    "https://iiif.bodleian.ox.ac.uk/contexts/lightingmap/context.json"
]
```

As a minimum provide a normal map and a albedo map via IIIF choices as follows, referencing the mapTypes in the LightingMap extension:

```json
"items": [
	{
	  "id": "https://iiif-qa.bodleian.ox.ac.uk/iiif/annotationpage/98adb17b-2b42-4e93-8701-f2ebc10e1018.json",
	  "type": "AnnotationPage",
	  "items": [
		{
		  "id": "https://iiif-qa.bodleian.ox.ac.uk/iiif/annotation/98adb17b-2b42-4e93-8701-f2ebc10e1018.json",
		  "type": "Annotation",
		  "target": "https://iiif-qa.bodleian.ox.ac.uk/iiif/canvas/98adb17b-2b42-4e93-8701-f2ebc10e1018.json",
		  "body": {
			"type": "Choice",
			"items": [
			  {
				"id": "https://iiif-qa.bodleian.ox.ac.uk/iiif/image/84487473-e54a-4866-a9d2-ea64b6e3f5ac/full/max/0/default.jpg",
				"type": "Image",
				"format": "image/jpeg",
				"label": {
				  "en": [
					"Obverse [albedo]"
				  ]
				},
				"width": 2958,
				"height": 4056,
				"service": [
				  {
					"@id": "https://iiif-qa.bodleian.ox.ac.uk/iiif/image/84487473-e54a-4866-a9d2-ea64b6e3f5ac",
					"@type": "ImageService2",
					"profile": "http://iiif.io/api/image/2/level1.json"
				  },
				  {
					"id": "https://iiif-qa.bodleian.ox.ac.uk/iiif/image/84487473-e54a-4866-a9d2-ea64b6e3f5ac",
					"type": "ImageService3",
					"profile": "level1"
				  },
				  {
					"id": "https://iiif-qa.bodleian.ox.ac.uk/iiif/image/lightingmap/84487473-e54a-4866-a9d2-ea64b6e3f5ac.json",
					"type": "LightingMapExtension",
					"profile": "http://iiif.io/api/extension/lightingmap",
					"mapType": "albedo"
				  }
				]
			  },
			  {
				"id": "https://iiif-qa.bodleian.ox.ac.uk/iiif/image/5a0630b3-2b08-4ce5-86fa-a465d472c167/full/max/0/default.jpg",
				"type": "Image",
				"format": "image/jpeg",
				"label": {
				  "en": [
					"Obverse [normal map]"
				  ]
				},
				"width": 2958,
				"height": 4056,
				"service": [
				  {
					"@id": "https://iiif-qa.bodleian.ox.ac.uk/iiif/image/5a0630b3-2b08-4ce5-86fa-a465d472c167",
					"@type": "ImageService2",
					"profile": "http://iiif.io/api/image/2/level1.json"
				  },
				  {
					"id": "https://iiif-qa.bodleian.ox.ac.uk/iiif/image/5a0630b3-2b08-4ce5-86fa-a465d472c167",
					"type": "ImageService3",
					"profile": "level1"
				  },
				  {
					"id": "https://iiif-qa.bodleian.ox.ac.uk/iiif/image/lightingmap/5a0630b3-2b08-4ce5-86fa-a465d472c167.json",
					"type": "LightingMapExtension",
					"profile": "http://iiif.io/api/extension/lightingmap",
					"mapType": "normal"
				  }
				]
			  }
			]
		  },
		  "motivation": "painting"
		}
	  ]
	}
]

```

## Image formats

The plug-in makes use of normal map data generated from photometric techniques of objects and renders a "2.5D"
interactive experience using a three.js canvas overlay.  Because of this, we recommend that you use a lossless image
format such as PNG or WebP for your albedo and normal map layers.

To make sure that OpenSeadragon uses this format you need to set it as the prefered format in your IIIF image info.json
responses, like as follows, you may also need to set extra formats:

```json
 "preferredFormats": [
    "webp"
],
"extraFormats": [
    "webp"
],

```

## Building Mirador with the plug-in

To build and minify your own copy of Mirador with the plug-in installed, start a new project and install at least `node.js` version 22.  
You can copy the .nvmrc config from this repo into the new project.

Then first install the plug-in by running the following command:

```bash
npm install github:bodleian/archiox-mirador-plugin.git
```

Then add the following dependencies verbatim to the dependencies dictionary of the package.json file so that it looks
like the example below:

```json
"dependencies": {
    "@blueprintjs/core": "^5.18.0",
    "@blueprintjs/icons": "^5.21.0",
    "@emotion/react": "^11.14.0",
    "@emotion/styled": "^11.14.0",
    "@rollup/plugin-replace": "^6.0.2",
    "@vitejs/plugin-react": "^4.3.4",
    "archiox-mirador-plugin": "github:bodleian/archiox-mirador-plugin.git",
    "mirador": "3.4.3",
    "mirador-image-tools": "0.11",
    "react": "^16.14.0",
    "react-dom": "^16.14.0",
    "react-i18next": "^15.4.1",
    "url-loader": "^4.1.1",
    "vite": "^6.2.3",
    "vite-plugin-svgr": "^4.3.0"
  },

```

Then delete the package-lock.json file and re-run the install command as follows:

```bash
npm install
```

Create a `/src` folder with a new `index.js` in it, copy-paste the following into it (edit for your needs):
**NB: ** This example is configured for the Bodleian Library set up of using content negotiation to serve
either v2/v3 IIIF image and or presentation API requests.  Replace `your_iiif_manifest.json` with the uri to the
manifest you wish to serve Mirador viewer.

```javascript
import Mirador from 'mirador';
import { relightMiradorPlugin } from 'archiox-mirador-plugin';
import { miradorImageToolsPlugin } from "mirador-image-tools/es/index";

const MiradorPlugins = {
    relightMiradorPlugin: relightMiradorPlugin,
    miradorImageToolsPlugin: miradorImageToolsPlugin
};

document.addEventListener('DOMContentLoaded', function() {
  let sideBarOpen = true;

  if (Math.min(window.innerWidth) < 1500 || navigator.userAgent.indexOf("Mobi") > -1){
    sideBarOpen = false;
  }

  const config = {
    id: 'viewer',
    windows: [{
      // enable and show the image tools plugin controls
      imageToolsEnabled: true,
      normalsInverted: true,
      imageToolsOpen: false,
      sideBarOpen: sideBarOpen,
      archioxPluginOpen: true,
      manifestId: 'your_iiif_manifest.json'
    }],
    requests: {
      // Manipulate IIIF HTTP requests (info.json, IIIF presentation manifests, annotations, etc) to add an Accept header so we use our v3 manifests
      preprocessors: [
        (url, options) => ({...options,
          headers: {
            ...options.headers,
            Accept: url.endsWith('/info.json')
                ? 'application/ld+json;profile="http://iiif.io/api/image/3/context.json"'
                : 'application/ld+json;profile="http://iiif.io/api/presentation/3/context.json"',
            ...(url.endsWith('/info.json') && { 'Cache-Control': 'no-cache' })
          }
        })
      ],
    },
    theme: {
      palette: {
        primary: {
          main: '#1967d2',
        },
      },
    },
    osdConfig:{
      crossOriginPolicy: "Anonymous",
      subPixelRoundingForTransparency: 1,
      overlayPreserveContentDirection: false,
    },
  };
  Mirador.viewer(config, Object.values(MiradorPlugins).flatMap((e) => ([...e])));
});
```

In your `package.json` file add the following to your scripts as follows:

```json
 "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  },
```

In the root folder create a new `index.html` and copy-paste the following example:

```html
<!doctype html>
<html>
<head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no">
    <!-- By default Mirador uses Roboto font. Be sure to load this or change the font -->
    <link rel="stylesheet" href="https://fonts.googleapis.com/css?family=Roboto:300,400,500">
    <title>Mirador Example</title>
</head>
<body>
<!-- Container element of Mirador whose id should be passed to the instantiating call as "id" -->
<div id="viewer"></div>
<script src="./src/index.js" type="module"></script>
</body>
</html>
```

In the root folder create an empty `vite.config.js` file and copy-paste the following config that
allows transpiling of JSX and exporting of SVGs as components.

```javascript
import { defineConfig } from 'vite';
import svgr from 'vite-plugin-svgr';
import react from '@vitejs/plugin-react'

export default defineConfig({
    plugins: [
        react(),
        svgr()
    ],
    esbuild: {
        loader: 'jsx',
            include: /.*\.jsx?$/,
            exclude: []
    },
    optimizeDeps: {
        esbuildOptions: {
            loader: {
                '.js': 'jsx',
            },
        },
    },
    build: {
        sourcemap: true,
    },
    base: './',
});
```

To build Mirador with the plug-ins installed, run the following script:

```bash
npm run build
```

To serve a preview of your Mirador build locally on the localhost, run the following strip:

```bash
npm run preview
```

## Local development

To make code changes and immediately see the changes to the plug-in locally, from the location where you cloned this repository, run the following script:

```bash
npm run dev
```

### es-lint and Prettier
To lint and autoformat your code locally, run the following script from this repositories root directory,
not your Mirador build, after installing the relevant dependencies in the normal way:

```bash
npm run lint
```

### Unit testing
To run the unit tests locally, run the following command:

```bash
npm run test
```

Make changes to the plug-in code and the changes will hot reload in your browser (just refresh the page).

## Gotchas

### CORS Policy for Cross-Origin Images
If you are serving images to your Mirador instance from another host, Three.js will fail to use them as WebGL textures due to CORS restrictions. You'll see errors like:
```
THREE.WebGLState: SecurityError: Failed to execute 'texSubImage2D' on 'WebGL2RenderingContext': The image element contains cross-origin data
```

**Solution:** The dev environment already includes the fix. If you're building your own Mirador instance, add `crossOriginPolicy: "Anonymous"` to your `osdConfig`:

```javascript
osdConfig: {
    crossOriginPolicy: "Anonymous",
},
```

This tells OpenSeadragon to load images with the `crossOrigin="anonymous"` attribute, allowing Three.js to use them as textures (provided the image server sends proper CORS headers like `Access-Control-Allow-Origin: *`).

# Usage

You can play around with our current implementation [here](https://iiif.bodleian.ox.ac.uk/iiif/mirador/?iiif-content=https://iiif.bodleian.ox.ac.uk/iiif/manifest/1fc3f35d-bbb5-4524-8fbe-a5bcb5468be2.json)

1.  When Mirador first opens you'll see our plug-in user interface open by default on the top left of the OpenSeadragon viewport. The following options are available in this initial state, capture render snapshot is disabled until the 3D overlay is activated:
    - <img src="./public/icons/close_sharp.svg" width="24" style="vertical-align: middle;" alt="Close Sharp Icon" />|<img src="./public/icons/build_outline.svg" width="24" style="vertical-align: middle;" alt="Build outline icon"/> Collapse/Expand rendering toolbar
      - This button simply expands or collapses the main plugin toolbar.
    - <img src="./public/icons/highlight_outline.svg" width="24" style="vertical-align: middle;" alt="Highlight outline icon"/>|<img src="./public/icons/highlight_baseline.svg" width="24" style="vertical-align: middle;" alt="Highlight baseline icon"/> Activate 3D overlay/Deactivate 3D overlay
      - This button activates or deactivates a WebGL 3D renderer overlay positioned over the object in the OpenSeadragon viewport that relights the object using normal and albedo map data.
    - <img src="./public/icons/collections_outline.svg" width="24" style="vertical-align: middle;" /> Select active layer
      - This button opens up a submenu allowing the user to choose which layer in the IIIF choices stack is currently active. 
 
    
2.  To start rendering the Mirador object in three dimensions, press the <img src="./public/icons/highlight_outline.svg" width="24" style="vertical-align: middle;" /> `Activate 3D overlay` button. A 3D overlay will be superimposed over the object in the OpenSeadragon viewport and the toolbar will expand downwards with the following extra options:
    - <img src="./public/icons/control_camera_baseline.svg" width="24" style="vertical-align: middle;" /> Move directional light trackball
    - <img src="./public/icons/highlight_baseline.svg" width="24" style="vertical-align: middle;" /> Move directional light torch
    - <img src="./public/icons/highlight_outline.svg" width="24" style="vertical-align: middle;" /> Change directional light intensity
    - <img src="./public/icons/wb_incandescent_outline.svg" width="24" style="vertical-align: middle;" /> Change ambient light intensity
    - <img src="./public/icons/height_baseline.svg" width="24" style="vertical-align: middle;" /> Change normal depth
    - <img src="./public/icons/waves_baseline.svg" width="24" style="vertical-align: middle;" /> Change object roughness 
    - <img src="./public/icons/flare_baseline.svg" width="24" style="vertical-align: middle;" /> Change object metalness
    - <img src="./public/icons/replay_sharp.svg" width="24" style="vertical-align: middle;" /> Reset all light settings 
    - <img src="./public/icons/assistant_outline.svg" width="24" style="vertical-align: middle;" /> Turn on directional light helper
    - <img src="./public/icons/brightness_full_baseline.svg" width="24" style="vertical-align: middle;" />|<img src="./public/icons/localmovies_baseline.svg" width="24" style="vertical-align: middle;" /> Render using specular enhancement/Render using physically based rendering 
    - <img src="./public/icons/help_outline.svg" width="24" style="vertical-align: middle;" /> Click here to get help
    
# Key Features

1. Realtime user controlled relighting and rendering of 2.5D scenes using just a 2D diffuse colour map and normal map
2. User controllable directional and ambient virtual light sources
3. Diffuse colour map and normal map ambivalence: it doesn't matter if your scanning data comes from photometric stereo, photogrammetry, or RTI
4. IIIF choices layer selection menu
5. Render capture button to capture and share the current render on the screen
6. PBR or Phong shading modes for photorealism or exaggerating shadows and highlights
7. Downloadable IIIF choices images; which you can import into your own tools

# Contributing

We welcome contributions to improving this public repository.  Please be aware that in order to submit a change you may need
to fork the project first.  Please base all development branches off of the QA branch first, any pull requests to master will
be rebased onto QA by our reviewers.

Please see the [installation instructions](#installation-instructions) for how to set up a local development environment to
further improve this tool.

# License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

# Contact Information

For all issues related to the code and behaviour of this repo please raise an issue here.  For all other queries related to
ARCHiOx please contact digital-bodleian@bodleian.ox.ac.uk

# Acknowledgements

This project was made possible through the generous support of **The Helen Hamlyn Trust**, whose funding enabled its development.

We also gratefully acknowledge **Factum Arte** for providing the Selene scanning technology, and ongoing technical support that made this work possible.
