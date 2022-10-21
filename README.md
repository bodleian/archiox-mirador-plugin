# archiox-mirador-plugin
This is a dev version of the archiox-mirador-plugin, it will not work as a mirador plugin yet, it is designed to run
as a standalone mirador instance for development.  If you wish to get this working you will need either access to the
Bodleian VPN or you will have to have your own image tile and iiif manifest server running.  This example runs using
a public gist hosted on Richard Benjamin Allen's GitHub.

# Installation
Make sure you have node.js and npm installed.  It might also be good to install nvm to allow you to switch versions of
node.js more easily.

To install run the following command from the root directory of the repository.

```bash
npm install
```

Then to run the dev server.

```bash
npm start
```
# Development
All new features should be placed in feature branches and not pushed direct to `Qa` or `Master` as per our other repos.  That way we can test new features without breaking anything.
