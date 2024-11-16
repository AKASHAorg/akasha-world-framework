const SPLASH_TEMPLATE_ID = '#splash-screen-tpl';
const FOUR_OH_FOUR_TEMPLATE_ID = '#four-oh-four-tpl';
const ERROR_TEMPLATE_ID = '#error-tpl';
const APP_LOADING_CARD_TEMPLATE_ID = '#application-loading-card-tpl';
const NOT_LOGGED_IN_TEMPLATE_ID = '#not-logged-in-tpl';

/**
 * Show the splash screen
 */
export const showPageSplash = (): void => {
  const template: HTMLTemplateElement | null = document.querySelector(SPLASH_TEMPLATE_ID);
  if (template) {
    const content = template.content;
    document.body.appendChild(content.cloneNode(true));
  }
};
/**
 * Hide the splash screen
 */
export const hidePageSplash = (): void => {
  const template: HTMLTemplateElement | null = document.querySelector(SPLASH_TEMPLATE_ID);
  if (template) {
    const splashNode = template.content.firstElementChild;
    if (splashNode) {
      const nodeId = splashNode.id;
      const nodeToRm = Array.from(document.body.children).find(n => n.id === nodeId);
      if (nodeToRm) {
        document.body.removeChild(nodeToRm);
      }
    }
  }
};

export const show404 = (
  parentId: string,
  appName: string,
  extensionAppUrl: string,
  worldTitle?: string,
): void => {
  const template: HTMLTemplateElement | null = document.querySelector(FOUR_OH_FOUR_TEMPLATE_ID);

  if (template) {
    const templateRootNode = template.content.firstElementChild;
    const parentNode = document.getElementById(parentId);

    template.content
      .getElementById('search-extension-button')
      .setAttribute('href', extensionAppUrl);

    if (parentNode && !parentNode.querySelector(`#${templateRootNode.id}`)) {
      parentNode.appendChild(template.content.cloneNode(true));

      const appNameNode: HTMLElement | null = document.querySelector(
        `#${templateRootNode.id} #app-name`,
      );

      const worldTitleNode: HTMLElement | null = document.querySelector(
        `#${templateRootNode.id} #world-title`,
      );

      if (appNameNode) {
        appNameNode.innerText = appName;
      }

      if (worldTitleNode && worldTitle) {
        worldTitleNode.innerText = worldTitle;
      }
    }
  }
};

export const hide404 = (parentId: string): void => {
  const template: HTMLTemplateElement | null = document.querySelector(FOUR_OH_FOUR_TEMPLATE_ID);
  if (template) {
    const rootNode = template.content.firstElementChild;
    const parentNode = document.getElementById(parentId);
    if (rootNode && parentNode && document.getElementById(rootNode.id)) {
      parentNode.removeChild(document.getElementById(rootNode.id));
    }
  }
};

type ErrorOptions = {
  // the slot in which to show the error
  slot: string;
  // callback for the refresh button
  // if omitted the refresh button will not be shown
  onRefresh?: () => void;
  // callback for unload button
  // if omitted the unload extension will not be shown
  onUnload?: () => void;
};

export const showError = (errorOptions: ErrorOptions): void => {
  const template: HTMLTemplateElement | null = document.querySelector(ERROR_TEMPLATE_ID);
  if (template) {
    const templateRootNode = template.content.firstElementChild;
    const parentNode = document.getElementById(errorOptions.slot);
    if (parentNode && !parentNode.querySelector(`#${templateRootNode.id}`)) {
      parentNode.appendChild(template.content.cloneNode(true));
      if (typeof errorOptions.onRefresh === 'function') {
        const button = parentNode.querySelector('#refresh-button');
        const actionsContainer = parentNode.querySelector('#error-actions');
        if (button) {
          button.classList.remove('hidden');
          button.addEventListener('click', errorOptions.onRefresh);
        }
        if (actionsContainer) {
          actionsContainer.classList.remove('hidden');
        }
      }
      if (typeof errorOptions.onUnload === 'function') {
        const button = parentNode.querySelector('#unload-button');
        const actionsContainer = parentNode.querySelector('#error-actions');
        if (button) {
          button.classList.remove('hidden');
          button.addEventListener('click', errorOptions.onUnload);
        }
        if (actionsContainer) {
          actionsContainer.classList.remove('hidden');
        }
      }
    }
  }
};

export const hideError = (parentId: string): void => {
  const template: HTMLTemplateElement | null = document.querySelector(ERROR_TEMPLATE_ID);
  if (template) {
    const rootNode = template.content.firstElementChild;
    const parentNode = document.getElementById(parentId);
    if (rootNode && parentNode && document.getElementById(rootNode.id)) {
      parentNode.removeChild(document.getElementById(rootNode.id));
    }
  }
};

export const showLoadingCard = (parentId: string): void => {
  const template: HTMLTemplateElement | null = document.querySelector(APP_LOADING_CARD_TEMPLATE_ID);
  if (template) {
    const templateRootNode = template.content.firstElementChild;
    const parentNode = document.getElementById(parentId);
    if (parentNode && !parentNode.querySelector(`#${templateRootNode.id}`)) {
      parentNode.appendChild(template.content.cloneNode(true));
    }
  }
};

export const hideLoadingCard = (parentId: string): void => {
  const template: HTMLTemplateElement | null = document.querySelector(APP_LOADING_CARD_TEMPLATE_ID);
  if (template) {
    const rootNode = template.content.firstElementChild;
    const parentNode = document.getElementById(parentId);
    if (rootNode && parentNode && document.getElementById(rootNode.id)) {
      parentNode.removeChild(document.getElementById(rootNode.id));
    }
  }
};

export const showNotLoggedIn = (parentId: string, onClick?: () => void): void => {
  const template: HTMLTemplateElement | null = document.querySelector(NOT_LOGGED_IN_TEMPLATE_ID);
  if (template) {
    const templateRootNode = template.content.firstElementChild;
    const parentNode = document.getElementById(parentId);
    if (parentNode && !parentNode.querySelector(`#${templateRootNode.id}`)) {
      parentNode.appendChild(template.content.cloneNode(true));
      parentNode.querySelector('#connect-button')?.addEventListener('click', onClick);
    }
  }
};

export const hideNotLoggedIn = (parentId: string): void => {
  const template: HTMLTemplateElement | null = document.querySelector(NOT_LOGGED_IN_TEMPLATE_ID);
  if (template) {
    const rootNode = template.content.firstElementChild;
    const parentNode = document.getElementById(parentId);
    if (rootNode && parentNode && document.getElementById(rootNode.id)) {
      parentNode.removeChild(document.getElementById(rootNode.id));
    }
  }
};
