import Mirador from 'mirador';
import { relightMiradorPlugin } from '../src';
import { miradorImageToolsPlugin } from 'mirador-image-tools/es/index';

const MiradorPlugins = {
  miradorImageToolsPlugin: miradorImageToolsPlugin,
  relightMiradorPlugin: relightMiradorPlugin,
};

export { Mirador, MiradorPlugins };
