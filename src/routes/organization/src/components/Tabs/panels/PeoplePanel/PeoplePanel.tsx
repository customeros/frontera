import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';

import { observer } from 'mobx-react-lite';
import { differenceInCalendarMonths } from 'date-fns';
import { SearchSortContact } from '@domain/usecases/contact-details/search-sort-contacts.usecase';

import { Input } from '@ui/form/Input';
import { Button } from '@ui/form/Button/Button';
import { IconButton } from '@ui/form/IconButton';
import { useStore } from '@shared/hooks/useStore';
import { Icon, FeaturedIcon } from '@ui/media/Icon';
import { SearchSm } from '@ui/media/icons/SearchSm';
import { UsersPlus } from '@ui/media/icons/UsersPlus';
import { Spinner } from '@ui/feedback/Spinner/Spinner';
import { ChevronExpand } from '@ui/media/icons/ChevronExpand';
import { ChevronCollapse } from '@ui/media/icons/ChevronCollapse';
import { ContactDetails } from '@shared/components/ContactDetails';
import HalfCirclePattern from '@shared/assets/HalfCirclePattern.tsx';
import { OrganizationPanel } from '@organization/components/Tabs/shared/OrganizationPanel/OrganizationPanel';

import { SortOptionsMenu } from './components/SortOptionsMenu';
const searchSortContactUseCase = new SearchSortContact();

