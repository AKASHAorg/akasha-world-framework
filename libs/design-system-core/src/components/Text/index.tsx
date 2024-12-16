import React, { AriaAttributes, DOMAttributes, HTMLAttributes, PropsWithChildren } from 'react';
import { apply, tw } from '@twind/core';

import { getTag } from './getTag';
import { getAlignmentClasses } from './getAlignmentClasses';
import { getWeightClasses } from './getWeightClasses';
import { Color } from '../types/common.types';
import { getColorClasses } from '../../utils';

export type Heading = 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';

export type BodyText =
  | 'subtitle1'
  | 'subtitle2'
  | 'body1'
  | 'body2'
  | 'label'
  | 'footnotes1'
  | 'footnotes2';

export type ButtonText = 'button-lg' | 'button-md' | 'button-sm';

export type Variant = Heading | BodyText | ButtonText;

export type TextAlignment = 'start' | 'center' | 'end' | 'justify';

export type FontWeight = 'normal' | 'semibold' | 'bold' | 'light' | 'medium';

export type TextProps = PropsWithChildren<
  Partial<
    {
      id: string;
      variant: Variant;
      color: Color;
      as: Heading | 'p' | 'span' | 'label';
      align: TextAlignment;
      truncate: boolean;
      breakWord: boolean;
      lineClamp: number;
      weight: FontWeight;
      selectable: boolean;
      customStyle: string;
    } & AriaAttributes &
      Omit<HTMLAttributes<Heading>, 'color' | 'onClick'>
  >
>;

const VARIANT_TO_CSS_CLASSES_MAPPER: Record<Variant, string> = {
  h1: 'text-[4rem] leading-[5rem] font-bold',
  h2: 'text-[3rem] leading-[4rem] font-bold',
  h3: 'text-[2rem] leading-[3rem] font-bold',
  h4: 'text-[1.5rem] leading-[2.25rem] font-bold',
  h5: 'text-[1.25rem] leading-[1.875rem] font-bold',
  h6: 'text-[1rem] leading-[1.5rem] font-bold',
  subtitle1: 'text-[1rem] leading-[1.5rem] font-light',
  subtitle2: 'text-[0.875rem] leading-[1.375rem] font-light',
  body1: 'text-[1rem] leading-[1.5rem]',
  body2: 'text-[0.875rem] leading-[1.375rem]',
  label: 'text-[1rem] leading-[1.5rem] font-medium',
  footnotes1: 'text-[0.75rem] leading-[1.125rem] tracking-[.075em] font-normal',
  footnotes2: 'text-[0.75rem] leading-[1.125rem] font-medium',
  'button-lg': 'block text-[1rem] leading-[1.5rem] font-bold',
  'button-md': 'block text-[0.875rem] leading-[1.5rem] font-bold',
  'button-sm': 'block text-[0.75rem] leading-[1.125rem] font-bold',
};

/**
 * The Text component offers a versatile and highly-customizable way to render text content in your
 * app. It supports various text variants, colors, alignments, truncation, word breaking, line clamping,
 * font weights, and HTML tags. For customization, please use standard Taiwind CSS classes.
 * @param id - (optional) id of the text if any
 * @param customStyle - (optional) apply any other custom styles. Please use standard Tailwind CSS classes
 * @param variant - for customizing the text variant. The default value is `body1`
 * @param color - (optional) for customizing the text color
 * @param as - (optional) useful for specifying the role of the text as something else, e.g. span, label
 * @param align - (optional) for customizing the alignment of the text
 * @param truncate - boolean (optional) whether to truncate the text when the length exceeds the width of the container
 * @param breakWord - boolean (optional) whether to break the word when it exceeeds the width of the container
 * @param lineClamp - number (optional) truncate a block of text after a (number) of lines
 * @param weight - (optional) for customizing the font weight
 * @param ref - (optional) pass the ref here
 * @param selectable - boolean (optional) whether the text is selectable
  * @example
 * ```tsx
 *  <Text variant="h6">H6 Text</Text>
 * <Text variant="h1">H1 Text</Text>
 * <Text variant="body1">Body1 Text</Text>
 * <Text variant="button-md" align="center" weight="bold">Bold Text aligned in the center</Text>
 *  <Text variant="h6" as="label">
        Text with variant H6 used as a label
    </Text>
 * ```
 **/
const Text: React.FC<TextProps> = ({
  id,
  as,
  variant = 'body1',
  align = 'start',
  color = { dark: 'white', light: 'black' },
  truncate,
  breakWord,
  lineClamp,
  weight,
  children,
  selectable = true,
  customStyle = '',
  ...rest
}) => {
  const tag = as ?? getTag(variant);
  const alignmentStyle = align ? getAlignmentClasses(align) : '';
  const colorStyle = getColorClasses(color, 'text');
  const truncateStyle = truncate ? 'truncate' : '';
  const wordBreakStyle = breakWord ? 'break-all' : '';
  const lineClampStyle = lineClamp ? `line-clamp-${lineClamp}` : '';
  const weightStyle = weight ? getWeightClasses(weight) : '';
  const noSelectClass = selectable ? '' : 'select-none';

  const baseStyles = VARIANT_TO_CSS_CLASSES_MAPPER[variant];

  return React.createElement(
    tag,

    {
      id,
      className: tw(
        apply`${noSelectClass} ${baseStyles} ${colorStyle} ${alignmentStyle} ${truncateStyle} ${wordBreakStyle} ${weightStyle} ${lineClampStyle} ${customStyle}`,
      ),
      ...rest,
    },
    children,
  );
};

export default Text;
