# archiox-mirador-plugin
This is the ARCHiOx Mirador Viewer plug-in, it is designed to be installed as a Mirador viewer plug-in and is not
a standalone application.

# Demo
You can play around with our implementation [here](https://iiif.bodleian.ox.ac.uk/iiif/mirador/?iiif-content=https://iiif.bodleian.ox.ac.uk/iiif/manifest/1fc3f35d-bbb5-4524-8fbe-a5bcb5468be2.json)

Look for the torch button in the top left of the viewer window, pressing this will open up our plug-in menu that allows 
you to render the normal map data alongside the albedo map in realtime in your browser giving the object the illusion of
3D depth (2.5D) and allowing you to re-light and change the light direction by dragging your mouse cursor over the 
"sphere" control.  You can also play around with metalness and roughness in `physically based rendering` (PBR) mode, or 
shininess in `specular enhancement` mode.  The intensity of both directional and ambient light, and the normal depths
can also be changed using the slider controls to allow you to explore all the details recorded in these special objects.

# Image Formats
The plug-in makes use of normal map data generated from photometric techniques of objects and renders a "2.5D"
interactive experience using a three.js canvas overlay.  Because of this, we recommend that you use a lossless image
format such as PNG or WebP for your albedo and normal map layers. WebP, however, is not currently supported as of 
version 4.10 of OpenSeadragon, it is, however, planned for inclusion in version 5.0.  In order to work around this for 
now, you can build your own version of OpenSeadragon with the following modification, where we have added WebP to the 
list of formats supported.

```javascript
var FILEFORMATS = {
            bmp:  false,
            jpeg: true,
            jpg:  true,
            png:  true,
            tif:  false,
            wdp:  false,
            webp: true
}
```

Host your build on GitHub or GitLabs and override the version used by Mirador by adding something like the following
to your package.json file, where the `org/repository` points to your own.

```json
"overrides": {
    "openseadragon": "github:org/repository"
  }
```

# IIIF Presentation and Image API Support
The plug-in is intended to be used with version 3 of the IIIF presentation and image APIs to make use of the
`preferredFormat` property, so that you can use WebP format.  However, you can technically get choices working
in version 2.  For the plug-in to work at all you will need to extend IIIF presentation API for choices in the 
following way, where we add in type `lightingMapExtension` and `mapType`:

```json
{
            "id": "http://0.0.0.0:8000/iiif/canvas/object_id.json",
            "type": "Canvas",
            "label": {
                "en": [
                    "front end"
                ]
            },
            "width": 1508,
            "height": 5300,
            "items": [
                {
                    "id": "http://0.0.0.0:8000/iiif/annotationpage/object_id.json",
                    "type": "AnnotationPage",
                    "items": [
                        {
                            "id": "http://0.0.0.0:8000/iiif/annotation/object_id.json",
                            "type": "Annotation",
                            "target": "http://0.0.0.0:8000/iiif/canvas/object_id.json",
                            "body": {
                                "type": "Choice",
                                "items": [
                                    {
                                        "id": "http://0.0.0.0:8000/iiif/image/image_id/full/max/0/default.png",
                                        "type": "Image",
                                        "format": "image/png",
                                        "label": {
                                            "en": [
                                                "front end"
                                            ]
                                        },
                                        "width": 1508,
                                        "height": 5300,
                                        "service": [
                                            {
                                                "@id": "http://0.0.0.0:8000/iiif/image/image_id",
                                                "@type": "ImageService2",
                                                "profile": "http://iiif.io/api/image/2/level1.json"
                                            },
                                            {
                                                "id": "http://0.0.0.0:8000/iiif/image/image_id",
                                                "type": "ImageService3",
                                                "profile": "level1"
                                            },
                                            {
                                                "id": "http://0.0.0.0:8000/iiif/image/lightingmap/image_id.json",
                                                "type": "LightingMapExtension",
                                                "profile": "http://iiif.io/api/extension/lightingmap",
                                                "mapType": "albedo"
                                            }
                                        ]
                                    },
                                    {
                                        "id": "http://0.0.0.0:8000/iiif/image/image_id/full/max/0/default.png",
                                        "type": "Image",
                                        "format": "image/png",
                                        "label": {
                                            "en": [
                                                "front end"
                                            ]
                                        },
                                        "width": 1508,
                                        "height": 5300,
                                        "service": [
                                            {
                                                "@id": "http://0.0.0.0:8000/iiif/image/image_id",
                                                "@type": "ImageService2",
                                                "profile": "http://iiif.io/api/image/2/level1.json"
                                            },
                                            {
                                                "id": "http://0.0.0.0:8000/iiif/image/image_id",
                                                "type": "ImageService3",
                                                "profile": "level1"
                                            },
                                            {
                                                "id": "http://0.0.0.0:8000/iiif/image/lightingmap/image_id.json",
                                                "type": "LightingMapExtension",
                                                "profile": "http://iiif.io/api/extension/lightingmap",
                                                "mapType": "normal"
                                            }
                                        ]
                                    }
                                ]
                            }
                        }
                    ],
                    "motivation": "painting"
                }
            ]
        }
```

# IIIF Choices and Mirador Viewer Config
This Mirador plug-in makes use of IIIF Choices and is developed for single page view only; because of this we take control of Mirador via the plug-in and set
the config for the default viewing experience whenever a Choices body type is detected at canvas level.  

You are still free to manually change to book view in the Mirador menu, however, the plug-in won't work as intended.

The view config we inject is identical to the exerpt below:

```json
    views: [
    { key: 'single', behaviors: ['individuals', 'paged'] },
    { key: 'book', behaviors: ['individuals', 'paged'] },
    { key: 'scroll', behaviors: ['continuous'] },
    { key: 'gallery' },
    ]
```

# Installation and build
Make sure you have node.js and npm installed.  It might also be good to install nvm to allow you to switch versions of
node.js more easily.

Change the default version of node, node version 22+ is compatible.

```bash
nvm install 20.19.0
```

Make nvm use whatever version is compatible.

```bash
nvm use 20
```

To build Mirador bundled with our plug-in, run the following commands from the root directory of your 
Mirador build repository:

Install the dependencies.

```bash
npm install mirador@3.4.2  
```

Then add the following dependencies verbatim to the dependencies dictionary of the package.json file so that it looks
like the example below:

```json
"dependencies": {
    "mirador": "3.4.3",
    "archiox-mirador-plugin": "github:bodleian/archiox-mirador-plugin.git",
    "mirador-image-tools": "0.11",
    "react": "^16.14.0",
    "react-dom": "^16.14.0",
    "@emotion/react": "^11.14.0",
    "@emotion/styled": "^11.14.0",
    "react-i18next": "^15.4.1",
    "url-loader": "^4.1.1",
    "vite": "^6.2.3",
    "@vitejs/plugin-react": "^4.3.4",
    "vite-plugin-svgr": "^4.3.0"
}
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

# Development  Rules
All new features should be placed in feature branches and not pushed direct to the `qa` or `master` branches as per our 
other repos.  That way we can test new features without breaking anything.

# Developing locally
To develop the application locally you can work on and edit the code in your Mirador build folders `node_modules`
directory under `node_modules/archiox-mirador-plugin/src/plugins` and rebuild the application using `npm run build`.

Any changes you get working in this way can be then added to commits as a feature branch of the `archiox-mirador-plugin`
repository.

To pull in changes from a feature branch you can specify the branch and commit in your `package.json` and 
`package-lock.sjon` files in your Mirador build folder.  Update all instances of `archiox-mirador-plugin` to something
like the following (this is only an example of the kind of thing to look for):

```json
"packages": {
    "": {
"archiox-mirador-plugin": "github:bodleian/archiox-mirador-plugin#example-feature-branch",
},
"node_modules/archiox-mirador-plugin": {
"version": "0.0.1",
"resolved": "https://github.com/bodleian/archiox-mirador-plugin.git#example-commit-hash",
"license": "N/A",
"dependencies": {
"react-loader-spinner": "^5.3.4",
"three": "^0.146.0"
},
"peerDependencies": {
"mirador": "^3.0.0-rc.4",
"react": "16.x",
"react-dom": "16.x"
}
}
```

Then run the following command (warning this will wipe out any local changes, because it does a clean install):

```bash
npm ci
```

## es-lint and Prettier
To lint and autoformat your code locally, run the following script from this repositories root directory, 
not your Mirador build, after installing the relevant dependencies in the normal way:

```bash
npm run lint
```

## Unit testing
To run the unit tests locally, run the following command:

```bash
npm run test
```

## Gotchas

### CORS Policy for Cross-Origin Images
If you are serving images to your Mirador instance from another host, Three.js will fail to use them as WebGL textures due to CORS restrictions. You'll see errors like:
```
THREE.WebGLState: SecurityError: Failed to execute 'texSubImage2D' on 'WebGL2RenderingContext': The image element contains cross-origin data
```

**Solution:** Add `crossOriginPolicy: "Anonymous"` to your Mirador `osdConfig`:

```javascript
const config = {
  id: 'viewer',
  // ... other config
  osdConfig: {
    crossOriginPolicy: "Anonymous",
  },
};
```

This tells OpenSeadragon to load images with the `crossOrigin="anonymous"` attribute, allowing Three.js to use them as textures (provided the image server sends proper CORS headers like `Access-Control-Allow-Origin: *`).
