import React, { useEffect, useMemo, useState } from 'react';
import Stack from '../Stack';
import { MagnifyingGlassIcon } from '../Icon/hero-icons-outline';
import List, { ListItem } from '../List';
import TextField from '../TextField';
import Tag from './Tag';
import { InputProps, TextFieldProps } from '../TextField/types';
import { useCloseActions } from '../../utils';
import { Separator } from './types';
import { isSeparator } from './isSeparator';

type Selected = { value: string; index?: number };

export type AutoCompleteProps = {
  options?: string[];
  placeholder?: InputProps['placeholder'];
  disabled?: InputProps['disabled'];
  value?: string;
  customStyle?: string;
  multiple?: boolean;
  separators?: Separator[];
  tags?: Set<string>;
  onChange?: (value: string | string[]) => void;
  onSelected?: ({ value, index }: Selected) => void;
} & Pick<TextFieldProps, 'label' | 'caption' | 'status'>;

/**
 * An AutoComplete component improves the user experience by suggesting possible
 * completions as the user types.
 * @param options - string
 * @param placeholder - placeholder text (optional)
 * @param disabled - (optional) whether to disable the text input
 * @param value - string (optional) set the value for the input
 * @param customStyle - (optional) custom styling to apply if any
 * @param multiple - boolean (optional) whether to delay suggestion because it is a phrase with multiple words
 * @param separators - (optional) a list of keystrokes that separate the words and start the action
 * @param tags - (optional) a set of string
 * @param onChange - (optional) handler on text input change
 * @param onSelected - (optional) handler when user selects a suggestion
 *
 * @example
 * ```tsx
 *  <AutoComplete placeholder={'Start searching...'} options={['a','b','c']} separators={['Comma', 'Space', 'Enter']} />
 * ```
 **/
const AutoComplete: React.FC<AutoCompleteProps> = props => {
  const {
    options,
    placeholder,
    disabled,
    customStyle = '',
    value,
    multiple,
    separators = ['Enter'],
    tags,
    label,
    caption,
    status,
    onChange,
    onSelected,
  } = props;
  const [filters, setFilters] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const autoCompleteRef = useCloseActions(() => {
    setShowSuggestions(false);
  });

  useEffect(() => {
    if (options.length > 0) {
      setFilters(
        options.filter(option =>
          value ? option.toLowerCase().startsWith(value.toLowerCase()) : true,
        ),
      );
    }
  }, [value, options]);

  const suggestions: ListItem[] = useMemo(
    () =>
      filters.map(filter => ({
        label: filter,
        variant: 'subtitle2',
      })),
    [filters],
  );

  const updateTag = (tag: string, remove?: boolean) => {
    const newTags = new Set(tags);

    if (remove) {
      newTags.delete(tag);
      if (onChange) onChange([...newTags]);
      return;
    }

    newTags.add(tag);
    if (onChange) onChange([...newTags]);
  };

  return (
    <Stack
      direction="column"
      justify="center"
      spacing="gap-y-2"
      customStyle={customStyle}
      ref={autoCompleteRef}
    >
      <TextField
        type="text"
        placeholder={placeholder}
        iconRight={<MagnifyingGlassIcon />}
        value={value}
        label={label}
        caption={caption}
        status={status}
        onChange={event => {
          const value = event.target.value;
          /*
           ** On Mac there is 'add period with double-space' setting that adds dot while hitting space in split second difference.
           ** If it occurs then do nothing.
           **/
          if (separators.includes('Space') && value.endsWith('. ')) {
            return;
          }
          setShowSuggestions(true);
          if (onChange) onChange(value);
        }}
        onFocus={() => {
          setShowSuggestions(true);
        }}
        onKeyDown={event => {
          if (multiple) {
            if (isSeparator(event.code, separators)) {
              if (value && status !== 'error') {
                if (onChange) onChange('');
                updateTag(value);
                setShowSuggestions(false);
              }
              event.preventDefault();
              event.nativeEvent.stopImmediatePropagation();
            }
          }
        }}
        customStyle="rounded-3xl"
        radius={100}
        disabled={disabled}
      />
      {showSuggestions && suggestions.length > 0 && (
        <Stack direction="row" customStyle={'relative'}>
          <List
            items={suggestions}
            showDivider={false}
            onSelected={({ label, index }) => {
              setShowSuggestions(false);
              if (onChange) onChange(label);
              if (onSelected) onSelected({ value: label, index });
            }}
            customStyle="absolute max-h-28 w-full overflow-y-auto scrollbar z-10"
          />
        </Stack>
      )}
      {tags?.size > 0 && (
        <Stack direction="row" align="center" spacing="gap-2" customStyle="flex-wrap">
          {[...tags].map(tag => (
            <Tag
              key={tag}
              tag={tag}
              onRemove={() => {
                updateTag(tag, true);
              }}
            />
          ))}
        </Stack>
      )}
    </Stack>
  );
};
export default AutoComplete;
