import React, {
  useState,
  useRef,
  useCallback,
  useEffect,
  useLayoutEffect,
  KeyboardEvent,
  RefObject,
  useImperativeHandle,
} from 'react';
import {
  createEditor,
  Editor,
  Range,
  Transforms,
  Text as SlateText,
  Element,
  Descendant,
} from 'slate';
import isUrl from 'is-url';
import { withHistory } from 'slate-history';
import { Editable, Slate, withReact, ReactEditor, RenderElementProps } from 'slate-react';

import type { IMetadata, IPublishData, Image, Profile } from '@akashaorg/typings/lib/ui';

import Avatar from '@akashaorg/design-system-core/lib/components/Avatar';
import Button from '@akashaorg/design-system-core/lib/components/Button';
import Stack from '@akashaorg/design-system-core/lib/components/Stack';
import Icon from '@akashaorg/design-system-core/lib/components/Icon';
import Text from '@akashaorg/design-system-core/lib/components/Text';
import MessageCard from '@akashaorg/design-system-core/lib/components/MessageCard';

import {
  Bold,
  Italic,
  Underline,
  ListNumbered,
  ListBulleted,
  AlignTextCenter,
  AlignTextLeft,
  AlignTextRight,
} from '@akashaorg/design-system-core/lib/components/Icon/akasha-icons';
import {
  ArrowPathIcon,
  ExclamationTriangleIcon,
} from '@akashaorg/design-system-core/lib/components/Icon/hero-icons-outline';
import EditorMeter from '@akashaorg/design-system-core/lib/components/EditorMeter';

import { countMentions, CustomEditor, getSlateMentions } from './helpers';
import { serializeToPlainText } from './serialize';
import { MentionPopover } from './mention-popover';
import { editorDefaultValue } from './initialValue';
import { renderElement, renderLeaf } from './renderers';
import { withMentions, withLinks } from './plugins';

import { MarkButton, BlockButton } from './formatting-buttons';
import { tw } from '@twind/core';

const MAX_TEXT_LENGTH = 500;

export type ExtendedNode = Descendant | { children: Descendant[] };

export type EditorActions = {
  insertText: (text: string) => void;
  insertBreak: () => void;
  children: Descendant[];
  getAddedSlateMentions: () => string[];
};

export type EditorBoxProps = {
  avatar?: Profile['avatar'];
  showAvatar?: boolean;
  profileId: string | null;
  actionLabel?: string;
  placeholderLabel?: string;
  emojiPlaceholderLabel?: string;
  disableActionLabel?: string;
  maxEncodedLengthErrLabel?: string;
  noMentionsLabel?: string;
  disablePublish?: boolean;
  minHeight?: string;
  withMeter?: boolean;
  withToolbar?: boolean;
  mentions?: Profile[];
  publishingApp?: string;
  initialEditorValue?: Descendant[];
  ref?: React.Ref<unknown>;
  showCancelButton?: boolean;
  cancelButtonLabel?: string;
  showDraft?: boolean;
  showPostButton?: boolean;
  // this is to account for the limitations on the ceramic storage side
  maxEncodedLength?: number;
  mentionsLimit?: { count: number; label: string };
  customStyle?: string;
  editorActionsRef?: RefObject<EditorActions>;
  onPublish?: (publishData: IPublishData) => void;
  onClear?: () => void;
  onCancelClick?: () => void;
  getMentions?: (query: string) => void;
  handleDisablePublish?: (value: boolean) => void;
  transformSource: (avatar: Image) => Image;
  encodingFunction: (value: Descendant[]) => string;
};

/* eslint-disable complexity */
/**
 * Editor component based on the slate.js framework
 * @param uploadRequest - upload a file and returns a promise that resolves to an array
 * @param withMeter - display the letter counter, maximum length is internally defined at 500
 * @param withToolbar - display the rich text formatting toolbar
 * @param transformSource - utility function to provide ipfs images with gateways to be accessed
 * @param encodingFunction - utility function to check if the encoded slate content is too big
 */
