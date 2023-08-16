import React from 'react';
import SearchBar, { ISearchBar } from './index';

export default {
  title: 'Search/SearchBar',
  component: SearchBar,
  argTypes: {
    inputValue: { control: 'text' },
    inputPlaceholderLabel: { control: 'text' },
    onInputChange: { action: 'input changed' },
  },
};

const Template = (args: ISearchBar) => {
  const [inputValue, setInputValue] = React.useState('');
  const handleInputChange = (ev: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(ev.target.value);
  };
  return (
    <div>
      <SearchBar {...args} onInputChange={handleInputChange} inputValue={inputValue} />
    </div>
  );
};

export const BaseSearchBar = Template.bind({});

BaseSearchBar.args = {
  inputValue: '',
  inputPlaceholderLabel: 'Search',
};
