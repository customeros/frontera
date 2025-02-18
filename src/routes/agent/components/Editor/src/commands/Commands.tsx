import React, { ReactNode } from 'react';

import { observer } from 'mobx-react-lite';

import { useStore } from '@shared/hooks/useStore';
import { Command, CommandInput } from '@ui/overlay/CommandMenu';

import { StepsHub } from './action';

export const CommandsContainer = ({
  children,
  placeholder,
  dataTest,
}: {
  dataTest?: string;
  placeholder: string;
  children: ReactNode;
}) => {
  return (
    <Command
      data-test={dataTest}
      onClick={(e) => {
        e.stopPropagation();
      }}
      filter={(value, search, keywords) => {
        const extendValue = value.replace(/\s/g, '') + keywords;
        const searchWithoutSpaces = search.replace(/\s/g, '');

        if (
          extendValue.toLowerCase().includes(searchWithoutSpaces.toLowerCase())
        )
          return 1;

        return 0;
      }}
    >
      <CommandInput
        autoFocus
        className='p-1 text-sm'
        placeholder={placeholder}
        inputWrapperClassName='min-h-4'
        data-test={`${dataTest}-input`}
        wrapperClassName='py-2 px-4 mt-2'
      />
      <Command.List>
        <Command.Group>{children}</Command.Group>
      </Command.List>
    </Command>
  );
};

export const DropdownCommandMenu = observer(() => {
  const { ui } = useStore();

  return (
    <CommandsContainer
      placeholder={'Search a step'}
      dataTest={ui.flowCommandMenu.type}
    >
      <StepsHub />
    </CommandsContainer>
  );
});
