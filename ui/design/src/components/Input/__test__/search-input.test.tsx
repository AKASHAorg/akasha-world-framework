import '@testing-library/jest-dom/extend-expect';
import { cleanup, fireEvent } from '@testing-library/react';
import * as React from 'react';
import { act, create } from 'react-test-renderer';
import { SearchInput } from '../';
import { customRender, wrapWithTheme } from '../../../test-utils';
const mockDataSource = {
  users: [
    {
      name: 'Gilbert Carter',
      imageUrl: 'http://placebeard.it/640/480',
    },
    {
      name: 'Johan Gimli',
      imageUrl: 'http://placebeard.it/640/480',
    },
  ],
  tags: ['#gitcoin', '#gitcoinbounties'],
  apps: [
    {
      name: 'GitCoin',
      imageUrl: 'http://placebeard.it/640/480',
    },
  ],
};

const mockClassName = 'search-input-test-class';
const mockPlaceholderStrings = {
  placeholder: 'Search',
  resultsTitle: 'Search results',
  usersTitle: 'Users',
  tagsTitle: 'Tags',
  appsTitle: 'Apps',
};
const testSearchStr = 'Gi';

const createBaseComponent = (props: any = {}) => {
  return (
    <SearchInput
      getData={props.getDataHandler || jest.fn()}
      className={mockClassName}
      dataSource={mockDataSource}
      {...mockPlaceholderStrings}
      onClickApp={props.onClickAppHandler || jest.fn()}
      onClickTag={props.onClickTagHandler || jest.fn()}
      onClickUser={props.onClickUserhandler || jest.fn()}
    />
  );
};

describe('<SearchInput /> Component', () => {
  let componentWrapper = create(<></>);
  beforeEach(() => {
    act(() => {
      componentWrapper = create(wrapWithTheme(createBaseComponent()));
    });
  });
  afterEach(() => {
    act(() => {
      componentWrapper.unmount();
    });
    cleanup();
  });
  it('should mount without errors', () => {
    const component = componentWrapper.root.findByType(SearchInput);
    expect(component).toBeDefined();
  });
  it.skip('should match snapshot', () => {
    expect(componentWrapper.toJSON()).toMatchSnapshot('search-input');
  });
  it('should be customizable via className passed as prop', async () => {
    const { container } = customRender(createBaseComponent(), {});
    const rootNode = container.firstElementChild?.firstElementChild;
    expect(rootNode?.classList.contains(mockClassName)).toBe(true);
  });

  it('should call getData when input is changed', async () => {
    const getDataHandler = jest.fn();
    const { findByTestId } = customRender(createBaseComponent({ getDataHandler }), {});
    const searchInputNode = await findByTestId('search-input');
    fireEvent.change(searchInputNode, { target: { value: 'test search string' } });
    expect(getDataHandler).toBeCalledTimes(1);
  });

  it.skip('should call getData with searchString and searchId: getData(searchString: string, activeTab: string, searchId: string);', async () => {
    let getDataParams: any[] = [];
    const getDataHandler = jest.fn((arg1, arg2, arg3) => {
      getDataParams = [arg1, arg2, arg3];
    });
    const { findByTestId } = customRender(createBaseComponent({ getDataHandler }), {});
    const searchInputNode = await findByTestId('search-input');
    fireEvent.change(searchInputNode, { target: { value: testSearchStr } });
    expect(getDataParams[0]).toStrictEqual(testSearchStr);
    expect(getDataParams[1]).toBeDefined();
    expect(getDataParams[2]).toBeDefined();
  });
  it('should show search results dropdown when there are results', async () => {
    const getDataHandler = jest.fn();
    const { findByTestId } = customRender(createBaseComponent({ getDataHandler }), {});
    const searchInputNode = await findByTestId('search-input');
    fireEvent.change(searchInputNode, { target: { value: testSearchStr } });
    const resultsDropdown = await findByTestId('search-results-dropdown');
    expect(resultsDropdown).toBeDefined();
  });
  it('should show placeholder, resultsTitle, usersTitle, tagsTitle, appsTitle, props when passed', async () => {
    const { findByPlaceholderText, findByText, findByTestId } = customRender(
      createBaseComponent(),
      {},
    );
    const searchInputNode = await findByTestId('search-input');
    const placeholder = await findByPlaceholderText(mockPlaceholderStrings.placeholder);
    fireEvent.change(searchInputNode, { target: { value: testSearchStr } });
    const resultsTitle = await findByText(mockPlaceholderStrings.resultsTitle);
    const usersTitle = await findByText(mockPlaceholderStrings.usersTitle);
    const appsTitle = await findByText(mockPlaceholderStrings.appsTitle);
    const tagsTitle = await findByText(mockPlaceholderStrings.tagsTitle);
    expect(placeholder).toBeDefined();
    expect(placeholder.nodeName === 'INPUT').toBe(true);
    expect(resultsTitle).toBeDefined();
    expect(usersTitle).toBeDefined();
    expect(appsTitle).toBeDefined();
    expect(tagsTitle).toBeDefined();
  });
  it.skip('should call onClickAppHandler', () => {});
  it.skip('should call onClickTagHandler', () => {});
  it.skip('should call onClickUserhandler', () => {});
});
