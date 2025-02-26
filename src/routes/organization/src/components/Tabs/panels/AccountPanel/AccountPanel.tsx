import { useParams } from 'react-router-dom';

import { observer } from 'mobx-react-lite';

import { Icon } from '@ui/media/Icon';
import { Currency } from '@graphql/types';
import { DateTimeUtils } from '@utils/date.ts';
import { Button } from '@ui/form/Button/Button';
import { useStore } from '@shared/hooks/useStore';
import { Tooltip } from '@ui/overlay/Tooltip/Tooltip';
import { Spinner } from '@ui/feedback/Spinner/Spinner';
import { OrganizationPanel } from '@organization/components/Tabs';
import { Contracts } from '@organization/components/Tabs/panels/AccountPanel/Contracts/Contracts';

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
        title='Account'
        shouldBlockPanelScroll={isModalOpen}
        actionItem={
          <div className='flex items-center'>
            <Tooltip label='Add new contract'>
              <Button
                size='xxs'
                variant='outline'
                colorScheme='primary'
                onClick={handleCreate}
                aria-label='Add new contract'
                loadingText='Adding contract...'
                isLoading={store.contracts.isLoading}
                isDisabled={store.contracts.isLoading}
                leftIcon={<Icon name='file-plus-02' />}
                dataTest='org-account-nonempty-new-contract'
                leftSpinner={
                  <Spinner
                    size='xs'
                    label='Adding contract...'
                    className='text-grayModern-500 fill-grayModern-700'
                  />
                }
              >
                Add
              </Button>
            </Tooltip>
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
