import { defineConfig } from '@twind/core';
import presetAutoprefix from '@twind/preset-autoprefix';
import presetTailwind from '@twind/preset-tailwind';
import presetLineClamp from '@twind/preset-line-clamp';
import twindBaseConfig from '../../../twindBaseConfig';
import presetContainerQueries from '@twind/preset-container-queries';

export default defineConfig({
  presets: [presetAutoprefix(), presetTailwind(), presetLineClamp(), presetContainerQueries()],
  ...twindBaseConfig,
});
