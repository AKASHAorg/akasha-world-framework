import React from 'react';
import Stack from '../Stack';
import Caption from './Caption';
import { Input } from './Input';
import Label from '../Label';
import { Multiline } from './Multiline';
import { TextFieldProps } from './types';

/**
 * The TextField component creates versatile and highly-customizable inputs that can be used in
 * forms or any place that requires an input. It supports both single-line and multi-line text input,
 * as well as additional features like labels, captions, and validation status. The component accepts
 * all props of an Input component, plus more.
 * @param iconLeft - (optional) icon that will be placed on the left hand side of the input
 * @param iconRight - (optional) icon that will be placed on the right hand side of the input
 * @param type - input type, which could be `text` or `multiline`
 * @param status - (optional) for controlling the validation status
 * @param radius - (optional) for customizing the radius of the input
 * @param altBg - boolean (optional) whether to use an alternative background
 * @param fullWidth - boolean (optional) whether the input will occupy the full width of the container
 * @param label - (optional) input label
 * @param caption - (optional) input caption that might be used to explain validation status
 * @param justifyCaption - (optional) for customizing the caption position
 * @param required - boolean (optional) whether it is a required field
 * @param customStyle - (optional) apply any other custom styles. Please use standard Tailwind CSS classes
 * @param inputRef - (optional) pass the ref here
 * is used in a form and it is a required field
 * @example
 * ```tsx
 * <TextField type="text" required={true} label={'Username'} placeholder={'Please enter your username...'} />
 * ```
 **/
const TextField: React.FC<TextFieldProps> = props => {
  const {
    id,
    required,
    label,
    status,
    caption,
    disabled,
    justifyCaption,
    customStyle = '',
    inputRef,
    ...rest
  } = props;

  return (
    <Stack direction="column" spacing="gap-y-2" customStyle={customStyle}>
      {label && (
        <Label id={id} required={required} disabled={disabled}>
          {label}
        </Label>
      )}
      {rest.type === 'multiline' && (
        <Multiline
          id={id}
          required={required}
          status={status}
          disabled={disabled}
          ref={inputRef}
          {...rest}
        />
      )}
      {rest.type === 'text' && (
        <Input
          id={id}
          required={required}
          status={status}
          disabled={disabled}
          ref={inputRef}
          {...rest}
        />
      )}
      {caption && (
        <Caption justifyContents={justifyCaption} status={status}>
          {caption}
        </Caption>
      )}
    </Stack>
  );
};
export default TextField;
