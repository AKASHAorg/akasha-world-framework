export const DEV_MODE_KEY = '@akashaorg/app-settings-ewa:dev-mode';
export const DRAFT_EXTENSIONS = 'draft-extensions';
export const DRAFT_RELEASES = 'draft-releases';
// used for the release description which is saved on the model's meta field
export const PROVIDER = 'Extensions App';
export const PROPERTY = 'description';
export const MAX_CONTRIBUTORS = 16;
export const MAX_GALLERY_IMAGES = 16;
export const MAX_UPLOAD_RETRIES = 3;
export const MAX_CONTRIBUTORS_DISPLAY = 3;

export type ExtSearch = { type: ExtType };

export enum ExtType {
  LOCAL = 'local',
  PUBLISHED = 'published',
}
