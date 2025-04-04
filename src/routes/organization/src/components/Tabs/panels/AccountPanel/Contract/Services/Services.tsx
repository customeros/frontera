import { ServiceLineItem } from '@graphql/types';
import { ServicesList } from '@organization/components/Tabs/panels/AccountPanel/Contract/Services/ServicesList';

interface ServicesProps {
  id: string;
  onModalOpen: () => void;
  currency?: string | null;
  data?: Array<ServiceLineItem> | null;
}

export const Services = ({
  id,
  data,
  currency,
  onModalOpen,
}: ServicesProps) => {
  return (
    <>
      {!!data?.length && (
        <ServicesList id={id} currency={currency} onModalOpen={onModalOpen} />
      )}
    </>
  );
};
