import Mirador from 'mirador';
import { relightMiradorPlugin } from '../src';
import { miradorImageToolsPlugin } from 'mirador-image-tools/es/index';

const MiradorPlugins = {
  relightMiradorPlugin: relightMiradorPlugin,
  miradorImageToolsPlugin: miradorImageToolsPlugin,
};

export { Mirador, MiradorPlugins };
