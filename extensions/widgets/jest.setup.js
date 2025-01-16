import { genAppProps } from '@akashaorg/af-testing';
import * as useRootComponentProps from '@akashaorg/ui-core-hooks/lib/use-root-props';

jest.spyOn(useRootComponentProps, 'useRootComponentProps').mockReturnValue(genAppProps());
