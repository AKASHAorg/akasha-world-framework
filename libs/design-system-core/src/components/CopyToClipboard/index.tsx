import React, { PropsWithChildren, useState } from 'react';
import { useCopyToClipboard } from 'react-use';

import Button from '../Button';
import Tooltip from '../Tooltip';

export type CopyToClipboardProps = PropsWithChildren<{
  stringToBeCopied: string;
  copyText?: string;
  copiedText?: string;
}>;

/**
 * A CopyToClipboard component serves a specific purpose: display a tooltip on hover to explain to
 * the user the purpose of the component and copy the content of component to the Clipboard.
 * The user can then paste the copied content elsewhere. The copied content remains in memory
 * until the user copies something else.
 * @param stringToBeCopied - the string to be copied
 * @param copyText - (optional) text that will be displayed in the tooltip before copying
 * @param copiedText - (optional) text that will be displayed in the tooltip after copying
 * ```tsx
 *  <CopyToClipboard
 *    stringToBeCopied='0x003410490050000320006570034567114572000'
 *   >
 *    0x003410490050000320006570034567114572000
 *   </CopyToClipboard>
 * ```
 **/
const CopyToClipboard: React.FC<CopyToClipboardProps> = ({
  stringToBeCopied,
  copyText = 'Copy to clipboard',
  copiedText = 'Copied',
  children,
}) => {
  const [copied, setCopied] = useState(false);
  const [, copyToClipboard] = useCopyToClipboard();

  const onCopy = () => {
    copyToClipboard(stringToBeCopied);
    setCopied(true);
  };

  const closeToolTip = () =>
    setTimeout(() => {
      setCopied(false);
    }, 1000);

  return (
    <Tooltip
      placement="bottom"
      content={copied ? copiedText : copyText}
      // this makes the tooltip controlled once copied, so as to show the label instantly
      {...(copied && {
        open: copied,
        onClose: closeToolTip,
        onOpen: () => setCopied(true),
      })}
    >
      <Button onClick={onCopy} plain>
        {children}
      </Button>
    </Tooltip>
  );
};

export default CopyToClipboard;
