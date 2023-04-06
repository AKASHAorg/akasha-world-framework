export const HOME = 'Overview';
export const DASHBOARD = 'Dashboard';
export const EDIT_CATEGORIES = 'EditCategories';
export const EDIT_CONTACT_INFO = 'EditContactInfo';
export const RESIGN_ROLE = 'ResignRole';
export const MODERATORS = 'Moderators';
export const HISTORY = 'Transparency Log';
export const HISTORY_ITEM = 'Transparency Log Item';
export const MODERATION_VALUE = 'Moderation Value';

export const baseOverviewUrl = '/overview';
export const baseDashboardUrl = '/dashboard';

export default {
  [HOME]: baseOverviewUrl,
  [DASHBOARD]: baseDashboardUrl,
  [EDIT_CATEGORIES]: `${baseDashboardUrl}/edit-categories`,
  [EDIT_CONTACT_INFO]: `${baseDashboardUrl}/edit-info`,
  [RESIGN_ROLE]: `${baseDashboardUrl}/resign-from-role`,
  [MODERATORS]: '/moderators',
  [HISTORY]: '/history',
  [HISTORY_ITEM]: '/history/:itemId',
  [MODERATION_VALUE]: `${baseOverviewUrl}/values/:value`,
};
