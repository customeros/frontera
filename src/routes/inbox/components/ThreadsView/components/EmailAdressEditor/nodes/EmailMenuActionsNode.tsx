import { useEffect } from 'react';

import { $getNearestNodeFromDOMNode } from 'lexical';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';

import { $isEmailNode } from './EmailNode';

export function EmailMenuActionsNode({
  onEmailClick,
}: {
  onEmailClick: (email: string, rect: DOMRect) => void;
}) {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    const handler = (event: MouseEvent) => {
      const domNode = event.target as HTMLElement;

      if (!domNode.closest('[data-lexical-email]')) {
        return;
      }

      editor.update(() => {
        const node = $getNearestNodeFromDOMNode(domNode);

        if (node && $isEmailNode(node)) {
          const domRect = domNode.getBoundingClientRect();

          onEmailClick(node.__email, domRect);
        }
      });
    };

    document.addEventListener('click', handler);

    return () => {
      document.removeEventListener('click', handler);
    };
  }, [editor, onEmailClick]);

  return null;
}
