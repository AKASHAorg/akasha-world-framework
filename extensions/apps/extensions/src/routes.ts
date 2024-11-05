export const HOME = 'Explore';
export const EXTENSIONS = 'Extensions Hub';
export const INSTALLED = 'Installed Extensions';
export const MY_EXTENSIONS = 'My Extensions';
export const DEVELOPER_MODE = 'Developer Mode';
export const INFO = 'App Info';
export const CREATE_EXTENSION = 'Create Extension';
export const EDIT_EXTENSION = 'Edit Extension';
export const SUBMIT_EXTENSION = 'Submit Extension';
export const GALLERY_MANAGER = 'Gallery Manager';

export default {
  default: '/explore',
  [HOME]: '/explore',
  [EXTENSIONS]: '/extensions-hub',
  [INSTALLED]: '/installed-extensions',
  [MY_EXTENSIONS]: '/my-extensions',
  [DEVELOPER_MODE]: '/developer-mode',
  [INFO]: '/info/$appId',
  [CREATE_EXTENSION]: '/create-extension',
  [EDIT_EXTENSION]: '/edit-extension',
  [SUBMIT_EXTENSION]: '/submit-extension',
  [GALLERY_MANAGER]: '/gallery-manager',
};
