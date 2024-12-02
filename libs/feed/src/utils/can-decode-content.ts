import { ReflectionData } from '@akashaorg/typings/lib/ui';
import { decodeb64SlateContent } from '@akashaorg/ui-awf-hooks';

export const canDecodeContent = (content: ReflectionData['content']) => {
  const [decodedContent] = content.flatMap(item => decodeb64SlateContent(item.value));
  return !!decodedContent;
};
