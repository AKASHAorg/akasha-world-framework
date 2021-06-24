import React from 'react';
import DS from '@akashaproject/design-system';

import { moderationRequest } from '@akashaproject/ui-awf-hooks';

import ExplanationsCardEntry, { IExplanationsBoxEntryProps } from './explanations-box-entry';

const { Box, Text } = DS;

export interface IExplanationsBoxProps extends Omit<IExplanationsBoxEntryProps, 'entry'> {
  entryId: string;
  logger: any;
}

const ExplanationsCard: React.FC<IExplanationsBoxProps> = props => {
  const { entryId, reportedByLabel, forLabel, logger } = props;

  const [requesting, setRequesting] = React.useState<boolean>(false);
  const [flags, setFlags] = React.useState<any>([]);

  React.useEffect(() => {
    fetchContentFlags();
  }, []);

  const fetchContentFlags = async () => {
    setRequesting(true);
    try {
      const response = await moderationRequest.getFlags(entryId);
      setFlags(response);
      setRequesting(false);
    } catch (error) {
      setRequesting(false);
      logger.error('[explanations-box.tsx]: fetchContentFlags err %j', error.message || '');
    }
  };

  return (
    <Box width="100%">
      {requesting && <Text>Loading ...</Text>}
      {!requesting && (
        <Box>
          {flags.map((flag: any, id: number) => (
            <ExplanationsCardEntry
              key={id}
              entry={flag}
              reportedByLabel={reportedByLabel}
              forLabel={forLabel}
              logger={logger}
            />
          ))}
        </Box>
      )}
    </Box>
  );
};

export default ExplanationsCard;
