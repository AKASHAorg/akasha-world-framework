import type { Elevation } from '../components/types/common.types';

export function getElevationClasses(elevation: Elevation) {
  switch (elevation) {
    case 'none':
      return '';
    case '1':
      /**
       * default card elevation,
       * used mostly on beam cards
       * and other cards without an explicitly defined elevation level
       * */
      return 'shadow([0_0_4px_rgba(0,0,0,0.2)] dark:[0_0_2px_rgba(255,255,255,0.15)])';
    case '2':
      /**
       * for dropdowns and popovers
       */
      return 'shadow([0_0_10px_rgba(0,0,0,0.2)] dark:[0_0_4px_rgba(255,255,255,0.4)])';
    case '3':
      /**
       * for cards in a card
       */
      return 'shadow-[0_0_4px_rgba(203,203,203,0.6)]';
    case '4':
      /**
       * for button hover states
       */
      return 'shadow-[0_0_6px_rgba(186,154,224,0.8)]';
  }
}
