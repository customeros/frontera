import { components } from 'react-select';
import { MultiValueProps } from 'react-select';
import { useParams, useSearchParams } from 'react-router-dom';

import { observer } from 'mobx-react-lite';
import { useLocalStorage } from 'usehooks-ts';

import { cn } from '@ui/utils/cn';
import { validateEmail } from '@utils/email';
import { SelectOption } from '@ui/utils/types';
import { Copy01 } from '@ui/media/icons/Copy01';
import { useStore } from '@shared/hooks/useStore';
import { useCopyToClipboard } from '@shared/hooks/useCopyToClipboard';
import { Menu, MenuItem, MenuList, MenuButton } from '@ui/overlay/Menu/Menu';
import { useContactCardMeta } from '@organization/state/ContactCardMeta.atom';

interface MultiValueWithActionMenuProps extends MultiValueProps<SelectOption> {
  value: Array<SelectOption>;
  navigateAfterAddingToPeople: boolean;
  onChange: (newValue: Array<SelectOption<string>>) => void;
  existingContacts: Array<{ id: string; label: string; value?: string | null }>;
}

export const MultiValueWithActionMenu = observer(
  ({
    existingContacts,
    navigateAfterAddingToPeople,
    onChange,
    value,
    ...rest
  }: MultiValueWithActionMenuProps) => {
    const store = useStore();
    const [searchParams, setSearchParams] = useSearchParams();
    const organizationId = useParams()?.id as string;
    const [_d, setExpandedCardId] = useContactCardMeta();

    const [_, copyToClipboard] = useCopyToClipboard();
    const [lastActivePosition, setLastActivePosition] = useLocalStorage(
      `customeros-player-last-position`,
      { [organizationId as string]: 'tab=about' },
    );

    const isContactInOrg = existingContacts.find(
      (data: SelectOption | unknown) => {
        return rest?.data?.value
          ? (data as SelectOption)?.value === rest.data.value
          : rest.data.label?.trim() === (data as SelectOption)?.label?.trim();
      },
    );

    const validationMessage = validateEmail(rest?.data?.value);

    const isContactWithoutEmail =
      (isContactInOrg && !rest?.data?.value) || validationMessage;

    const handleNavigateToContact = (
      contactId: string,
      initialFocusedField: 'name' | 'email',
    ) => {
      const urlSearchParams = new URLSearchParams(searchParams?.toString());

      urlSearchParams.set('tab', 'people');
      setLastActivePosition({
        ...lastActivePosition,
        [organizationId as string]: urlSearchParams.toString(),
      });

      setSearchParams(urlSearchParams);
      setExpandedCardId({
        expandedId: contactId,
        initialFocusedField,
      });
    };

    const handleAddContact = () => {
      store.contacts.createWithEmail(
        organizationId,
        {
          onSuccess: () =>
            store.ui.toastSuccess('Contact created', 'contact-email-created'),
        },
        { email: { email: rest?.data?.value, primary: true } },
      );
    };

    return (
      <Menu>
        <MenuButton
          className={cn(
            isContactWithoutEmail
              ? 'text-base [&_.multiValueClass]:data-[state=closed]:bg-warning-50 [&_.multiValueClass]:data-[state=closed]:text-warning-700 [&_.multiValueClass]:data-[state=closed]:border-warning-200 [&_.multiValueClass]:data-[state=open]:bg-warning-50 [&_.multiValueClass]:data-[state=open]:text-warning-700 [&_.multiValueClass]:data-[state=open]:border-warning-200'
              : 'text-base [&_.multiValueClass]:data-[state=closed]:bg-grayModern-50 [&_.multiValueClass]:data-[state=closed]:text-grayModern-700 [&_.multiValueClass]:data-[state=closed]:border-grayModern-200 [&_.multiValueClass]:data-[state=open]:bg-primary-50 [&_.multiValueClass]:data-[state=open]:text-primary-700 [&_.multiValueClass]:data-[state=open]:last:border-primary-200',
          )}
        >
          <components.MultiValue {...rest} className='text-base min-h-3'>
            {rest.children}
          </components.MultiValue>
        </MenuButton>
        <div onPointerDown={(e) => e.stopPropagation()}>
          <MenuList side='bottom' align='start' className='max-w-[300px] p-2'>
            {rest?.data?.value ? (
              <MenuItem
                onPointerDown={() => {
                  copyToClipboard(rest?.data?.value, 'Email copied');
                }}
                className='flex justify-between items-center rounded-md border border-transparent hover:bg-grayModern-50 hover:bgrayModernr-grayModern-100 fgrayModern:border-grayModern-200'
              >
                {rest?.data?.value}
                <Copy01 className='size-3 text-grayModern-500 ml-2' />
              </MenuItem>
            ) : (
              <MenuItem
                className='rounded-md border border-transparent hover:bg-grayModern-50 hover:bgrayModernr-grayModern-100 fgrayModern:border-grayModern-200'
                onPointerDown={() => {
                  isContactInOrg &&
                    handleNavigateToContact(isContactInOrg.id, 'email');
                }}
              >
                Add email in People list
              </MenuItem>
            )}

            <MenuItem
              className='rounded-md border border-transparent hover:bg-grayModern-50 hover:bgrayModernr-grayModern-100 fgrayModern:border-grayModern-200'
              onPointerDown={() => {
                const newValue = (
                  (rest?.selectProps?.value as Array<SelectOption>) ?? []
                )?.filter((e: SelectOption) => e.value !== rest?.data?.value);

                onChange(newValue);
              }}
            >
              Remove address
            </MenuItem>
            {!isContactInOrg && (
              <MenuItem
                onPointerDown={() => {
                  handleAddContact();
                }}
                className='rounded-md border border-transparent hover:bg-grayModern-50 hover:bgrayModernr-grayModern-100 fgrayModern:border-grayModern-200'
              >
                Add to people
              </MenuItem>
            )}
          </MenuList>
        </div>
      </Menu>
    );
  },
);
