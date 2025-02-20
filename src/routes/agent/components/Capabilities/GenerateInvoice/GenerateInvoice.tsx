import { useMemo } from 'react';
import { useParams } from 'react-router-dom';

import { observer } from 'mobx-react-lite';
import { GenerateInvoiceUsecase } from '@domain/usecases/agents/capabilities/generate-invoice.usecase';

import { Icon } from '@ui/media/Icon';
import { Switch } from '@ui/form/Switch';
import { Button } from '@ui/form/Button/Button';
import { Divider } from '@ui/presentation/Divider';
import { ButtonGroup } from '@ui/form/ButtonGroup';

import { FormField } from './components/FormField';
import { CompanyLogo } from './components/CompanyLogo';

export const GenerateInvoice = observer(() => {
  const { id } = useParams<{ id: string }>();

  const usecase = useMemo(() => new GenerateInvoiceUsecase(id!), [id]);

  return (
    <div className='flex flex-col gap-4 px-4 py-3 mb-20'>
      <h1 className='text-sm font-medium'>{usecase.capabilityName}</h1>
      <CompanyLogo
        onChange={usecase.setCompanyLogo}
        onError={usecase.onCompanyLogoError}
        onRemove={usecase.removeCompanyLogo}
        value={usecase.config.logoRepositoryField.value}
      />
      <FormField
        name='legalName'
        label='Company legal name'
        placeholder='E.g. Robert, Inc.'
        value={usecase.config.legalName.value}
        error={usecase.config.legalName.error}
        onChange={(v) => usecase.setProperty('legalName', v)}
      />
      <Divider />
      <div className='flex items-center gap-2'>
        <Icon name='globe-05' />
        <h1 className='text-sm font-medium'>Billing details</h1>
      </div>
      <FormField
        name='country'
        label='Country'
        placeholder='E.g. Australia'
        value={usecase.config.country.value}
        error={usecase.config.country.error}
        onChange={(v) => usecase.setProperty('country', v)}
      />
      <FormField
        label='Address'
        name='addressLine1'
        placeholder='E.g. 742 Evergreen Terrace'
        value={usecase.config.addressLine1.value}
        error={usecase.config.addressLine1.error}
        onChange={(v) => usecase.setProperty('addressLine1', v)}
      />
      <FormField
        optional
        name='addressLine2'
        label='Address line 2'
        placeholder='E.g Suite 101'
        value={usecase.config.addressLine2.value}
        error={usecase.config.addressLine2.error}
        onChange={(v) => usecase.setProperty('addressLine2', v)}
      />
      <FormField
        label='City'
        name='locality'
        placeholder='E.g. Paris'
        value={usecase.config.locality.value}
        error={usecase.config.locality.error}
        onChange={(v) => usecase.setProperty('locality', v)}
      />
      <FormField
        name='zip'
        label='Postal Code'
        placeholder='E.g. 72992'
        value={usecase.config.zip.value}
        error={usecase.config.zip.error}
        onChange={(v) => usecase.setProperty('zip', v)}
      />
      <Divider />
      <div className='flex items-center gap-2'>
        <Icon name='invoice' />
        <h1 className='text-sm font-medium'>Send invoices</h1>
      </div>
      <FormField
        name='fromEmail'
        label='From Email'
        placeholder='From Email'
        value={usecase.config.fromEmail.value}
        error={usecase.config.fromEmail.error}
        onChange={(v) => usecase.setProperty('fromEmail', v)}
      />
      <FormField
        name='ccEmails'
        label='CC Emails'
        placeholder='CC Emails'
        value={usecase.config.ccEmails.value}
        error={usecase.config.ccEmails.error}
        onChange={(v) => usecase.setProperty('ccEmails', v)}
      />
      <FormField
        name='bccEmails'
        label='BCC Emails'
        placeholder='BCC Emails'
        value={usecase.config.bccEmails.value}
        error={usecase.config.bccEmails.error}
        onChange={(v) => usecase.setProperty('bccEmails', v)}
      />
      <Divider />
      <div className='flex items-center justify-between'>
        <div className='flex items-center gap-2'>
          <Icon name='bank' />
          <h1 className='text-sm font-medium'>Bank account information</h1>
        </div>
        <Switch
          size='sm'
          onCheckedChange={usecase.toggleBankDetails}
          checked={usecase.config.includeBankTransferDetails.value}
        />
      </div>
      {usecase.config.includeBankTransferDetails.value && (
        <>
          <ButtonGroup variant='default' className='max-w-[320px]'>
            <Button size='xxs' className='w-full selected'>
              USA
            </Button>
            <Button size='xxs' className='w-full'>
              EU
            </Button>
            <Button size='xxs' className='w-full'>
              UK
            </Button>
            <Button size='xxs' className='w-full'>
              Other
            </Button>
          </ButtonGroup>
          <FormField
            name='bankName'
            label='Bank Name'
            value={usecase.config.bankName.value}
            error={usecase.config.bankName.error}
            placeholder='E.g. Robert, Inc. account'
            onChange={(v) => usecase.setProperty('bankName', v)}
          />
          <FormField
            name='sortCode'
            label='Sort Code'
            placeholder='E.g. 123456789'
            value={usecase.config.sortCode.value}
            error={usecase.config.sortCode.error}
            onChange={(v) => usecase.setProperty('sortCode', v)}
          />
          <FormField
            name='routingNumber'
            label='Routing number'
            placeholder='E.g. 123456789'
            value={usecase.config.routingNumber.value}
            error={usecase.config.routingNumber.error}
            onChange={(v) => usecase.setProperty('sortCode', v)}
          />
          <FormField
            name='accountNumber'
            label='Account Number'
            placeholder='E.g. 987654321'
            value={usecase.config.accountNumber.value}
            error={usecase.config.accountNumber.error}
            onChange={(v) => usecase.setProperty('accountNumber', v)}
          />
          <FormField
            name='bic'
            label='BIC/Swift'
            placeholder='E.g. ROBERT33XXX'
            value={usecase.config.bic.value}
            error={usecase.config.bic.error}
            onChange={(v) => usecase.setProperty('bic', v)}
          />
          <FormField
            optional
            name='otherDetails'
            label='Other Details'
            placeholder='Other Details'
            value={usecase.config.otherDetails.value}
            error={usecase.config.otherDetails.error}
            onChange={(v) => usecase.setProperty('otherDetails', v)}
          />
        </>
      )}
    </div>
  );
});
