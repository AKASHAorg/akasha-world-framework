import { Editor, Transforms, Element, Node, Point, Range, Descendant } from 'slate';
import { ReactEditor } from 'slate-react';
import ReactDOM from 'react-dom';
import { CustomText, LinkElement, MentionElement } from '@akashaorg/typings/lib/ui';
import { Profile } from '@akashaorg/typings/lib/ui';
import { ExtendedNode } from '.';

export const LIST_TYPES = ['numbered-list', 'bulleted-list'];
export const TEXT_ALIGN_TYPES = ['left', 'center', 'right'];

const CustomEditor = {
  isBlockActive(editor: Editor, format: string, blockType = 'type') {
    const { selection } = editor;
    if (!selection) return false;

    const [match] = Array.from(
      Editor.nodes(editor, {
        at: Editor.unhangRange(editor, selection),
        match: n => !Editor.isEditor(n) && Element.isElement(n) && n[blockType] === format,
      }),
    );

    return !!match;
  },

  isMarkActive(editor, format) {
    const marks = Editor.marks(editor);
    return marks ? marks[format] === true : false;
  },

  toggleBlock(editor, format) {
    const isActive = this.isBlockActive(
      editor,
      format,
      TEXT_ALIGN_TYPES.includes(format) ? 'align' : 'type',
    );
    const isList = LIST_TYPES.includes(format);

    Transforms.unwrapNodes(editor, {
      match: n =>
        !Editor.isEditor(n) &&
        Element.isElement(n) &&
        LIST_TYPES.includes(n.type) &&
        !TEXT_ALIGN_TYPES.includes(format),
      split: true,
    });
    let newProperties: Partial<Element>;
    if (TEXT_ALIGN_TYPES.includes(format)) {
      newProperties = {
        align: isActive ? undefined : format,
      };
    } else {
      const inactiveFormat = isList ? 'list-item' : format;
      newProperties = {
        type: isActive ? 'paragraph' : inactiveFormat,
      };
    }
    Transforms.setNodes<Element>(editor, newProperties);

    if (!isActive && isList) {
      const block = { type: format, children: [] };
      Transforms.wrapNodes(editor, block);
    }
  },

  toggleMark(editor, format) {
    const isActive = this.isMarkActive(editor, format);

    if (isActive) {
      Editor.removeMark(editor, format);
    } else {
      Editor.addMark(editor, format, true);
    }
  },

  insertText(editor: Editor, text: string) {
    ReactEditor.focus(editor);
    const textElem: CustomText = { text };
    Transforms.insertNodes(editor, textElem);
  },

  insertMention(editor: Editor, profileData: Profile) {
    const baseMention: { type: 'mention'; children: [{ text: '' }] } = {
      type: 'mention',
      children: [{ text: '' }],
    };
    const mentionData = { name: profileData?.name, did: profileData?.did?.id };
    const mention: MentionElement = Object.assign(baseMention, mentionData);
    Transforms.insertNodes(editor, mention);
    ReactEditor.focus(editor);
    Transforms.move(editor);
  },

  nearestLinkNode(editor: Editor) {
    const [linkNode] = Editor.nodes(editor, {
      match: n => !Editor.isEditor(n) && Element.isElement(n) && n.type === 'link',
    });
    return { linkNode, isActive: !!linkNode };
  },

  stepOutOfLinkElement(editor: Editor, addEmptySpace = true) {
    //step out
    Transforms.move(editor, { unit: 'offset' });
    //add empty space
    if (addEmptySpace) Editor.insertText(editor, ' ');
  },

  insertLink(editor, url: string) {
    //if the link is to be inserted in another link then treat it as an ordinary text element
    if (this.nearestLinkNode(editor).isActive) {
      Transforms.insertNodes(editor, { text: url });
      return;
    }
    const { selection } = editor;
    const link: LinkElement = {
      type: 'link',
      url,
      children: [{ text: url }],
    };
    //if there is no Point after the current selection it means the link is the last element to be inserted
    const isLastElement = !Editor.after(editor, selection);
    Transforms.insertNodes(editor, link);
    /*
     ** after inserting a link step out of it
     ** add a space after the link if it's the last element
     */
    if (selection && Range.isCollapsed(selection)) {
      this.stepOutOfLinkElement(editor, isLastElement);
    }
  },

  deleteImage(editor: Editor, element: Element) {
    const path = ReactEditor.findPath(editor, element);
    Transforms.removeNodes(editor, {
      voids: true,
      at: path,
    });
    ReactEditor.focus(editor);
    Transforms.move(editor);
  },
  /**
   * resetNodes resets the value of the editor.
   * It should be noted that passing the `at` parameter may cause a "Cannot resolve a DOM point from Slate point" error.
   */
  resetNodes(
    editor: Editor,
    options: {
      nodes?: Node | Node[];
      at?: Location;
    } = {},
  ): void {
    const children = [...editor.children];

    children.forEach(node => editor.apply({ type: 'remove_node', path: [0], node }));

    if (options.nodes) {
      const nodes = Node.isNode(options.nodes) ? [options.nodes] : options.nodes;

      nodes.forEach((node, i) => editor.apply({ type: 'insert_node', path: [i], node: node }));
    }

    const point = options.at && Point.isPoint(options.at) ? options.at : Editor.end(editor, []);

    if (point) {
      Transforms.select(editor, point);
    }
  },

  clearEditor(editor: Editor) {
    Transforms.select(editor, []);
    Transforms.delete(editor);
  },
};

export const isEditorEmpty = (editorState?: Descendant[]) => {
  return !editorState?.find(content => {
    if (content && 'children' in content) {
      return content.children.find(childContent =>
        'text' in childContent ? !!childContent.text : true,
      );
    }
    return content && 'text' in content ? !!content.text : false;
  });
};

export const countMentions = (node: ExtendedNode) => {
  let count = 0;
  (function getCount(node: ExtendedNode) {
    if (Element.isElement(node) && node.type === 'mention') {
      count++;
    }
    if (Element.isElement(node) && node.children) {
      node.children.map((n: Descendant) => getCount(n));
    }
  })(node);
  return count;
};

export const getSlateMentions = (node: ExtendedNode) => {
  const mentions = [];
  (function getMentionsRecursive(node: ExtendedNode) {
    if (Element.isElement(node) && node.type === 'mention') {
      mentions.push(node.did);
    }
    if (Element.isElement(node) && node.children) {
      node.children.map((n: Descendant) => getMentionsRecursive(n));
    }
  })(node);
  return mentions;
};

interface IPortal {
  children: React.ReactNode;
  targetNode?: HTMLElement;
}

export const Portal: React.FC<IPortal> = ({ children, targetNode }) => {
  if (targetNode) {
    return ReactDOM.createPortal(children, targetNode);
  }
  return ReactDOM.createPortal(children, document.body);
};

export { CustomEditor };
