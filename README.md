# archiox-mirador-plugin
This is the ARCHiOx Mirador Viewer plug-in, it is designed to be installed as a Mirador viewer plug-in and is not
a standalone application.

# Demo
You can play around with our implementation [here]
(https://iiif.bodleian.ox.ac.uk/iiif/mirador/?iiif-content=https://iiif.bodleian.ox.ac.uk/iiif/manifest/1fc3f35d-bbb5-4524-8fbe-a5bcb5468be2.json)

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

# Installation and build
Make sure you have node.js and npm installed.  It might also be good to install nvm to allow you to switch versions of
node.js more easily.

Change the default version of node, node version 16+ is compatible.

```bash
nvm install 16
```

Make nvm use whatever version is compatible.

```bash
nvm use 16
```

To add and install the plug-in into you Mirador instance run the following commands from the root directory of your 
Mirador build repository.

First add the plugin to your dependencies.

```bash
npm install https://github.com/bodleian/archiox-mirador-plugin.git
```

Then install all your package dependencies including the plug-in.

```bash
npm install
```

Make sure you have the following npm packages installed in your mirador instance:

* @babel/core 
* @babel/preset-env
* @babel/preset-react    
* babel-loader

Make sure you have a `babel.config.js` file in your mirador instance containing the following, this is so you can
transpile the code into something that can run on any machine:

```ecmascript 6
module.exports = {
    presets:[
        "@babel/preset-env",
        "@babel/preset-react"
    ]
}
```

Make sure you add the following to your `webpack.config.js` file to enable experimental JSX usage in React files,
otherwise the plug-in will not build correctly:

```ecmascript 6
module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        loader: 'babel-loader',
        options: { presets: ['@babel/env','@babel/preset-react'] },
      }
    ]
  }
```

Add the plug-in to the `index.js` file of your Mirador instance as follows:

```ecmascript 6
import Mirador from 'mirador/dist/es/src/index';
import { miradorImageToolsPlugin } from 'mirador-image-tools';
import { relightMiradorPlugin } from "archiox-mirador-plugin";

const MiradorPlugins = {
  relightMiradorPlugin: relightMiradorPlugin,
  miradorImageToolsPlugin: miradorImageToolsPlugin
};

export default {Mirador, MiradorPlugins};
```

In your Mirador `package.json` file add the following to your scripts as follows:

```json
 "scripts": {
    "webpack": "webpack --config webpack/webpack.config.js --mode=production"
  },
```

In your `index.html` file in your webpack folder add something like the below example:

```html
<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <!-- By default Mirador uses Roboto font. Be sure to load this or change the font -->
    <link rel="stylesheet" href="https://fonts.googleapis.com/css?family=Roboto:300,400,500">
    <title>Mirador Example</title>
      <!-- this will be different depending on your Mirador build folder and if it is in its own repository -->
      <script src="dist/mirador-with-plugins.js"></script>
    <script>
      document.addEventListener('DOMContentLoaded', function() {
        const config = {
          id: 'viewer',
          windows: [{
            // enable and show the image tools plug-in controls
            imageToolsEnabled: true,
            imageToolsOpen: true,
            // open a specific manifest (optional)
            manifestId: 'some url for a manifest id'
          }],
            requests: {
                // Manipulate IIIF HTTP requests (info.json, IIIF presentation manifests, annotations, etc) to add an Accept header so we use our v3 manifests
                preprocessors: [
                    (url, options) => ({...options,
                        headers: {
                            ...options.headers,
                            Accept: url.endsWith('/info.json')
                                    ? 'application/ld+json;profile=http://iiif.io/api/image/3/context.json'
                                    : 'application/ld+json;profile="http://iiif.io/api/presentation/3/context.json"'
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
                subPixelRoundingForTransparency: 2,
                immediateRender: true
            },
        };
        // this includes all of the plug-ins under MiradorPlugins
        // it's the equivalent of [ ...MiradorPlugins.pluginA, ...MiradorPlugins.pluginB, ...MiradorPlugins.pluginC] 
          // for all plug-ins in MiradorPlugins
        Mirador.viewer(config, Object.values(MiradorPlugins).flatMap((e) => ([...e])));
      });
    </script>
  </head>
  <body>
    <!-- Container element of Mirador whose id should be passed to the instantiating call as "id" -->
    <div id="viewer"></div>
  </body>
</html>
```

To build Mirador with the plug-ins installed, run the following command:

```bash
npm run webpack
```

You should now be able to open the `index.html` file in your local browser and see your working Mirador build with
plug-ins.

# Development  Rules
All new features should be placed in feature branches and not pushed direct to the `qa` or `master` branches as per our 
other repos.  That way we can test new features without breaking anything.

# Developing locally
To develop the application locally you can work on and edit the code in your Mirador build folders `node_modules`
directory under `node_modules/archiox-mirador-plugin/src/plugins` and rebuild the application using `npm run webpack`.

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
To lint and autoformat your code locally, run the following command:

```bash
npm run lint
```

## Unit testing
To run the unit tests locally, run the following command:

```bash
npm run test
```

## Gotchas
If you are serving images to your Mirador instance from another host you may not be able to load them depending on your
CORS policy.  You can get around this for local dev by changing a setting of OpenSeaDragon installed in your
`node_modules` folder.  Find the openseadragon.js file in `node_modules/openseadragon/build/openseadragon/` and change
the value of `crossOriginPolicy` from false to `Anonymous` in the `DEFAULT_SETTINGS` object and rebuild your Mirador
using `npm run webpack`.  Be warned that running `npm ci` will wipe out this change and you will need to reimplement it
every time you do a clean installation.
