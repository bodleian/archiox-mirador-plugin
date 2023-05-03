# archiox-mirador-plugin
This is a dev version of the archiox-mirador-plugin, it is designed to be installed as a mirador plug-in.

# Installation
Make sure you have node.js and npm installed.  It might also be good to install nvm to allow you to switch versions of
node.js more easily.

To add and install  the plugin into you Mirador instance run the following commands from the root directory of your 
Mirador build repository (you will need to be able to access using an ssh key).

First add the plugin to your dependencies.

```bash
npm install git+ssh://git@github.com:bodleian/archiox-mirador-plugin.git
```

Then install all your dependencies including the plugin.

```bash
npm install
```

Make sure you have the following npm packages installed in your mirador instance:

* @babel/core 
* @babel/preset-env
* @babel/preset-react    
* babel-loader

Make sure you have a `babel.config.js` file containing the following:

```ecmascript 6
module.exports = {
    presets:[
        "@babel/preset-env",
        "@babel/preset-react"
    ]
}
```

Make sure you add the following to your `webpack.config.js` file to enable experimental jsx usage in react files:

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

# Development
All new features should be placed in feature branches and not pushed direct to `Qa` or `Master` as per our other repos.  That way we can test new features without breaking anything.
