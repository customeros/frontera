import { useParams } from 'react-router-dom';

import { observer } from 'mobx-react-lite';

import { Currency } from '@graphql/types';
import { Plus } from '@ui/media/icons/Plus';
import { DateTimeUtils } from '@utils/date.ts';
import { useStore } from '@shared/hooks/useStore';
import { Tooltip } from '@ui/overlay/Tooltip/Tooltip';
import { Spinner } from '@ui/feedback/Spinner/Spinner';
import { IconButton } from '@ui/form/IconButton/IconButton';
import { OrganizationPanel } from '@organization/components/Tabs';
import { Contracts } from '@organization/components/Tabs/panels/AccountPanel/Contracts/Contracts';
import { RelationshipButton } from '@organization/components/Tabs/panels/AccountPanel/RelationshipButton';

import { Notes } from './Notes';
import { EmptyContracts } from './EmptyContracts';
import { AccountPanelSkeleton } from './AccountPanelSkeleton';
import {
  useAccountPanelStateContext,
  AccountModalsContextProvider,
} from './context/AccountModalsContext';

const AccountPanelComponent = observer(() => {
  const store = useStore();
  const baseCurrency = store.settings.tenant.value?.baseCurrency;

  const id = useParams()?.id as string;

  const { isModalOpen } = useAccountPanelStateContext();

  const organizationStore = store.organizations.value.get(id);
  const organization = organizationStore?.value;

  if (store.organizations.isLoading && !organization) {
    return <AccountPanelSkeleton />;
  }

  const handleCreate = () => {
    store.contracts.create({
      organizationId: id,
      serviceStarted: DateTimeUtils.addDays(
        new Date().toString(),
        1,
      ).toISOString(),
      committedPeriodInMonths: 1,
      currency: baseCurrency || Currency.Usd,
      name: `${
        organization?.name?.length ? `${organization?.name}'s` : "Unnamed's"
      } contract`,
    });
  };

  const isCreating = organization?.id
    ? Boolean(store.contracts.isPending.get(organization?.id))
    : false;

  if (!organizationStore?.contracts?.length) {
    return (
      <EmptyContracts isPending={isCreating} onCreate={handleCreate}>
        <Notes id={id} />
      </EmptyContracts>
    );
  }

  return (
    <>
      <OrganizationPanel
        withFade
        title='Account'
        shouldBlockPanelScroll={isModalOpen}
        actionItem={
          <div className='flex items-center'>
            <Tooltip label='Create new contract'>
              <IconButton
                size='xs'
                variant='ghost'
                className='text-gray-500 mr-1'
                onClick={() => handleCreate()}
                aria-label='Create new contract'
                isLoading={store.contracts.isLoading}
                isDisabled={store.contracts.isLoading}
                dataTest='org-account-nonempty-new-contract'
                icon={
                  store.contracts.isLoading ? (
                    <Spinner
                      size='sm'
                      label='Creating contract...'
                      className='text-gray-500 fill-gray-700'
                    />
                  ) : (
                    <Plus />
                  )
                }
              />
            </Tooltip>

            <RelationshipButton />
          </div>
        }
      >
        <Contracts />
        <Notes id={id} />
      </OrganizationPanel>
    </>
  );
});

export const AccountPanel = () => (
  <AccountModalsContextProvider>
    <AccountPanelComponent />
  </AccountModalsContextProvider>
);
