import { ValueContainerProps } from 'react-select';
import { useSearchParams } from 'react-router-dom';
import { useRef, useState, useEffect } from 'react';

import { match } from 'ts-pattern';
import { useKeyBindings } from 'rooks';
import { observer } from 'mobx-react-lite';
import { Droppable, DragDropContext } from '@hello-pangea/dnd';

import { cn } from '@ui/utils/cn';
import { Input } from '@ui/form/Input';
import { Button } from '@ui/form/Button/Button';
import { Type01 } from '@ui/media/icons/Type01';
import { Hash02 } from '@ui/media/icons/Hash02';
import { useStore } from '@shared/hooks/useStore';
import { PlusCircle } from '@ui/media/icons/PlusCircle';
import { HandleDrag } from '@ui/media/icons/HandleDrag';
import { RadioButton } from '@ui/media/icons/RadioButton';
import {
  EntityType,
  CustomFieldTemplateType,
} from '@shared/types/__generated__/graphql.types';
import {
  Select,
  components,
  OptionProps,
  getMenuListClassNames,
  getContainerClassNames,
} from '@ui/form/Select';
import {
  Modal,
  ModalBody,
  ModalPortal,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  ModalContent,
  ModalCloseButton,
} from '@ui/overlay/Modal';

import { DraggableItem } from './DraggbleItem';
import { getCustomFieldTypes } from '../../Organizations/filedTypes';

interface NewCustomFieldModalProps {
  isOpen: boolean;
  isEdit?: boolean;
  fieldId?: string;
  onOpenChange: (value: boolean) => void;
}

const options = [
  {
    label: 'Text',
    id: CustomFieldTemplateType.FreeText,
    icon: <Type01 className='text-grayModern-500' />,
  },
  {
    label: 'Number',
    id: CustomFieldTemplateType.Number,
    icon: <Hash02 className='text-grayModern-500' />,
  },
  {
    label: 'Single select',
    id: CustomFieldTemplateType.SingleSelect,
    icon: <RadioButton className='text-grayModern-500' />,
  },
];

