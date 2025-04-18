import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';

import noteImg from '@assets/images/note-img-preview.png';

import { Link01 } from '@ui/media/icons/Link01';
import { XClose } from '@ui/media/icons/XClose';
import { Editor } from '@ui/form/Editor/Editor';
import { useStore } from '@shared/hooks/useStore';
import { Tooltip } from '@ui/overlay/Tooltip/Tooltip';
import { Tag, User, EntityType } from '@graphql/types';
import { IconButton } from '@ui/form/IconButton/IconButton';
import { useCopyToClipboard } from '@shared/hooks/useCopyToClipboard';
import { LogEntryWithAliases } from '@organization/components/Timeline/types';
import { HtmlContentRenderer } from '@ui/presentation/HtmlContentRenderer/HtmlContentRenderer';
import { useLogEntryUpdateContext } from '@organization/components/Timeline/PastZone/events/logEntry/context/LogEntryUpdateModalContext';
import {
  useTimelineEventPreviewStateContext,
  useTimelineEventPreviewMethodsContext,
} from '@organization/components/Timeline/shared/TimelineEventPreview/context/TimelineEventPreviewContext';

import { LogEntryDatePicker } from './preview/LogEntryDatePicker';
import { LogEntryExternalLink } from './preview/LogEntryExternalLink';

const getAuthor = (user: User) => {
  if (!user?.firstName && !user?.lastName) {
    return 'Unknown';
  }

  return `${user.firstName} ${user.lastName}`.trim();
};

interface LogEntryPreviewModalProps {
  invalidateQuery: () => void;
}

export const LogEntryPreviewModal = ({
  invalidateQuery,
}: LogEntryPreviewModalProps) => {
  const store = useStore();
  const [searchParams] = useSearchParams();
  const [hashtagsQuery, setHashtagsQuery] = useState<string | null>('');
  const [mentionsQuery, setMentionsQuery] = useState<string | null>('');
  const { modalContent } = useTimelineEventPreviewStateContext();
  const { closeModal } = useTimelineEventPreviewMethodsContext();
  const [_, copy] = useCopyToClipboard();

  const logEntryId = searchParams.get('events') ?? '';
  const logEntry = store.timelineEvents.logEntries.value.get(logEntryId);

  const hashtags = store.tags
    .getByEntityType(EntityType.LogEntry)
    .map((t) => ({
      label: t.value.name,
      value: t.value.metadata.id,
    }))
    .filter((t) =>
      hashtagsQuery
        ? t.label.toLowerCase().includes(hashtagsQuery.toLowerCase())
        : true,
    );

  const mentions = store.users
    .toArray()
    .map(
      ({ value: { name, lastName, firstName } }) =>
        name || [firstName, lastName].filter(Boolean).join(' '),
    )
    .filter((m) =>
      mentionsQuery
        ? m.toLowerCase().includes(mentionsQuery?.toLowerCase())
        : true,
    )
    .filter(Boolean) as string[];

  const event = modalContent as LogEntryWithAliases;
  const author = getAuthor(event?.logEntryCreatedBy);
  const authorEmail = event?.logEntryCreatedBy?.emails?.[0]?.email;

  const isAuthor =
    !!event.logEntryCreatedBy &&
    event.logEntryCreatedBy?.emails?.findIndex(
      (e) => store.session.value.profile.email === e.email,
    ) !== -1;
  const { formId } = useLogEntryUpdateContext();

  return (
    <>
      <div className='py-4 px-6 pb-1 sticky top-0 rounded-xl'>
        <div className='flex justify-between items-center'>
          <div className='flex items-center'>
            <h2 className='text-lg font-semibold'>Log entry</h2>
          </div>
          <div className='flex justify-end items-baseline'>
            <Tooltip side='bottom' asChild={false} label='Copy link'>
              <div>
                <IconButton
                  size='xs'
                  variant='ghost'
                  aria-label='Copy link to this entry'
                  className='text-sm text-grayModern-500 mr-1'
                  icon={<Link01 className='text-grayModern-500' />}
                  onClick={() => copy(window.location.href, 'Link copied')}
                />
              </div>
            </Tooltip>
            <Tooltip
              label='Close'
              side='bottom'
              asChild={false}
              aria-label='close'
            >
              <div>
                <IconButton
                  size='xs'
                  variant='ghost'
                  onClick={closeModal}
                  color='grayModern.500'
                  aria-label='Close preview'
                  className='text-sm text-grayModern-500'
                  dataTest='timeline-popped-up-log-entry-close'
                  icon={<XClose className='text-grayModern-500 size-5' />}
                />
              </div>
            </Tooltip>
          </div>
        </div>
      </div>
      <div className='mt-0 p-6 pt-0 overflow-auto max-h-[calc(100vh-9rem)]'>
        <div className='relative'>
          <img
            alt=''
            src={noteImg}
            className='absolute top-[-2px] right-[-23px] w-[174px] h-[123px]'
          />
        </div>
        <div className='flex flex-col items-start gap-2'>
          <div className='flex flex-col'>
            <LogEntryDatePicker event={event} formId={formId} />
          </div>
          <div className='flex flex-col'>
            <p className='text-sm font-semibold'>Author</p>
            <Tooltip hasArrow label={authorEmail as string}>
              <p className='text-sm'>{author}</p>
            </Tooltip>
          </div>

          <div className='flex flex-col w-full'>
            <p className='text-sm font-semibold'>Entry</p>

            {!isAuthor && (
              <HtmlContentRenderer
                className='text-sm'
                htmlContent={`${event.content}`}
              />
            )}
            {isAuthor && (
              <Editor
                namespace='LogEntryEditor'
                hashtagsOptions={hashtags}
                mentionsOptions={mentions}
                onHashtagSearch={setHashtagsQuery}
                onMentionsSearch={setMentionsQuery}
                dataTest='timeline-popped-up-log-entry-text'
                defaultHtmlValue={event.content ?? undefined}
                onBlur={() => {
                  setTimeout(() => {
                    invalidateQuery();
                  }, 1000);
                }}
                onChange={(html) => {
                  logEntry?.update((value) => {
                    value.content = html;

                    return value;
                  });
                }}
                onHashtagsChange={(hashtags) => {
                  logEntry?.update((value) => {
                    value.tags = hashtags.map(
                      (option) =>
                        ({
                          metadata: { id: option.value },
                          name: option.label,
                        } as Tag),
                    );

                    return value;
                  });
                }}
              />
            )}
          </div>

          {event?.externalLinks?.[0]?.externalUrl && (
            <LogEntryExternalLink externalLink={event?.externalLinks?.[0]} />
          )}
        </div>
      </div>
    </>
  );
};
