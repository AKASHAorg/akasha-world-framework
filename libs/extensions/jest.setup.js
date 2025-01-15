import * as mediaHooks from '@akashaorg/ui-core-hooks/lib/utils/media-utils';

import '@testing-library/jest-dom';

jest.mock('react-i18next', () => ({
  ...jest.requireActual('react-i18next'),
  useTranslation: () => ({ t: key => key, i18n: { languages: ['en'] } }),
}));

jest
  .spyOn(mediaHooks, 'getMediaUrl')
  .mockReturnValue({ originLink: '', fallbackLink: '', pathLink: '' });
