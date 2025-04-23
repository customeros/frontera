import { observer } from 'mobx-react-lite';
import { registry } from '@/domain/stores/registry';

import { cn } from '@ui/utils/cn';
import { useStore } from '@shared/hooks/useStore';
import { stageOptions } from '@organization/components/Tabs/panels/AboutPanel/util';

interface RenewalLikelihoodCellProps {
  id: string;
}

export const OrganizationStageCell = observer(
  ({ id }: RenewalLikelihoodCellProps) => {
    const store = useStore();
    const organization = registry.get('organizations').get(id);

    const selectedStageOption = stageOptions.find(
      (option) => option.value === organization?.stage,
    );

    return (
      <div
        className='flex gap-1 cursor-pointer'
        data-test='organization-stage-in-all-orgs-table'
        onClick={() => {
          store.ui.commandMenu.setType('ChangeStage');
          store.ui.commandMenu.setOpen(true);
        }}
      >
        <p className={cn('text-grayModern-700')}>
          {selectedStageOption?.label ?? 'Not applicable'}
        </p>
      </div>
    );
  },
);
