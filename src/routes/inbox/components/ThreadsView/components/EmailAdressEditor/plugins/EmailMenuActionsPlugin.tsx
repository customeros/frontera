import { useRef, useState, useEffect } from 'react';

import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';

import { Icon } from '@ui/media/Icon';
import { useCopyToClipboard } from '@shared/hooks/useCopyToClipboard';

import { EmailMenuActionsNode } from '../nodes/EmailMenuActionsNode';

// Create a singleton to track the active menu across all instances
const menuState = {
  activeInstance: null as string | null,
};

export const EmailMenuActionsPlugin = () => {
  const instanceId = useRef(Math.random().toString(36).substr(2, 9));

  const [editor] = useLexicalComposerContext();

  const [activeEmail, setActiveEmail] = useState<string | null>(null);
  const [position, setPosition] = useState<DOMRect | null>(null);
  const [_, copyToClipboard] = useCopyToClipboard();
  const menuRef = useRef<HTMLDivElement>(null);

  const handleEmailClick = (email: string, rect: DOMRect) => {
    // Close any other active menus first
    if (
      menuState.activeInstance &&
      menuState.activeInstance !== instanceId.current
    ) {
      // Dispatch a custom event to notify other instances to close
      document.dispatchEvent(
        new CustomEvent('close-all-email-menus', {
          detail: { except: instanceId.current },
        }),
      );
    }

    // If clicking the same email that's already active, close it
    if (activeEmail === email) {
      closeMenu();

      return;
    }

    // Open the new email menu
    menuState.activeInstance = instanceId.current;
    setActiveEmail(email);
    setPosition(rect);
  };

  useEffect(() => {
    const handleCustomEvent = (event: CustomEvent) => {
      const { email, rect } = event.detail;

      handleEmailClick(email, rect);
    };

    const handleCloseAllMenus = (event: CustomEvent) => {
      if (event.detail.except !== instanceId.current) {
        closeMenu();
      }
    };

    document.addEventListener(
      'email-node-click',
      handleCustomEvent as EventListener,
    );
    document.addEventListener(
      'close-all-email-menus',
      handleCloseAllMenus as EventListener,
    );

    return () => {
      document.removeEventListener(
        'email-node-click',
        handleCustomEvent as EventListener,
      );
      document.removeEventListener(
        'close-all-email-menus',
        handleCloseAllMenus as EventListener,
      );

      if (menuState.activeInstance === instanceId.current) {
        menuState.activeInstance = null;
      }
    };
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        menuRef.current &&
        !menuRef.current.contains(event.target as Node) &&
        !(event.target as HTMLElement).closest('[data-lexical-email]')
      ) {
        closeMenu();
      }
    };

    if (activeEmail) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [activeEmail]);

  const closeMenu = () => {
    if (menuState.activeInstance === instanceId.current) {
      menuState.activeInstance = null;
    }
    setActiveEmail(null);
    setPosition(null);
  };

  return (
    <>
      <EmailMenuActionsNode onEmailClick={handleEmailClick} />
      {activeEmail &&
        position &&
        menuState.activeInstance === instanceId.current && (
          <div
            ref={menuRef}
            className='absolute z-[999] min-w-[200px] bg-white rounded-md shadow-lg border border-grayModern-200'
            style={{
              position: 'fixed',
              top:
                window.innerHeight - position.top > 200
                  ? position.bottom + 5
                  : position.top - 150,
              left: position.left,
            }}
          >
            <div className='p-2'>
              <div
                onClick={() => {
                  copyToClipboard(activeEmail, 'Email copied');
                  closeMenu();
                }}
                className='flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-grayModern-100 cursor-pointer hover:text-grayModern-700 text-grayModern-500'
              >
                <Icon name='copy-03' className='size-4' />
                <p className='text-grayModern-700 text-sm'>{activeEmail}</p>
              </div>
              <div
                className='flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-grayModern-100 cursor-pointer hover:text-grayModern-700 text-grayModern-600'
                onClick={() => {
                  editor.update(() => {
                    const nodesState = editor
                      .getEditorState()
                      ._nodeMap.entries();

                    for (const [_key, value] of nodesState) {
                      if (value.getTextContent() === activeEmail) {
                        value.remove();
                      }
                    }
                  });

                  closeMenu();
                }}
              >
                <Icon name='trash-01' className='size-4' />
                <p className='text-grayModern-700 text-sm'>Remove email</p>
              </div>
              <div
                onClick={() => {
                  // TODO: Implement send email functionality

                  closeMenu();
                }}
                className='flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-grayModern-100 cursor-pointer hover:text-grayModern-700 text-grayModern-600'
              >
                <Icon name='send-03' className='size-4' />
                <p className='text-grayModern-700 text-sm'>Add to contacts</p>
              </div>
            </div>
          </div>
        )}
    </>
  );
};
