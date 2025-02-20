import { useMemo } from 'react';
import { useParams } from 'react-router-dom';

import { observer } from 'mobx-react-lite';
import { GenerateInvoiceUsecase } from '@domain/usecases/agents/capabilities/generate-invoice.usecase';

import { cn } from '@ui/utils/cn';
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
        value={usecase.config.logoRepositoryFileId.value}
      />
      <FormField
        name='legalName'
        label='Company legal name'
        placeholder='E.g. Robert, Inc.'
        value={usecase.config.legalName.value}
        error={usecase.config.legalName.error}
        onBlur={() => usecase.execute('legalName')}
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
        onBlur={() => usecase.execute('country')}
        onChange={(v) => usecase.setProperty('country', v)}
      />
      <FormField
        label='Address'
        name='addressLine1'
        placeholder='E.g. 742 Evergreen Terrace'
        value={usecase.config.addressLine1.value}
        error={usecase.config.addressLine1.error}
        onBlur={() => usecase.execute('addressLine1')}
        onChange={(v) => usecase.setProperty('addressLine1', v)}
      />
      <FormField
        optional
        name='addressLine2'
        label='Address line 2'
        placeholder='E.g Suite 101'
        value={usecase.config.addressLine2.value}
        error={usecase.config.addressLine2.error}
        onBlur={() => usecase.execute('addressLine2')}
        onChange={(v) => usecase.setProperty('addressLine2', v)}
      />
      <FormField
        label='City'
        name='locality'
        placeholder='E.g. Paris'
        value={usecase.config.locality.value}
        error={usecase.config.locality.error}
        onBlur={() => usecase.execute('locality')}
        onChange={(v) => usecase.setProperty('locality', v)}
      />
      <FormField
        name='zip'
        label='Postal code'
        placeholder='E.g. 72992'
        value={usecase.config.zip.value}
        error={usecase.config.zip.error}
        onBlur={() => usecase.execute('zip')}
        onChange={(v) => usecase.setProperty('zip', v)}
      />
      <Divider />
      <div className='flex items-center gap-2'>
        <Icon name='invoice' />
        <h1 className='text-sm font-medium'>Send invoices</h1>
      </div>
      <FormField
        name='fromEmail'
        label='From email'
        placeholder='From Email'
        value={usecase.config.fromEmail.value}
        error={usecase.config.fromEmail.error}
        onBlur={() => usecase.execute('fromEmail')}
        onChange={(v) => usecase.setProperty('fromEmail', v)}
      />
      <FormField
        label='CC'
        name='ccEmails'
        placeholder='CC address'
        error={usecase.config.ccEmails.error}
        value={usecase.config.ccEmails.value[0]}
        onBlur={() => usecase.execute('ccEmails')}
        onChange={(v) => usecase.setProperty('ccEmails', [v])}
      />
      <FormField
        label='BCC'
        name='bccEmails'
        placeholder='BCC address'
        error={usecase.config.bccEmails.error}
        value={usecase.config.bccEmails.value[0]}
        onBlur={() => usecase.execute('bccEmails')}
        onChange={(v) => usecase.setProperty('bccEmails', [v])}
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
            <Button
              size='xxs'
              onClick={() => usecase.toggleBankInfoTemplate('usa')}
              className={cn('w-full', {
                selected: usecase.isBankInfoTemplate('usa'),
              })}
            >
              USA
            </Button>
            <Button
              size='xxs'
              onClick={() => usecase.toggleBankInfoTemplate('eu')}
              className={cn('w-full', {
                selected: usecase.isBankInfoTemplate('eu'),
              })}
            >
              EU(SEPA)
            </Button>
            <Button
              size='xxs'
              onClick={() => usecase.toggleBankInfoTemplate('uk')}
              className={cn('w-full', {
                selected: usecase.isBankInfoTemplate('uk'),
              })}
            >
              UK
            </Button>
            <Button
              size='xxs'
              onClick={() => usecase.toggleBankInfoTemplate('other')}
              className={cn('w-full', {
                selected: usecase.isBankInfoTemplate('other'),
              })}
            >
              Other
            </Button>
          </ButtonGroup>
          <FormField
            name='bankName'
            label='Bank name'
            value={usecase.config.bankName.value}
            error={usecase.config.bankName.error}
            onBlur={() => usecase.execute('bankName')}
            onChange={(v) => usecase.setProperty('bankName', v)}
            placeholder={
              usecase.isBankInfoTemplate('usa')
                ? 'E.g. Bank of America'
                : 'E.g. Barclays'
            }
          />
          {usecase.isBankInfoTemplate('uk') && (
            <FormField
              name='sortCode'
              label='Sort code'
              placeholder='E.g. 12-34-56'
              value={usecase.config.sortCode.value}
              error={usecase.config.sortCode.error}
              onBlur={() => usecase.execute('sortCode')}
              onChange={(v) => usecase.setProperty('sortCode', v)}
            />
          )}
          {usecase.isBankInfoTemplate('usa') && (
            <FormField
              name='routingNumber'
              label='Routing number'
              placeholder='E.g. 123456789'
              value={usecase.config.routingNumber.value}
              error={usecase.config.routingNumber.error}
              onBlur={() => usecase.execute('routingNumber')}
              onChange={(v) => usecase.setProperty('routingNumber', v)}
            />
          )}
          {usecase.isBankInfoTemplate('usa', 'other') && (
            <FormField
              name='accountNumber'
              label='Account number'
              placeholder='E.g. 987654321'
              value={usecase.config.accountNumber.value}
              error={usecase.config.accountNumber.error}
              onBlur={() => usecase.execute('accountNumber')}
              onChange={(v) => usecase.setProperty('accountNumber', v)}
            />
          )}
          {usecase.isBankInfoTemplate('eu', 'other') && (
            <FormField
              name='iban'
              label='IBAN'
              value={usecase.config.iban.value}
              error={usecase.config.iban.error}
              onBlur={() => usecase.execute('iban')}
              placeholder='E.g. DE89370400440532013000'
              onChange={(v) => usecase.setProperty('iban', v)}
            />
          )}
          <FormField
            name='bic'
            label='BIC/Swift'
            placeholder='E.g. INGBROBU'
            value={usecase.config.bic.value}
            error={usecase.config.bic.error}
            onBlur={() => usecase.execute('bic')}
            onChange={(v) => usecase.setProperty('bic', v)}
          />
          <FormField
            optional
            name='otherDetails'
            label='Other Details'
            placeholder='Other details'
            value={usecase.config.otherDetails.value}
            error={usecase.config.otherDetails.error}
            onBlur={() => usecase.execute('otherDetails')}
            onChange={(v) => usecase.setProperty('otherDetails', v)}
          />
        </>
      )}
    </div>
  );
});
