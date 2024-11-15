import * as React from 'react';
import { RenderElementProps, RenderLeafProps } from 'slate-react';
import { tw } from '@twind/core';

/*
 ** A workaround for a chromium bug that incorrectly positions a cursor inside an inline element
 ** It helps during a step out of an inline element
 ** https://bugs.chromium.org/p/chromium/issues/detail?id=1249405
 */
const InlineChromiumBugfix = () => (
  <span contentEditable={false} className="text-[0]">
    {String.fromCodePoint(160) /* Non-breaking space */}
  </span>
);

const allowedSchemes = ['http:', 'https:', 'mailto:', 'tel:'];

const MentionElement = (props: any) => {
  const { handleMentionClick, attributes, element, children } = props;
  const mention = element.name || element.did;
  const displayedMention = `${mention && mention.startsWith('@') ? mention : `@${mention}`} `;
  return (
    <button
      className={tw(`text-secondaryLight dark:text-secondaryDark text-${element.align}`)}
      {...attributes}
      contentEditable={false}
      onClick={(ev: Event) => {
        handleMentionClick(element.did);
        ev.stopPropagation();
        ev.preventDefault();
        return false;
      }}
    >
      {displayedMention}
      {children}
    </button>
  );
};

const LinkElement = ({ attributes, children, element, handleLinkClick }: any) => {
  // If you allow untrusted input in the href attribute of a hyperlink, attackers can use
  // the javascript:, data: or vbscript: schemes to hijack your users.
  // Mitigate by parsing the URL and checking against an allow list
  const safeUrl = React.useMemo(() => {
    let parsedUrl: URL = null;
    try {
      parsedUrl = new URL(element.url);
    } catch (err) {
      console.error(err);
    }
    if (parsedUrl && allowedSchemes.includes(parsedUrl.protocol)) {
      return parsedUrl.href;
    }
    return 'about:blank';
  }, [element.url]);

  return (
    <a
      className={tw(
        `text-secondaryLight dark:text-secondaryDark no-underline text-${element.align}`,
      )}
      {...attributes}
      href={safeUrl}
      size="large"
      target="_blank"
      rel="noopener noreferrer"
      onClick={(ev: Event) => {
        if (new URL(element.url).origin === window.location.origin) {
          handleLinkClick(element.url);
          ev.stopPropagation();
          ev.preventDefault();
          return false;
        }
        return ev.stopPropagation();
      }}
    >
      <InlineChromiumBugfix />
      {children}
      <InlineChromiumBugfix />
    </a>
  );
};

const renderElement = (
  props: RenderElementProps,
  handleMentionClick?: (id: string) => void,
  handleTagClick?: (name: string) => void,
  handleLinkClick?: (url: string) => void,
) => {
  const textAlignStyle = `text-${props.element.align}`;
  switch (props.element.type) {
    case 'mention':
      return <MentionElement handleMentionClick={handleMentionClick} {...props} />;
    case 'link':
      return <LinkElement handleLinkClick={handleLinkClick} {...props} />;
    case 'list-item':
      return (
        <li
          className={tw(`text-black dark:text-white ${textAlignStyle} list-item`)}
          {...props.attributes}
        >
          {props.children}
        </li>
      );
    case 'bulleted-list':
      return (
        <ul className={tw(`${textAlignStyle} list-disc ml-8`)} {...props.attributes}>
          {props.children}
        </ul>
      );
    case 'numbered-list':
      return (
        <ol className={tw(`${textAlignStyle} list-decimal ml-8`)} {...props.attributes}>
          {props.children}
        </ol>
      );

    default:
      return (
        <p
          className={tw(`text-black dark:text-white ${textAlignStyle}`)}
          style={{ overflowWrap: 'anywhere' }}
          {...props.attributes}
        >
          {props.children}
        </p>
      );
  }
};

const Leaf = ({ attributes, children, leaf }: RenderLeafProps) => {
  const textStyle = leaf.disabled ? 'text-color-grey8' : '';
  if (leaf.bold) {
    children = <strong>{children}</strong>;
  }
  if (leaf.italic) {
    children = <em>{children}</em>;
  }
  if (leaf.underline) {
    children = <u>{children}</u>;
  }

  return (
    <span className={tw(textStyle)} {...attributes}>
      {children}
    </span>
  );
};

const renderLeaf = (props: RenderLeafProps) => <Leaf {...props} />;

export { renderElement, renderLeaf };
