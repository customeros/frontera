import type { JSX } from 'react';

import { TreeView } from '@lexical/react/LexicalTreeView';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';

export default function TreeViewPlugin(): JSX.Element {
  const [editor] = useLexicalComposerContext();

  return (
    <TreeView
      editor={editor}
      viewClassName='tree-view-output'
      treeTypeButtonClassName='debug-treetype-button'
      timeTravelPanelClassName='debug-timetravel-panel'
      timeTravelButtonClassName='debug-timetravel-button'
      timeTravelPanelSliderClassName='debug-timetravel-panel-slider'
      timeTravelPanelButtonClassName='debug-timetravel-panel-button'
    />
  );
}
