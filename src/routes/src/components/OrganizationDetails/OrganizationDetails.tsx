import { useMemo } from 'react';

import { observer } from 'mobx-react-lite';
import { registry } from '@/domain/stores/registry';
import { EditOrganizationTagUsecase } from '@domain/usecases/organization-details/edit-organization-tag.usecase';

import { Icon } from '@ui/media/Icon';
import { flags } from '@ui/media/flags';
import { Spinner } from '@ui/feedback/Spinner';
import { IconButton } from '@ui/form/IconButton';
import { useStore } from '@shared/hooks/useStore';
import { Divider } from '@ui/presentation/Divider';
import { Tag, TagLabel } from '@ui/presentation/Tag';
import { Tooltip } from '@ui/overlay/Tooltip/Tooltip';
import { SocialMediaList } from '@organization/components/Tabs';
import { useCopyToClipboard } from '@shared/hooks/useCopyToClipboard';
import { TruncatedText } from '@ui/presentation/TruncatedText/TruncatedText';
import { IcpBadge } from '@shared/components/OrganizationDetails/components/icp';
import { Domains } from '@shared/components/OrganizationDetails/components/domains';
import { OwnerInput } from '@shared/components/OrganizationDetails/components/owner';
import { AboutTabField } from '@shared/components/OrganizationDetails/components/AboutTabField';
import {
  FlagWrongFields,
  QualificationStatus,
} from '@shared/types/__generated__/graphql.types';

import { Tags } from '../Tags';
import { Documents } from './components/documents';

interface OrganizationDetailsProps {
  id: string;
  isPanel?: boolean;
}

export const OrganizationDetails = observer(
  ({ id, isPanel }: OrganizationDetailsProps) => {
    const store = useStore();
    const organizationStore = registry.get('organizations');
    const organization = organizationStore.get(id);

    const [_, copyToClipboard] = useCopyToClipboard();

    const tagsUsecase = useMemo(
      () => organization && new EditOrganizationTagUsecase(organization),
      [organization],
    );

    const handleCreateOption = () => {
      tagsUsecase?.create();
    };

    const isEnriching = organization?.isEnriching;

    if (!organization) return null;

    return (
      <div className='flex h-full flex-1 bg-white pt-3 relative'>
        <div className='flex h-full flex-col overflow-visible w-full'>
          {isEnriching && (
            <div className='flex items-center justify-start gap-2 border-[1px] text-sm border-grayModern-100 bg-grayModern-50 rounded-[4px] py-1 px-2'>
              <Spinner
                label='enriching company'
                className='text-grayModern-300 fill-grayModern-500 size-4'
              />
              <span className='font-medium'>
                We're enriching this company’s details.
              </span>
            </div>
          )}

          <div className='flex items-center justify-between'>
            <p className='text-sm overflow-hidden overflow-ellipsis font-medium'>
              {organization?.name ?? ''}
            </p>

            <div className='flex justify-between items-start h-full gap-x-2'>
              {organization.referenceId && (
                <div className='ml-4'>
                  <Tooltip asChild={false} label={'Copy ID'}>
                    <Tag
                      variant='outline'
                      colorScheme='grayModern'
                      className='cursor-pointer w-full max-w-[100px]'
                      onClick={() => {
                        copyToClipboard(
                          organization.referenceId ?? '',
                          'Reference ID copied ',
                        );
                      }}
                    >
                      <TagLabel className='truncate overflow-hidden whitespace-nowrap'>
                        {organization.referenceId}
                      </TagLabel>
                    </Tag>
                  </Tooltip>
                </div>
              )}

              <IcpBadge
                qualifiedBy={organization.qualifiedBy!}
                qualificationStatus={organization.qualificationStatus!}
              />
              {store.ui.showPreviewCard && (
                <IconButton
                  size='xxs'
                  variant='ghost'
                  aria-label='close preview company'
                  onClick={() => store.ui.setShowPreviewCard(false)}
                  icon={<Icon name='x-close' className='size-[14px]' />}
                />
              )}
            </div>
          </div>

          <Domains id={id} />

          <div className='flex flex-col w-full items-start justify-start gap-3 mt-2 pb-4'>
            {!!organization?.description && (
              <TruncatedText
                maxLines={7}
                className='text-sm'
                text={organization.description}
                data-test='org-about-description'
              />
            )}
            <SocialMediaList dataTest='org-about-social-link' />
            <Tags
              dataTest='org-about-tags'
              placeholder='Company tags'
              inputPlaceholder='Search...'
              onCreate={handleCreateOption}
              options={tagsUsecase?.tagList ?? []}
              value={tagsUsecase?.selectedTags ?? []}
              inputValue={tagsUsecase?.searchTerm ?? ''}
              setInputValue={tagsUsecase?.setSearchTerm ?? (() => {})}
              leftAccessory={
                <Icon name='tag-01' className='mr-3 text-grayModern-500' />
              }
              onChange={(selection) => {
                tagsUsecase?.select(selection.map((o) => o.value));
              }}
            />
            <AboutTabField
              id={store.ui.focusRow ?? id}
              dataTest={'org-about-industry'}
              value={organization?.industryName}
              placeholder='Industry not found yet'
              field={FlagWrongFields.OrganizationIndustry}
              flaggedAsIncorrect={organization?.wrongIndustry ?? false}
              icon={
                <Icon name='building-07' className='text-grayModern-500 mr-3' />
              }
            />

            {organization.country && (
              <Tooltip align='start' label='Country'>
                <p className='text-sm flex items-center cursor-default'>
                  <span className='flex items-center mr-3'>
                    {organization.locations?.[0]?.countryCodeA2 &&
                      flags[organization.locations?.[0]?.countryCodeA2]}
                  </span>

                  {organization.country}
                </p>
              </Tooltip>
            )}

            {typeof organization.employees === 'number' && (
              <Tooltip align='start' label='Number of employees'>
                <p className='text-sm flex items-center cursor-default '>
                  <Icon name='users-02' className='text-grayModern-500 mr-3' />
                  {organization.employees.toLocaleString()}{' '}
                  {organization.employees === 1 ? 'employee' : 'employees'}
                </p>
              </Tooltip>
            )}
            <OwnerInput
              id={id ?? store.ui.focusRow}
              dataTest='org-about-org-owner'
            />
          </div>
          {!isPanel && (
            <>
              <Divider className='my-4' />
              <Documents id={id} />

              <div id='spacer' className='pb-20' />

              {organization?.customerOsId && (
                <Tooltip label='Copy ID'>
                  <span
                    className='pt-3  text-grayModern-400 cursor-pointer text-sm absolute bottom-0 bg-white'
                    onClick={() =>
                      copyToClipboard(
                        organization.customerOsId ?? '',
                        'CustomerOS ID copied',
                      )
                    }
                  >
                    CustomerOS ID: {organization?.customerOsId}
                  </span>
                </Tooltip>
              )}
            </>
          )}
        </div>
      </div>
    );
  },
);
