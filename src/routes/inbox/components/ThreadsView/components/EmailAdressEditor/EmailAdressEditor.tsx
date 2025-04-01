import { useRef, useState, useEffect } from 'react';

import { twMerge } from 'tailwind-merge';
import { cva } from 'class-variance-authority';
import { $generateHtmlFromNodes } from '@lexical/html';
import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin';
import { ContentEditable } from '@lexical/react/LexicalContentEditable';
import { PlainTextPlugin } from '@lexical/react/LexicalPlainTextPlugin';
import { EditorRefPlugin } from '@lexical/react/LexicalEditorRefPlugin';
import { LexicalErrorBoundary } from '@lexical/react/LexicalErrorBoundary';
import { ThemeConfig } from 'node_modules/react-select/dist/declarations/src/theme';
import {
  LexicalComposer,
  InitialConfigType,
} from '@lexical/react/LexicalComposer';
import {
  $nodesOfType,
  $insertNodes,
  LexicalEditor,
  EditorThemeClasses,
} from 'lexical';

import { SelectOption } from '@ui/utils/types';

import { EmailPlugin } from './plugins/EmailPlugin';
import { EmailNode, $createEmailNode } from './nodes/EmailNode';
import { EmailMenuActionsPlugin } from './plugins/EmailMenuActionsPlugin';

const contentEditableVariants = cva('focus:outline-none', {
  variants: {
    size: {
      xs: ['text-sm'],
      sm: ['text-sm'],
      md: ['text-base'],
      lg: ['text-lg'],
    },
  },
  defaultVariants: {
    size: 'md',
  },
});

const theme: EditorThemeClasses = {
  paragraph: 'flex items-center flex-wrap',
};

const onError = (error: Error) => {
  console.error(error);
};

interface EmailAdressEditorProps {
  dataTest?: string;
  className?: string;
  namespace?: string;
  theme?: ThemeConfig;
  placeholder?: string;
  isReadOnly?: boolean;
  usePlainText?: boolean;
  defaultHtmlValue?: string[];
  placeholderClassName?: string;
  emailsOptions?: SelectOption[];
  onError?: (error: Error) => void;
  size?: 'xs' | 'sm' | 'md' | 'lg';
  onChange?: (html: string) => void;
  onEmailsChange?: (emails: string[]) => void;
  onBlur?: (e: React.FocusEvent<HTMLDivElement>) => void;
  onFocus?: (e: React.FocusEvent<HTMLDivElement>) => void;
  onKeyDown?: (e: React.KeyboardEvent<HTMLDivElement>) => void;
}

export const EmailAdressEditor = ({
  className,
  placeholder,
  usePlainText,
  size,
  namespace = 'editor',
  isReadOnly,
  onBlur,
  onChange,
  dataTest,
  onFocus,
  defaultHtmlValue,
  emailsOptions,
  onEmailsChange,
  placeholderClassName,
  onKeyDown,
}: EmailAdressEditorProps) => {
  const editor = useRef<LexicalEditor | null>(null);
  const [_floatingAnchorElem, setFloatingAnchorElem] =
    useState<HTMLDivElement>();
  const EditorPlugin = usePlainText ? PlainTextPlugin : RichTextPlugin;
  const hasLoadedDefaultHtmlValue = useRef(false);

  const nodes = [EmailNode];

  const initialConfig: InitialConfigType = {
    namespace,
    theme,
    onError,
    nodes,
    editable: !isReadOnly,
  };

  const onRef = (_floatingAnchorElem: HTMLDivElement) => {
    if (_floatingAnchorElem !== null) {
      setFloatingAnchorElem(_floatingAnchorElem);
    }
  };

  useEffect(() => {
    if (!editor?.current || hasLoadedDefaultHtmlValue.current) return;

    editor.current.update(() => {
      if (
        defaultHtmlValue &&
        Array.isArray(defaultHtmlValue) &&
        !hasLoadedDefaultHtmlValue.current
      ) {
        const emailNodes = defaultHtmlValue.map((email) =>
          $createEmailNode(email),
        );

        $insertNodes(emailNodes);
        hasLoadedDefaultHtmlValue.current = true;
      }
    });

    const dispose = editor.current.registerUpdateListener(({ editorState }) => {
      editorState.read(() => {
        if (!editor.current) return;

        const emailNodes = $nodesOfType(EmailNode);
        const html = $generateHtmlFromNodes(editor.current);

        onChange?.(html);
        onEmailsChange?.(emailNodes.map((node) => node.__email));
      });
    });

    return () => {
      dispose?.();
    };
  }, [defaultHtmlValue, onChange, onEmailsChange]);

  return (
    <div className='w-full flex items-center justify-start cursor-text min-h-[24px] relative'>
      <LexicalComposer initialConfig={initialConfig}>
        <EditorRefPlugin editorRef={editor} />
        <EmailPlugin options={emailsOptions ?? []} />
        <EmailMenuActionsPlugin />
        <EditorPlugin
          ErrorBoundary={LexicalErrorBoundary}
          placeholder={
            <div
              onClick={() => editor.current?.focus()}
              className={twMerge(
                contentEditableVariants({
                  size,
                  className: placeholderClassName,
                }),
                'text-grayModern-400 w-full absolute top-[1px]',
              )}
            >
              {placeholder}
            </div>
          }
          contentEditable={
            <ContentEditable
              ref={onRef}
              onBlur={onBlur}
              onFocus={onFocus}
              autoFocus={false}
              spellCheck='false'
              data-test={dataTest}
              onKeyDown={(e) =>
                onKeyDown ? onKeyDown(e) : e.stopPropagation()
              }
              className={twMerge(
                contentEditableVariants({ size, className }),
                'items-center flex w-full justify-start',
              )}
            />
          }
        />
      </LexicalComposer>
    </div>
  );
};
