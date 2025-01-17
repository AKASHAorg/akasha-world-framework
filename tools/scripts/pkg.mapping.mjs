import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const pkgMapping = {
  '@akashaorg/app-antenna': path.resolve(__dirname, '../../dist', 'apps/antenna'),
  '@akashaorg/app-profile': path.resolve(__dirname, '../../dist', 'apps/profile'),
  '@akashaorg/app-auth-ewa': path.resolve(__dirname, '../../dist', 'apps/auth-app'),
  '@akashaorg/app-vibes': path.resolve(__dirname, '../../dist', 'apps/vibes'),
  '@akashaorg/app-vibes-console': path.resolve(__dirname, '../../dist', 'apps/vibes-console'),
  '@akashaorg/app-search': path.resolve(__dirname, '../../dist', 'apps/search'),
  '@akashaorg/app-extensions': path.resolve(__dirname, '../../dist', 'apps/extensions'),
  '@akashaorg/app-legal': path.resolve(__dirname, '../../dist', 'apps/legal'),
  '@akashaorg/app-notifications': path.resolve(__dirname, '../../dist', 'apps/notifications'),
  '@akashaorg/app-settings-ewa': path.resolve(__dirname, '../../dist', 'apps/settings'),
  '@akashaorg/app-world-builder': path.resolve(__dirname, '../../dist', 'apps/world-builder'),
};

export default pkgMapping;
