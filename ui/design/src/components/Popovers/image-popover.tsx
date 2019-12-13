import { Box, Tabs, Text } from 'grommet';
import * as React from 'react';
import { Icon } from '../Icon/index';
import { LinkInput } from '../Input/index';
import {
  StyledButton,
  StyledDrop,
  StyledImageInput,
  StyledImg,
  StyledInputDiv,
  StyledTab,
  StyledText,
} from './styled-image-popover';

export interface IImagePopover {
  target: HTMLElement;
  closePopover: () => void;
  insertImage: (url: string) => void;
}

const ImagePopover: React.FC<IImagePopover> = props => {
  const { target, closePopover, insertImage } = props;

  const [linkInputValue, setLinkInputValue] = React.useState('');
  const [uploadValue, setUploadValue] = React.useState('');
  const [uploadValueName, setUploadValueName] = React.useState('');

  const uploadInputRef: React.RefObject<HTMLInputElement> = React.useRef(null);

  const handleLinkInputChange = (ev: React.ChangeEvent<HTMLInputElement>) => {
    setLinkInputValue(ev.target.value);
  };

  const handleUploadInputClick = () => {
    if (uploadInputRef.current) {
      uploadInputRef.current.click();
    }
    return;
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!(e.target.files && e.target.files[0])) {
      setUploadValue('');
      return;
    }
    const file = e.target.files[0];
    const fileName = file.name;
    const fileReader = new FileReader();
    fileReader.addEventListener('load', () => {
      const result = fileReader.result as string;
      setUploadValue(result);
      setUploadValueName(fileName);
    });
    fileReader.readAsDataURL(file);
  };

  const handleInsertImage = () => {
    // @Todo check if isUrl and isImage
    if (linkInputValue) {
      insertImage(linkInputValue);
    }
    if (uploadValue) {
      insertImage(uploadValue);
    }
    closePopover();
  };

  const renderUploadTabTitle = () => (
    <Box direction="row" gap="xsmall" justify="center">
      <Icon type="upload" />
      <Text>{'Upload image'}</Text>
    </Box>
  );

  const renderUrlTabTitle = () => (
    <Box direction="row" gap="xsmall" justify="center">
      <Icon type="link" />
      <Text>{'By url'}</Text>
    </Box>
  );
  return (
    <StyledDrop
      target={target}
      align={{ top: 'bottom' }}
      onClickOutside={closePopover}
      onEsc={closePopover}
    >
      <Tabs>
        <StyledTab title={renderUploadTabTitle()}>
          {uploadValue && (
            <Box pad="large">
              <Box
                pad={{ bottom: 'large' }}
                margin={{ bottom: 'xsmall' }}
                direction="row"
                align="center"
              >
                <StyledImg src={uploadValue} />
                <Text>{uploadValueName}</Text>
              </Box>

              <Box align="end" pad={{ vertical: 'medium' }}>
                <StyledButton
                  label={'Insert Image'}
                  onClick={handleInsertImage}
                  disabled={!uploadValue}
                  primary={true}
                  color="accent"
                />
              </Box>
            </Box>
          )}
          {!uploadValue && (
            <Box align="center" justify="center" pad={{ top: 'medium' }}>
              <StyledInputDiv onClick={handleUploadInputClick}>
                <StyledText size="medium" color="secondaryText">
                  {'Drop an image or click to upload a file from your computer'}
                </StyledText>
                <StyledImageInput onChange={handleFileUpload} type="file" ref={uploadInputRef} />
              </StyledInputDiv>
            </Box>
          )}
        </StyledTab>
        <StyledTab title={renderUrlTabTitle()}>
          <Box pad={{ vertical: 'medium' }}>
            <Box pad="medium">
              <LinkInput inputValue={linkInputValue} onChange={handleLinkInputChange} />
            </Box>
            <Box align="end" pad="medium">
              <StyledButton
                label={'Insert Image'}
                onClick={handleInsertImage}
                disabled={!linkInputValue}
                primary={true}
                color="accent"
              />
            </Box>
          </Box>
        </StyledTab>
      </Tabs>
    </StyledDrop>
  );
};

export default ImagePopover;
