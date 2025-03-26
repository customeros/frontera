import * as ReactDOM from 'react-dom';
import { useMemo, useState, useEffect, useCallback } from 'react';

import { TextNode } from 'lexical';
import { observer } from 'mobx-react-lite';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import {
  MenuOption,
  MenuTextMatch,
  LexicalTypeaheadMenuPlugin,
} from '@lexical/react/LexicalTypeaheadMenuPlugin';

import { cn } from '@ui/utils/cn';
import { SelectOption } from '@ui/utils/types';
import { useStore } from '@shared/hooks/useStore';

import { $createEmailNode } from '../nodes/EmailNode';

// At most, 5 suggestions are shown in the popup.
const SUGGESTION_LIST_LENGTH_LIMIT = 5;
const EmailRegex = /(?:^|\s)([a-zA-Z0-9._%+-@]{1,75})$/;

function checkForEmailMentions(
  text: string,
  minMatchLength: number,
): MenuTextMatch | null {
  const match = EmailRegex.exec(text);

  if (match !== null) {
    // Don't match if the text ends with a space
    if (text.endsWith(' ')) {
      return null;
    }

    const matchingString = match[1];

    if (matchingString.length >= minMatchLength) {
      return {
        matchingString,
        replaceableString: matchingString,
      } as MenuTextMatch;
    }
  }

  return null;
}

const isValidEmail = (value: string): boolean => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
};

function getPossibleQueryMatch(text: string): MenuTextMatch | null {
  return checkForEmailMentions(text, 1);
}

class EmailTypeaheadOption extends MenuOption {
  label: string;
  value: string;

  constructor(item: SelectOption) {
    super(item.label);
    this.label = item.label;
    this.value = item.value;
  }
}

function EmailTypeaheadMenuItem({
  index,
  option,
  onClick,
  isSelected,
  onMouseEnter,
}: {
  index: number;
  isSelected: boolean;
  onClick: () => void;
  onMouseEnter: () => void;
  option: EmailTypeaheadOption;
}) {
  return (
    <li
      tabIndex={-1}
      role='option'
      key={option.key}
      onMouseDown={onClick}
      ref={option.setRefElement}
      aria-selected={isSelected}
      onMouseEnter={onMouseEnter}
      id={'typeahead-email-item-' + index}
      className={cn(
        'flex gap-2 items-center text-start py-[6px] px-[10px] leading-[18px] text-grayModern-700  rounded-sm outline-none cursor-pointer hover:bg-grayModern-50 hover:rounded-md ',
        'data-[disabled]:opacity-50 data-[disabled]:cursor-not-allowed hover:data-[disabled]:bg-transparent w-full',
        isSelected && 'bg-grayModern-50 text-grayModern-700',
      )}
    >
      <span className='text'>{option.label}</span>
    </li>
  );
}

interface EmailPluginProps {
  options: SelectOption[];
  onCreate?: (email: string) => void;
  onSearch?: (query: string | null) => void;
}

export const EmailPlugin = observer(
  ({ options, onSearch, onCreate }: EmailPluginProps): JSX.Element | null => {
    const store = useStore();
    const [editor] = useLexicalComposerContext();
    const [currentQuery, setCurrentQuery] = useState<string | null>(null);

    const _options = useMemo(() => {
      const query = currentQuery?.toLowerCase() ?? '';

      const filtered = options
        .filter((item) => item.label.toLowerCase().includes(query))
        .map((item) => new EmailTypeaheadOption(item));

      const showCreate = query.length > 0 && filtered.length === 0;

      if (showCreate) {
        filtered.push(
          new EmailTypeaheadOption({
            label: `Add "${query}"`,
            value: query,
          }),
        );
      }

      return filtered.slice(0, SUGGESTION_LIST_LENGTH_LIMIT);
    }, [options, currentQuery]);

    const onSelectOption = useCallback(
      (
        selectedOption: EmailTypeaheadOption,
        nodeToReplace: TextNode | null,
        closeMenu: () => void,
      ) => {
        const email = selectedOption.value;

        if (!email) return;
        if (!isValidEmail(email)) return;
        editor.update(() => {
          const emailNode = $createEmailNode(email);

          if (nodeToReplace) {
            nodeToReplace.replace(emailNode);
          }

          emailNode.select();
          closeMenu();
        });

        setCurrentQuery(null);

        if (!options.find((o) => o.value === email)) {
          onCreate?.(email);
        }
      },
      [editor, onCreate, options],
    );

    const checkForMentionMatch = useCallback(
      (text: string) => {
        return getPossibleQueryMatch(text);
      },
      [editor],
    );

    useEffect(() => {
      return () => {
        setCurrentQuery(null);
      };
    }, []);

    return (
      <LexicalTypeaheadMenuPlugin<EmailTypeaheadOption>
        options={_options}
        onSelectOption={onSelectOption}
        triggerFn={checkForMentionMatch}
        onQueryChange={(query) => {
          setCurrentQuery(query);
          onSearch?.(query);
        }}
        menuRenderFn={(
          anchorElementRef,
          { selectedIndex, selectOptionAndCleanUp, setHighlightedIndex },
        ) =>
          anchorElementRef.current
            ? ReactDOM.createPortal(
                <div className='relative bg-white min-w-[250px] py-1.5 px-[6px] shadow-lg border rounded-md z-50 text-sm truncate w-[250px]'>
                  <ul>
                    {_options.map((option, i: number) => (
                      <EmailTypeaheadMenuItem
                        index={i}
                        option={option}
                        key={option.key}
                        isSelected={selectedIndex === i}
                        onMouseEnter={() => {
                          setHighlightedIndex(i);
                        }}
                        onClick={() => {
                          if (isValidEmail(option.value)) {
                            setHighlightedIndex(i);
                            selectOptionAndCleanUp(option);
                          } else {
                            store.ui.toastError(
                              'This is an invalid email address',
                              'invalid-email',
                            );
                          }
                        }}
                      />
                    ))}
                  </ul>
                </div>,
                anchorElementRef.current,
              )
            : null
        }
      />
    );
  },
);