const EditorBox: React.FC<EditorBoxProps> = props => {
  const {
    avatar,
    showAvatar = true,
    profileId,
    actionLabel,
    placeholderLabel,
    disableActionLabel,
    maxEncodedLengthErrLabel,
    noMentionsLabel,
    disablePublish,
    onPublish,
    minHeight,
    withMeter,
    withToolbar,
    getMentions,
    mentions = [],
    publishingApp = 'AkashaApp',
    initialEditorValue,
    cancelButtonLabel,
    onCancelClick,
    showCancelButton,
    showPostButton = true,
    transformSource,
    maxEncodedLength = 6000,
    mentionsLimit,
    customStyle = '',
    editorActionsRef,
    handleDisablePublish,
    encodingFunction,
  } = props;

  const mentionPopoverRef: React.RefObject<HTMLDivElement> = useRef(null);

  const [mentionTargetRange, setMentionTargetRange] = useState<Range | null>(null);
  const [index, setIndex] = useState(0);
  const [mentionsLimitReached, setMentionsLimitReached] = useState(false);

  const [letterCount, setLetterCount] = useState(0);

  const [publishDisabledInternal, setPublishDisabledInternal] = useState(true);
  const [showMaxEncodedLengthErr, setShowMaxEncodedLengthErr] = useState(false);

  const editorContainerRef = useRef<HTMLDivElement>(null);
  const mentionPopoverWidth = useRef<number>(0);

  /**
   * initialise editor with all the required plugins
   */
  const editorRef = useRef(withLinks(withMentions(withHistory(withReact(createEditor())))));

  const editor = editorRef.current;

  /**
   * insert links here to be able to access the image state
   * and prevent link preview generation when there are images
   * already uploaded or currently uploading
   */
  const { insertData, insertText, children } = editor;

  const handleInsertLink = (text: string) => {
    CustomEditor.insertLink(editor, text.trim());
  };

  editor.insertText = text => {
    if (text && isUrl(text.trim())) {
      handleInsertLink(text);
    } else {
      insertText(text);
    }
  };

  editor.insertData = data => {
    const text = data.getData('text/plain');
    if (text && isUrl(text.trim())) {
      handleInsertLink(text);
    } else {
      insertData(data);
    }
  };

  useLayoutEffect(() => {
    const editorContainerRect = editorContainerRef.current.getBoundingClientRect();
    if (editorContainerRect) mentionPopoverWidth.current = editorContainerRect.width;
  }, []);

  useImperativeHandle(
    editorActionsRef,
    () => {
      const { insertText, insertBreak } = editor;
      const getAddedSlateMentions = () => {
        /**
         * wrap editor children in object to make recursive getMentions work
         */
        const initContent: { children: Descendant[] } = { children };
        return getSlateMentions(initContent);
      };
      return { insertText, insertBreak, children, getAddedSlateMentions };
    },
    [editor, children],
  );

  /**
   * set the selection at the end of the content when component is mounted
   */
  useEffect(() => {
    Transforms.select(editor, Editor.end(editor, []));
  }, [editor]);

  /**
   * position the mention and tag popovers based on the matching text range
   */
  useEffect(() => {
    if (mentionTargetRange) {
      const el = mentionPopoverRef.current;
      const domRange = ReactEditor.toDOMRange(editor, mentionTargetRange);
      const rect = domRange.getBoundingClientRect();
      if (el) {
        el.style.top = `${rect.top + window.scrollY + 24}px`;
        el.style.left = `${rect.left + window.scrollX}px`;
      }
    }
  }, [editor, index, mentionTargetRange, mentionPopoverRef]);

  /**
   * metadata contains mentions, and the simple text version of the slate structure
   */

  const createMetadata = () => {
    const slateContent = editor.children;
    /**
     * wrap slateContent in object to make recursive getMetadata work
     */
    const initContent: { children: Descendant[] } = { children: slateContent };

    const mentions = getSlateMentions(initContent);

    const metadata: IMetadata = {
      app: publishingApp,
      textContent: serializeToPlainText(initContent),
      mentions,
    };

    return metadata;
  };

  /**
   * creates the object for publishing and resets the editor state after
   */
  const handlePublish = () => {
    const slateContent = editor.children;
    const metadata = createMetadata();
    const data = { metadata, slateContent, author: profileId };
    CustomEditor.clearEditor(editor);
    onPublish(data);
  };

  /**
   *  computes the text length
   *  sets the editor state
   *  handles selection for mentions and tags
   */
  const handleChange = (value: Descendant[]) => {
    let textLength = 0;
    let encodedNodeLength = 0;
    /**
     * include tags, mentions and links in the text length
     * keeps track of the number of images in the content
     */
    (function computeLength(nodeArr: Descendant[]) {
      if (nodeArr.length) {
        nodeArr.forEach((node: Descendant) => {
          if (SlateText.isText(node)) {
            textLength += node.text.length;
          }
          if (Element.isElement(node) && node.type === 'mention' && node.name?.length) {
            textLength += node.name.length;
          }
          if (Element.isElement(node) && node.type === 'link' && node.url?.length) {
            textLength += node.url?.length;
          }
          if (Element.isElement(node) && node.children) {
            computeLength(node.children);
          }
        });
      }
    })(value);

    (function computeEncodedNodeLength(nodeArr: Descendant[]) {
      if (nodeArr.length) {
        encodedNodeLength = encodingFunction(nodeArr).length;
      }
    })(value);

    /** disable publishing if encoded content length or text are too long */
    if (textLength > 0 && textLength <= MAX_TEXT_LENGTH && encodedNodeLength <= maxEncodedLength) {
      setPublishDisabledInternal(false);
      if (typeof handleDisablePublish === 'function') {
        handleDisablePublish?.(false);
      }
    } else if (
      textLength === 0 ||
      textLength > MAX_TEXT_LENGTH ||
      encodedNodeLength > maxEncodedLength
    ) {
      setPublishDisabledInternal(true);
      if (typeof handleDisablePublish === 'function') {
        handleDisablePublish?.(true);
      }
    }

    if (encodedNodeLength <= maxEncodedLength) {
      setShowMaxEncodedLengthErr(false);
    } else if (encodedNodeLength > maxEncodedLength && textLength < MAX_TEXT_LENGTH) {
      setShowMaxEncodedLengthErr(true);
    }

    if (typeof setLetterCount === 'function') {
      setLetterCount(textLength);
    }

    const { selection, children } = editor;

    /**
     * handles text matching and mentions
     */
    if (selection && Range.isCollapsed(selection)) {
      const [start] = Range.edges(selection);
      const wordBefore = Editor.before(editor, start, { unit: 'word' });
      const before = wordBefore && Editor.before(editor, wordBefore);
      const beforeRange = before && Editor.range(editor, before, start);
      const beforeText = beforeRange && Editor.string(editor, beforeRange);
      const beforeMentionMatch = beforeText && beforeText.toLocaleLowerCase().match(/^@(\w+)$/);
      const after = Editor.after(editor, start);
      const afterRange = Editor.range(editor, start, after);
      const afterText = Editor.string(editor, afterRange);
      const afterMatch = afterText.match(/^(\s|$)/);

      if (!beforeMentionMatch && mentionsLimitReached) {
        setMentionsLimitReached(false);
      }

      if (beforeMentionMatch && afterMatch && beforeRange && typeof getMentions === 'function') {
        if (mentionsLimit) {
          if (
            countMentions({
              children,
            }) === mentionsLimit.count
          ) {
            setMentionsLimitReached(true);
            return;
          }
        }
        setMentionTargetRange(beforeRange);
        getMentions(beforeMentionMatch[1]);
        setIndex(0);
        return;
      } else {
        setMentionTargetRange(null);
      }
    }
  };

  const onKeyDown = useCallback(
    (event: KeyboardEvent<HTMLDivElement>) => {
      const { selection } = editor;

      if (selection && Range.isCollapsed(selection)) {
        if (event.code === 'Space') {
          const { linkNode, isActive: isLinkActive } = CustomEditor.nearestLinkNode(editor);

          // Step out of a link
          if (isLinkActive) {
            const [, path] = linkNode;
            const end = Editor.end(editor, path);
            // Step out of a link only if the cursor is at the end of it
            if (Range.equals(selection, { anchor: selection.anchor, focus: end })) {
              event.preventDefault();
              CustomEditor.stepOutOfLinkElement(editor);
              return;
            }
          }
        }
      }
      /**
       * key handler for the mention popover
       * inserts the mention on tab, enter or space keypress
       */
      const selectMention = (event: KeyboardEvent, mentionRange: Range) => {
        switch (event.key) {
          case 'ArrowDown': {
            event.preventDefault();
            const prevIndex = index >= mentions.length - 1 ? 0 : index + 1;
            setIndex(prevIndex);
            break;
          }
          case 'ArrowUp': {
            event.preventDefault();
            const nextIndex = index <= 0 ? mentions.length - 1 : index - 1;
            setIndex(nextIndex);
            break;
          }
          case 'Tab':
          case 'Enter':
          case ' ':
            event.preventDefault();
            Transforms.select(editor, mentionRange);
            CustomEditor.insertMention(editor, mentions[index]);
            setMentionTargetRange(null);
            break;
          case 'Escape':
            event.preventDefault();
            setMentionTargetRange(null);
            break;
        }
      };

      if (mentionTargetRange && mentions.length > 0) {
        selectMention(event, mentionTargetRange);
      }
    },
    [index, mentionTargetRange, mentions, editor],
  );

  /**
   * used for inserting mentions when clicking on popover
   */
  const handleInsertMention = (mentionIndex: number) => {
    if (mentionTargetRange && mentions.length > 0) {
      Transforms.select(editor, mentionTargetRange);
      CustomEditor.insertMention(editor, mentions[mentionIndex]);
      setMentionTargetRange(null);
    }
  };

  const publishDisabled = publishDisabledInternal || disablePublish;

  return (
    <Stack
      justify="between"
      background={{ light: 'white', dark: 'grey2' }}
      fullWidth
      customStyle={customStyle}
    >
      <Stack
        direction="row"
        justify="start"
        spacing="gap-x-2"
        customStyle={`h-full ${showAvatar && ` w-10/12 md:w-11/12 `} ${minHeight && `min-h-[${minHeight}]`}`}
        fullWidth
      >
        {showAvatar && (
          <Stack padding="pb-2" customStyle="shrink-0">
            <Avatar
              avatar={transformSource(avatar?.default)}
              alternativeAvatars={avatar?.alternatives?.map(alternative =>
                transformSource(alternative),
              )}
              profileId={profileId}
            />
          </Stack>
        )}
        {/* w-0 min-w-full is used to prevent parent width expansion without setting a fixed width */}
        <Stack ref={editorContainerRef} customStyle="w-0 min-w-full">
          {mentionsLimitReached && (
            <MessageCard
              message={mentionsLimit.label}
              icon={
                <Icon
                  icon={<ExclamationTriangleIcon />}
                  color={{ light: 'warningLight', dark: 'warningLight' }}
                />
              }
              background={{ light: 'warningDark/30', dark: 'warningDark/30' }}
            />
          )}
          <Slate
            editor={editor}
            initialValue={initialEditorValue || editorDefaultValue}
            onChange={handleChange}
          >
            <Editable
              placeholder={placeholderLabel}
              autoComplete="off"
              spellCheck={false}
              // eslint-disable-next-line
              autoFocus={true}
              renderElement={(renderProps: RenderElementProps) =>
                renderElement(
                  renderProps,
                  () => null,
                  () => null,
                  () => null,
                )
              }
              renderLeaf={renderLeaf}
              onKeyDown={onKeyDown}
              className={tw('focus:outline-none')}
            />
            {mentionTargetRange && (
              <MentionPopover
                handleSelect={handleInsertMention}
                ref={mentionPopoverRef}
                values={mentions}
                setIndex={setIndex}
                transformSource={transformSource}
                noMentionsLabel={noMentionsLabel}
                customStyle={`w-[${mentionPopoverWidth.current}px] sm:w-[272px] `}
              />
            )}
            <Stack
              padding={'pt-2'}
              direction="row"
              justify={withToolbar ? 'between' : 'end'}
              fullWidth
            >
              {withToolbar && (
                <Stack direction="row">
                  <MarkButton format="bold" icon={<Bold />} style={'rounded-l-sm'} />
                  <MarkButton format="italic" icon={<Italic />} />
                  <MarkButton format="underline" icon={<Underline />} />
                  <BlockButton format="left" icon={<AlignTextLeft />} />
                  <BlockButton format="center" icon={<AlignTextCenter />} />
                  <BlockButton format="right" icon={<AlignTextRight />} />
                  <BlockButton format="numbered-list" icon={<ListNumbered />} />
                  <BlockButton
                    format="bulleted-list"
                    icon={<ListBulleted />}
                    style={'rounded-r-sm'}
                  />
                </Stack>
              )}
              <Stack direction="row" align="center" spacing="gap-x-2">
                {withMeter && <EditorMeter value={letterCount} max={MAX_TEXT_LENGTH} />}
                {showCancelButton && <Button label={cancelButtonLabel} onClick={onCancelClick} />}
                {showPostButton && (
                  <Button
                    variant={'primary'}
                    icon={disablePublish ? <ArrowPathIcon /> : null}
                    label={disablePublish ? disableActionLabel : actionLabel}
                    onClick={handlePublish}
                    disabled={publishDisabled}
                  />
                )}
              </Stack>
            </Stack>
          </Slate>
          {showMaxEncodedLengthErr && (
            <Stack
              direction="row"
              align="center"
              background={{ light: 'errorLight/30', dark: 'errorDark/30' }}
              fullWidth
              customStyle="rounded"
              padding={16}
            >
              <Icon
                icon={<ExclamationTriangleIcon />}
                color={{ light: 'errorLight', dark: 'errorDark' }}
              />
              <Text>{maxEncodedLengthErrLabel}</Text>
            </Stack>
          )}
        </Stack>
      </Stack>
    </Stack>
  );
};

export default EditorBox;
