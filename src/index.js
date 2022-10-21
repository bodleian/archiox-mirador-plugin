import Mirador from 'mirador/dist/es/src/index';
import index from './plugins/archiox-mirador-plugin';

const config = {
  id: 'mirador-viewer',
  windows: [
    {
      manifestId: 'https://gist.githubusercontent.com/BeebBenjamin/ceb7c61c952d47b8dad5849f0d5f7f98/raw/c22e9eeef0fd7b9dc3d10d3c356eaab97f6e9f36/rawl_copperplates_g21.json',
    }
  ],
};

const plugins = [
    index
];

Mirador.viewer(config, plugins);
