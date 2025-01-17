import './jest.setup';

jest.mock('@tanstack/react-router', () => ({
  ...jest.requireActual('@tanstack/react-router'),
  useNavigate: jest.fn().mockImplementation(() => {
    return jest.fn();
  }),
}));
