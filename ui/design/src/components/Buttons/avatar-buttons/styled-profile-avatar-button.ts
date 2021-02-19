import { Box } from 'grommet';
import styled from 'styled-components';

const StyledWrapperBox = styled(Box)`
  display: inline-flex;
`;

const ButtonInfo = styled.div`
  max-width: 10rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  font-size: 0.75rem;
  line-height: 1rem;
  font-weight: lighter;
`;

export { ButtonInfo, StyledWrapperBox };