export const PeoplePanel = observer(() => {
  const store = useStore();
  const id = useParams()?.id as string;
  const [expandAll, setExpandAll] = useState(false);
  const organization = store.organizations.getById(id);
  const contacts = organization?.contacts;

  const searchSortContact = searchSortContactUseCase;

  const search = searchSortContact.getSearch();
  const sortDir = searchSortContact.getSortDirection();
  const sortBy = searchSortContact.getSort();

  const filteredContactsState =
    contacts?.filter((v) => {
      if (!search) return true;

      return (
        v.name.toLowerCase().includes(search.toLowerCase()) ||
        v.firstName.toLowerCase().includes(search.toLowerCase()) ||
        (v.primaryOrganizationJobRoleTitle || '')
          .toLowerCase()
          .includes(search.toLowerCase())
      );
    }).length === 0 && search;

  useEffect(() => {
    if (organization?.value.contacts.length) {
      store.contacts.preload(organization?.value.contacts);
    }
  }, []);

  if (!contacts) return null;

  if (!contacts?.length) {
    return (
      <div className='flex justify-center'>
        <div className='flex flex-col h-full w-full max-w-[448px]'>
          <div className='flex relative'>
            <FeaturedIcon
              size='lg'
              colorScheme='grayModern'
              className='absolute top-[26%] justify-self-center right-0 left-0'
            >
              <Icon name='users-02' />
            </FeaturedIcon>
            <HalfCirclePattern />
          </div>
          <div className='flex flex-col text-center items-center translate-y-[-212px]'>
            <p className='text-grayModern-700 text-md font-semibold mb-1'>
              Assemble the team
            </p>
            <p className='text-sm my-1 max-w-[360px] text-center'>
              Start by adding people that work at {organization?.value.name},
              and keep track of everyone from decision-makers to day-to-day
              collaborators.
            </p>
            <Button
              size='sm'
              variant='outline'
              loadingText='Adding'
              colorScheme={'primary'}
              className='text-sm mt-6 w-fit'
              dataTest='org-people-add-someone'
              isDisabled={store.contacts.isLoading}
              onClick={() => {
                store.ui.commandMenu.setType('AddSingleContact');
                store.ui.commandMenu.setContext({
                  ids: [id],
                  entity: 'Organization',
                  property: 'contacts',
                });
                store.ui.commandMenu.setOpen(true);
              }}
            >
              Add someone
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <OrganizationPanel
      withFade
      title='People'
      isLoading={store.contacts.isLoading}
      bgImage={
        !contacts?.length
          ? '/backgrounds/organization/half-circle-pattern.svg'
          : ''
      }
      actionItem={
        !!contacts.length && (
          <Button
            size='xxs'
            variant='outline'
            colorScheme='primary'
            aria-label='Add contact'
            dataTest={'org-people-add-contact'}
            leftIcon={<UsersPlus className='' />}
            leftSpinner={
              <Spinner
                size='sm'
                label='adding'
                className='text-grayModern-300 filll-grayModern-400'
              />
            }
            onClick={() => {
              store.ui.commandMenu.setType('AddSingleContact');
              store.ui.commandMenu.setContext({
                ids: [id],
                entity: 'Organization',
                property: 'contacts',
              });
              store.ui.commandMenu.setOpen(true);
            }}
          >
            Add
          </Button>
        )
      }
    >
      {contacts.length > 0 && (
        <div className='flex items-center justify-between'>
          <div className='flex items-center gap-2'>
            <SearchSm className='text-grayModern-500 size-4' />
            <Input
              size='xs'
              type='text'
              value={search}
              variant='unstyled'
              placeholder='Search name or title...'
              onChange={(e) => searchSortContact.setSearch(e.target.value)}
            />
          </div>
          <div className='flex items-center gap-1'>
            <SortOptionsMenu searchSortContact={searchSortContact} />
            <IconButton
              size='xs'
              variant='ghost'
              aria-label='collapse/decollapse'
              onClick={() => setExpandAll(!expandAll)}
              icon={!expandAll ? <ChevronExpand /> : <ChevronCollapse />}
            />
          </div>
        </div>
      )}

      {/* Filtered contacts */}
      {Array.from(new Set(contacts))
        .sort((a, b) => {
          if (sortBy === 'First name') {
            if (sortDir === 'asc') {
              return a.name.localeCompare(b.name);
            } else {
              return b.name.localeCompare(a.name);
            }
          }

          if (sortBy === 'Created') {
            const dateA = new Date(a.createdAt);
            const dateB = new Date(b.createdAt);

            if (sortDir === 'asc') {
              return dateA.getTime() - dateB.getTime();
            } else {
              return dateB.getTime() - dateA.getTime();
            }
          }

          if (sortBy === 'Updated') {
            const dateA = new Date(a.updatedAt);
            const dateB = new Date(b.updatedAt);

            if (sortDir === 'asc') {
              return dateA.getTime() - dateB.getTime();
            } else {
              return dateB.getTime() - dateA.getTime();
            }
          }

          if (sortBy === 'Tenure') {
            const aTenure = Math.abs(
              differenceInCalendarMonths(
                new Date(a.primaryOrganizationJobRoleStartDate),
                new Date(),
              ),
            );

            const bTenure = Math.abs(
              differenceInCalendarMonths(
                new Date(b.primaryOrganizationJobRoleStartDate),
                new Date(),
              ),
            );

            if (sortDir === 'asc') {
              return aTenure - bTenure;
            } else {
              return bTenure - aTenure;
            }
          }

          return 0;
        })
        .filter((v) => {
          if (!search) return true;

          return (
            v.name.toLowerCase().includes(search.toLowerCase()) ||
            v.firstName.toLowerCase().includes(search.toLowerCase()) ||
            (v.primaryOrganizationJobRoleTitle || '')
              .toLowerCase()
              .includes(search.toLowerCase())
          );
        })
        .map((contact) => (
          <div
            key={contact?.id}
            className='group/card'
            style={{ width: '100%' }}
          >
            <ContactDetails
              isExpandble={true}
              expandAll={expandAll}
              id={contact?.id ?? ''}
            />
          </div>
        ))}

      <div className='pb-20'></div>

      {filteredContactsState && (
        <div className='text-center text-grayModern-500 mt-4 text-sm'>
          No matches found—looks like a ghost town in here
        </div>
      )}
    </OrganizationPanel>
  );
});
