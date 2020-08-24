import * as React from 'react';
import { RenderElementProps, RenderLeafProps, useSelected, useFocused } from 'slate-react';
import styled from 'styled-components';

const StyledImg = styled.img`
  display: block;
  max-width: 100%;
  max-height: 20em;
`;

const StyledMention = styled.span<{ focused?: boolean }>`
  color: ${props => props.theme.colors.accent};
  // margin: 1px;
  // border-radius: ${props => `${props.theme.shapes.smallBorderRadius}px`};
  // box-shadow: ${props => (props.focused ? '0 0 0 2px #B4D5FF' : 'none')};
`;

const ImageElement = ({ attributes, children, element }: any) => {
  return (
    <div {...attributes}>
      <div contentEditable={false}>
        <StyledImg src={element.url} />
      </div>
      {children}
    </div>
  );
};

const MentionElement = ({ attributes, children, element }: any) => {
  const selected = useSelected();
  const focused = useFocused();
  return (
    <StyledMention {...attributes} contentEditable={false} focused={selected && focused}>
      @{element.value}
      {children}
    </StyledMention>
  );
};

const renderElement = (props: RenderElementProps) => {
  switch (props.element.type) {
    case 'quote':
      return <blockquote {...props.attributes}>{props.children}</blockquote>;
    case 'image':
      return <ImageElement {...props} />;
    case 'mention':
      return <MentionElement {...props} />;

    default:
      return <p {...props.attributes}>{props.children}</p>;
  }
};

const Leaf = ({ attributes, children, leaf }: RenderLeafProps) => {
  if (leaf.bold) {
    return (
      <span {...attributes}>
        <strong>{children}</strong>
      </span>
    );
  }

  if (leaf.italic) {
    return (
      <span {...attributes}>
        <em>{children}</em>
      </span>
    );
  }

  if (leaf.underlined) {
    return (
      <span {...attributes}>
        <u>{children}</u>
      </span>
    );
  }
  if (leaf.code) {
    return (
      <span {...attributes}>
        <code>{children}</code>
      </span>
    );
  }

  return <span {...attributes}>{children}</span>;
};

const renderLeaf = (props: RenderLeafProps) => <Leaf {...props} />;

export { renderElement, renderLeaf };
