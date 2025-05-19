import { useNavigate, useSearchParams } from 'react-router-dom';

import { observer } from 'mobx-react-lite';

import { TableIdType } from '@graphql/types';
import { Button } from '@ui/form/Button/Button';
import { useStore } from '@shared/hooks/useStore';
import { EmptyTable } from '@ui/media/logos/EmptyTable';

import HalfCirclePattern from '../../../../src/assets/HalfCirclePattern';

export const EmptyState = observer(() => {
  const store = useStore();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const preset = searchParams?.get('preset');

  const currentPreset = store.tableViewDefs
    ?.toArray()
    .find((e) => e.value.id === preset)?.value?.tableId;

  const allOrgsView = store.tableViewDefs.organizationsPreset;

  const options = (() => {
    switch (currentPreset) {
      case TableIdType.Organizations:
        return {
          title: 'Let the leads flow',
          description:
            'Identify website visitors, capture calendar bookings, or prospect faster with our LinkedIn extension.',
          buttonLabel: 'Add company',
          dataTest: 'all-orgs-add-org',
          onClick: () => {
            store.ui.commandMenu.setType('AddNewOrganization');
            store.ui.commandMenu.setOpen(true);
          },
        };
      case TableIdType.Contacts:
        return {
          title: 'Let the leads flow',
          description:
            'Identify website visitors, capture calendar bookings, or prospect faster with our LinkedIn extension.',
          buttonLabel: 'Add contacts',
          dataTest: 'contacts-go-to-orgs',
          onClick: () => {
            store.ui.commandMenu.setType('AddContactsBulk');
            store.ui.commandMenu.setOpen(true);
          },
        };
      case TableIdType.Customers:
        return {
          title: 'No customers yet',
          description:
            'Change a lead’s stage to Customer for them to show up here',
          buttonLabel: 'Go to Leads',
          dataTest: 'customers-go-to-all-orgs',
          onClick: () => {
            navigate(`/finder?preset=${allOrgsView}`);
          },
        };
      case TableIdType.Contracts:
        return {
          title: 'No signatures yet',
          description:
            'No contracts here yet. Once you create a contract for a company, they will show up here.',
          buttonLabel: 'Go to Companies',
          dataTest: 'contracts-go-to-all-orgs',
          onClick: () => {
            navigate(`/finder?preset=${allOrgsView}`);
          },
        };
      case TableIdType.PastInvoices:
      case TableIdType.UpcomingInvoices:
        return {
          title: 'No paper trails yet',
          description:
            'Once you generate an invoice from a customer’s contract, they will show up here.',
          buttonLabel: 'Go to Companies',
          dataTest: 'invoices-go-to-all-orgs',
          onClick: () => {
            navigate(`/finder?preset=${allOrgsView}`);
          },
        };
      case TableIdType.FlowActions:
        return {
          title: 'No flows yet',
          description:
            'Your flows are waiting to take their first steps. Go ahead and create your first flow.',
          buttonLabel: 'New flow',
          dataTest: 'flow-create-new-flow',
          onClick: () => {
            store.ui.commandMenu.setType('CreateNewFlow');
            store.ui.commandMenu.setOpen(true);
          },
        };
      case TableIdType.FlowContacts:
        return {
          title: 'No contacts yet',
          description:
            'Add contacts to start scheduling messages. Once live, the flow will automatically schedule contacts when the trigger conditions are met.',
          buttonLabel: 'Add contacts',
          dataTest: 'flow-add-contacts',
          onClick: () => {
            store.ui.commandMenu.setType('AddContactsToFlow');
            store.ui.commandMenu.setOpen(true);
          },
        };
      case TableIdType.Tasks:
        return {
          title: 'Taskless territory',
          description:
            'This empty landscape is full of possibilities. Add some tasks and blaze a trail through your to-do list!',
          buttonLabel: 'Create task',
          dataTest: 'tasks-create-task',
          onClick: () => {
            store.tasks.createTask();
          },
        };
      case TableIdType.OpportunitiesRecords:
        return {
          title: 'Opportunity knocks...',
          description:
            "It's quiet now, but big things are coming. Add opportunities and brace yourself for a flurry of sales activity!",
          buttonLabel: 'Create opportunity',
          dataTest: 'opportunities-create-opportunity',
          onClick: () => {
            store.ui.commandMenu.setType('ChooseOpportunityStage');
            store.ui.commandMenu.setOpen(true);
          },
        };
      default:
        return {
          title: "We couldn't find any companies",
          description: 'Manually add a company or connect an app in Settings',
          buttonLabel: 'Add company',
          dataTest: 'go-to-all-orgs',
          onClick: () => {
            store.ui.commandMenu.setType('AddNewOrganization');
            store.ui.commandMenu.setOpen(true);
          },
        };
    }
  })();

  return (
    <div className='flex justify-center bg-white w-full'>
      <div className='flex flex-col h-[500px] w-[500px]'>
        <div className='flex relative'>
          <EmptyTable className='w-[152px] h-[120px] absolute top-[25%] right-[35%]' />
          <HalfCirclePattern width={500} height={500} />
        </div>
        <div className='flex flex-col text-center items-center top-[5vh] transform translate-y-[-230px]'>
          <p className='text-grayModern-900 text-md font-semibold'>
            {options.title}
          </p>
          <p className='max-w-[400px] text-sm text-grayModern-600 my-1'>
            {options.description}
          </p>

          <Button
            variant='outline'
            colorScheme='primary'
            onClick={options.onClick}
            dataTest={options.dataTest}
            className='mt-4 min-w-min text-sm'
          >
            {options.buttonLabel}
          </Button>
        </div>
      </div>
    </div>
  );
});
