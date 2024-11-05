import * as React from 'react';
import ErrorCard from './error-card';
import Card from '../Card';

export type ErrorLoaderProps = React.PropsWithChildren<{
  /**
   * Error type
   */
  type:
    | 'no-apps'
    | 'not-authenticated'
    | 'script-error'
    | 'page-not-found'
    | 'list-not-available'
    | 'empty-list';
  /* Path to public folder */
  publicImgPath?: string;
  /**
   * The error title
   */
  title: React.ReactNode;
  /**
   * Additional details about the error
   */
  details?: React.ReactNode;
  dataTestId?: string;
  noWrapperCard?: boolean;
  imageBoxStyle?: string; // use valid twind classes
  customStyle?: string; // use valid twind classes
}>;

/**
 * An ErrorLoader serves the purpose of displaying an error card with an image and a messagge
 * explaining to the user the error in detail. It can also have an optional call to action button
 * @param type -  error type
 * @param publicImgPath - (optional) path of the image to be displayed
 * @param title - error title
 * @param details - additional details about the error
 * @param noWrapperCard - flag to determine whether to wrap the ErrorLoader with Card component or not
 * @param imageBoxStyle - provide custom twind classes for image container, if needed
 * @param customStyle - provide custom twind classes for general Card wrapper, if needed
 * @example
 * ```tsx
 *  <ErrorLoader type="script-error" title="Error in akasha app" details={error.message} />
 * ```
 **/
const ErrorLoader: React.FC<ErrorLoaderProps> = ({ children, ...props }) => {
  const {
    type,
    publicImgPath = '/images',
    title,
    details,
    noWrapperCard,
    imageBoxStyle,
    dataTestId,
    customStyle,
  } = props;

  let imagesrc: string;

  switch (type) {
    case 'no-apps':
      imagesrc = `${publicImgPath}/no-apps-error.webp`;
      break;
    case 'not-authenticated':
      imagesrc = `${publicImgPath}/not-authenticated.webp`;
      break;
    case 'page-not-found':
      imagesrc = `${publicImgPath}/new404.webp`;
      break;
    case 'list-not-available':
      imagesrc = `${publicImgPath}/list-not-available.webp`;
      break;
    case 'empty-list':
      imagesrc = `${publicImgPath}/longbeam-notfound.webp`;
      break;
    default:
      imagesrc = `${publicImgPath}/general-error.webp`;
      break;
  }

  const errorCardUi = (
    <ErrorCard
      type={type}
      title={title}
      details={details}
      imageSrc={imagesrc}
      imageBoxStyle={imageBoxStyle}
    >
      {children}
    </ErrorCard>
  );

  return noWrapperCard ? (
    <> {errorCardUi}</>
  ) : (
    <Card padding="p-6" dataTestId={dataTestId} customStyle={customStyle}>
      {errorCardUi}
    </Card>
  );
};

export default ErrorLoader;