export const CustomFieldModal = observer(
  ({
    isOpen,
    onOpenChange,
    isEdit = false,
    fieldId,
  }: NewCustomFieldModalProps) => {
    const store = useStore();
    const inputRef = useRef<HTMLInputElement>(null);
    const endOfOptionsRef = useRef<HTMLDivElement>(null);
    const [searchParams] = useSearchParams();
    const [name, setName] = useState<string>('');

    const [selectedOption, setSelectedOption] = useState(() => {
      if (isEdit) {
        const fieldType = store.customFields.value.get(fieldId || '')?.value
          .template?.type;

        return options.find((option) => option.id === fieldType) || options[0];
      }

      return options[0];
    });
    const [isHovered, setIsHovered] = useState<string | null>(null);

    const [newOption, setnewOptions] = useState<
      { id: string; value: string; label: string }[]
    >(() =>
      isEdit
        ? store.customFields.value
            .get(fieldId || '')
            ?.value?.template?.validValues?.map((option) => ({
              value: option,
              label: option,
              id: `option-${crypto.randomUUID()}`,
            })) || []
        : [],
    );

    const [isError, setIsError] = useState<boolean>(false);

    const Option = ({ children, ...props }: OptionProps) => {
      const option = props.data as {
        id: string;
        label: string;
        icon: JSX.Element;
      };

      return (
        <components.Option {...props}>
          <div className='flex items-center gap-2'>
            {option.icon}
            {children}
          </div>
        </components.Option>
      );
    };

    const ValueContainer = ({ children, ...props }: ValueContainerProps) => {
      const selectedValue = props?.getValue()[0] as unknown as {
        id: string;
        label: string;
        icon: JSX.Element;
      };

      const icon = options.find(
        (option) => option?.id === selectedValue?.id,
      )?.icon;

      return (
        <components.ValueContainer {...props}>
          <div className='flex items-center gap-2'>
            {icon}
            {children}
          </div>
        </components.ValueContainer>
      );
    };

    const view = searchParams.get('tab') || 'organizations';

    const titleForNewCustomField = (() => {
      return match(view)
        .with('organizations', () => 'New company custom field')
        .with('contacts', () => 'New contact custom field')
        .otherwise(() => 'New custom field');
    })();

    const titleForEditMode = (() => {
      return match(view)
        .with('organizations', () => 'Edit company custom field')
        .with('contacts', () => 'Edit contact custom field')
        .otherwise(() => 'Edit custom field');
    })();

    const title = isEdit ? titleForEditMode : titleForNewCustomField;

    const customField = store.customFields.value.get(fieldId || '');

    const editField =
      getCustomFieldTypes()[
        customField?.value.template?.type as keyof typeof customField
      ];

    useKeyBindings({
      Enter: () => {
        setnewOptions([
          ...newOption,
          {
            value: '',
            label: '',
            id: `option-${crypto.randomUUID()}`,
          },
        ]);
      },
    });

    useEffect(() => {
      if (isOpen) {
        inputRef.current?.focus();
      }
    }, [isOpen]);

    useEffect(() => {
      endOfOptionsRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [newOption]);

    return (
      <Modal open={isOpen} onOpenChange={(value) => onOpenChange(value)}>
        <ModalPortal>
          <ModalOverlay />
          <ModalContent className='max-h-[480px]  overflow-auto'>
            <ModalHeader className='top-0 sticky bg-white z-[9999]'>
              <p className='text-lg font-semibold'>{title}</p>
              <ModalCloseButton asChild />
            </ModalHeader>
            <ModalBody className='flex flex-col gap-4 '>
              <div className='flex flex-col gap-2 '>
                <div>
                  {!isEdit ? (
                    <>
                      <label htmlFor='type' className='font-medium text-sm'>
                        Type
                      </label>
                      <Select
                        id='type'
                        className='mt-1'
                        autoFocus={false}
                        defaultValue={options[0]}
                        onKeyDown={(e) => e.stopPropagation()}
                        components={{ Option, ValueContainer }}
                        onChange={(value) => {
                          setSelectedOption(value as typeof selectedOption);
                        }}
                        options={options.map((option) => ({
                          ...option,
                          value: option.id,
                        }))}
                        classNames={{
                          container: (props) =>
                            getContainerClassNames('', 'outline', {
                              ...props,
                              size: 'sm',
                            }),
                          menuList: () => getMenuListClassNames('ml-[-14px]'),
                        }}
                      />
                    </>
                  ) : (
                    <div className='flex items-center gap-2'>
                      {editField.icon}
                      {editField.fieldTypeName}
                    </div>
                  )}
                </div>
                <div>
                  <label htmlFor='name' className='font-medium text-sm'>
                    Name
                  </label>
                  <Input
                    id='name'
                    size='sm'
                    ref={inputRef}
                    className='mt-1'
                    variant='outline'
                    required={isError}
                    placeholder='Custom field name'
                    defaultValue={customField?.value.name}
                    onChange={(e) => {
                      if (customField) {
                        customField.value.name = e.target.value;
                      }
                      setName(e.target.value);
                      setIsError(false);
                    }}
                  />
                  {isError && (
                    <span className='text-error-500 text-sm ml-2'>
                      Huston, we have a blank...
                    </span>
                  )}
                </div>
                {selectedOption?.id ===
                  CustomFieldTemplateType.SingleSelect && (
                  <div className='mt-2 flex flex-col'>
                    <label htmlFor='options' className='font-medium text-sm'>
                      Options
                    </label>
                    <DragDropContext
                      onDragEnd={(result) => {
                        if (!result.destination) return;

                        const items = [...newOption];
                        const [reorderedItem] = items.splice(
                          result.source.index,
                          1,
                        );

                        items.splice(
                          result.destination.index,
                          0,
                          reorderedItem,
                        );

                        setnewOptions(items);
                      }}
                    >
                      <Droppable
                        droppableId='options'
                        renderClone={(provided, snapshot, rubric) => (
                          <div
                            ref={provided.innerRef}
                            className={cn(
                              'flex relative z-[100]',
                              snapshot.isDragging && 'shadow-md',
                            )}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                          >
                            <HandleDrag className='absolute bottom-2.5 left-[7px]' />
                            <Input
                              size='sm'
                              className='pl-8'
                              variant='outline'
                              placeholder='Option'
                              id={`option-${rubric.source.index}`}
                              defaultValue={
                                newOption[rubric.source.index].label
                              }
                            />
                          </div>
                        )}
                      >
                        {(provided) => (
                          <div
                            {...provided.droppableProps}
                            ref={provided.innerRef}
                          >
                            {newOption.map((option, index) => (
                              <DraggableItem
                                index={index}
                                option={option}
                                newOption={newOption}
                                isHovered={isHovered}
                                setIsHovered={setIsHovered}
                                setnewOptions={setnewOptions}
                              />
                            ))}
                            {provided.placeholder}
                          </div>
                        )}
                      </Droppable>
                    </DragDropContext>
                    <Button
                      size='xs'
                      variant='ghost'
                      className='w-fit'
                      leftIcon={<PlusCircle />}
                      onClick={() =>
                        setnewOptions([
                          ...newOption,
                          {
                            value: '',
                            label: '',
                            id: `option-${crypto.randomUUID()}`,
                          },
                        ])
                      }
                    >
                      Add option
                    </Button>
                    <div ref={endOfOptionsRef} />
                  </div>
                )}
              </div>
            </ModalBody>
            <ModalFooter className='flex gap-3 sticky bottom-0 bg-white'>
              <ModalCloseButton asChild>
                <Button className='w-full'>Cancel</Button>
              </ModalCloseButton>
              <Button
                className='w-full'
                colorScheme='primary'
                onClick={() => {
                  if (isEdit) {
                    customField?.commit();
                    onOpenChange(false);
                  } else {
                    setIsError(true);

                    if (name) {
                      store.customFields.save({
                        name: name,
                        entityType: EntityType.Organization,
                        type: selectedOption.id as CustomFieldTemplateType,
                        validValues:
                          selectedOption?.id ===
                          CustomFieldTemplateType.SingleSelect
                            ? newOption.map((option) => option.value)
                            : null,
                      });
                      onOpenChange(false);
                    }
                  }
                }}
              >
                {isEdit ? 'Update field' : 'Create field'}
              </Button>
            </ModalFooter>
          </ModalContent>
        </ModalPortal>
      </Modal>
    );
  },
);
