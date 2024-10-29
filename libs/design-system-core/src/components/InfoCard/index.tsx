import React, { ReactNode } from 'react';
import Card from '../Card';
import Stack from '../Stack';
import Text, { TextProps } from '../Text';
import { tw } from '@twind/core';

export type InfoCardProps = {
  assetName?: string;
  assetExtension?: string;
  publicImgPath?: string;
  titleLabel?: ReactNode;
  bodyLabel?: ReactNode;
  titleVariant?: TextProps['variant'];
  bodyVariant?: TextProps['variant'];
  customWidthStyle?: string;
  customStyle?: string;
};

/**
 * An InfoCard component offers a quick way to include an informational card
 * with text and an illustrative image. An example use case is an announcement
 * that you want to put at the top so visitors can easily see.
 * @param assetName - (optional) name of the image file
 * @param assetExtension - (optional) image file extension
 * @param publicImgPath - (optional) path to image location
 * @param titleLabel - title of the card. It can be a React node.
 * @param bodyLabel - (optional) additional body text of the card. It can be a React node.
 * @param titleVariant - (optional) customize the text variant of the title
 * @param bodyVariant - (optional) customize the text variant of the body
 * @param customWidthStyle - (optional) customize the width of the card
 * @param customStyle - (optional) apply custom styling
 * @example
 * ```tsx
 *     <InfoCard
 *       titleLabel={'Hello there!'}
 *       bodyLabel={'There is nothing here!'}
 *       publicImgPath={publicImgPath}
 *       assetName="longbeam-notfound"
 *     />
 * ```
 **/
const InfoCard: React.FC<InfoCardProps> = ({
  titleLabel,
  titleVariant = 'h6',
  bodyVariant = 'footnotes2',
  bodyLabel,
  assetName,
  assetExtension = 'webp',
  publicImgPath = '/images',
  customWidthStyle,
  customStyle = '',
}) => {
  return (
    <Stack
      direction="column"
      align="center"
      justify="center"
      spacing="gap-y-3"
      customStyle={`sm:gap-y-4 ${customStyle}`}
    >
      {assetName ? (
        <img
          loading="lazy"
          decoding="async"
          className={tw('object-contain h-[11.25rem]')}
          aria-label={assetName}
          src={`${publicImgPath}/${assetName}.${assetExtension}`}
          alt={assetName}
        />
      ) : (
        <Card
          elevation="none"
          radius={20}
          background={{ light: 'grey8', dark: 'grey5' }}
          customStyle="h-32 w-32 sm:h-52 sm:w-52"
        ></Card>
      )}
      <Stack
        direction="column"
        align="center"
        justify="center"
        spacing="gap-y-2"
        customStyle={customWidthStyle}
      >
        {titleLabel && <Text variant={titleVariant}>{titleLabel}</Text>}
        {bodyLabel && (
          <Text
            variant={bodyVariant}
            color={{ light: 'grey5', dark: 'grey6' }}
            weight="normal"
            align="center"
          >
            {bodyLabel}
          </Text>
        )}
      </Stack>
    </Stack>
  );
};

export default InfoCard;
