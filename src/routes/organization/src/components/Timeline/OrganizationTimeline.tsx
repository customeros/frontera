import { Virtuoso } from 'react-virtuoso';
import { FC, useMemo, useEffect, useCallback } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';

import { observer } from 'mobx-react-lite';
import { useQueryClient } from '@tanstack/react-query';
import { setHours, setSeconds, setMinutes, setMilliseconds } from 'date-fns';

import { DateTimeUtils } from '@utils/date';
import { Button } from '@ui/form/Button/Button';
import { useStore } from '@shared/hooks/useStore';
import { Meeting, ExternalSystemType } from '@graphql/types';
import { getGraphQLClient } from '@shared/util/getGraphQLClient';
import { EmptyTimeline } from '@organization/components/Timeline/EmptyTimeline';
import { ShortcutsPanel } from '@shared/components/PreviewCard/components/ShortcutsPanel';
import { SlackStub } from '@organization/components/Timeline/PastZone/events/slack/SlackStub';
import { IssueStub } from '@organization/components/Timeline/PastZone/events/issue/IssueStub';
import { useTimelineRefContext } from '@organization/components/Timeline/context/TimelineRefContext';
import { IntercomStub } from '@organization/components/Timeline/PastZone/events/intercom/IntercomStub';
import { LogEntryStub } from '@organization/components/Timeline/PastZone/events/logEntry/LogEntryStub';
import { UserActionStub } from '@organization/components/Timeline/PastZone/events/action/UserActionStub';
import { TimelineActions } from '@organization/components/Timeline/FutureZone/TimelineActions/TimelineActions';
import { MarkdownEventStub } from '@organization/components/Timeline/PastZone/events/markdownEvent/MarkdownEventStub';
import { TimelineItemSkeleton } from '@organization/components/Timeline/PastZone/events/TimelineItem/TimelineItemSkeleton';
import { TimelineEventPreviewModal } from '@organization/components/Timeline/shared/TimelineEventPreview/TimelineEventPreviewModal';

import { useTimelineMeta } from './state';
// import { FutureZone } from './FutureZone/FutureZone';
import { EmailStub, TimelineItem } from './PastZone/events';
import { MeetingStub } from './PastZone/events/meeting/MeetingStub';
import { useInfiniteGetTimelineQuery } from '../../graphql/getTimeline.generated';
import { InvoicePreviewModal } from './PastZone/events/invoice/InvoicePreviewModal';
import {
  TimelineEvent,
  LogEntryWithAliases,
  InteractionEventWithDate,
} from './types';

// TODO: type this context accordingly
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const Header: FC<{ context?: any }> = ({ context: { loadMore, loading } }) => {
  return (
    <Button
      size='sm'
      className='mt-4'
      variant='outline'
      onClick={loadMore}
      isLoading={loading}
      isDisabled={loading}
      colorScheme='primary'
      loadingText='Loading'
    >
      Load more
    </Button>
  );
};

export const NEW_DATE = setSeconds(
  setMilliseconds(
    setMinutes(
      setHours(
        new Date(new Date(new Date().setDate(new Date().getDate() + 1))),
        0,
      ),
      0,
    ),
    0,
  ),
  0,
);

function getEventDate(event?: TimelineEvent) {
  return (
    (event as InteractionEventWithDate)?.date ||
    (event as LogEntryWithAliases)?.logEntryStartedAt ||
    (event as Meeting)?.createdAt
  );
}

export const OrganizationTimeline = observer(() => {
  const [searchParams] = useSearchParams();
  const invoicesTab = searchParams?.get('tab') === 'invoices';
  const invoicePreview = searchParams?.get('preview');
  const store = useStore();

  const styles = useMemo(
    () => ({ height: '100%', width: '100%', background: 'white' }),
    [],
  );
  const id = useParams()?.id as string;
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { virtuosoRef } = useTimelineRefContext();
  const [timelineMeta, setTimelineMeta] = useTimelineMeta();
  const client = getGraphQLClient();

  const timeline =
    store.timelineEvents.getByOrganizationId(id)?.map((t) => t?.value) ?? [];

  const { data, isFetchingNextPage, fetchNextPage, isPending } =
    useInfiniteGetTimelineQuery(
      client,
      {
        organizationId: id,
        from: NEW_DATE.toISOString(),
        size: store.demoMode ? 100 : 50,
      },
      {
        initialPageParam: 0,
        enabled: !store.demoMode,
        getNextPageParam: (lastPage) => {
          const lastEvent = lastPage?.organization?.timelineEvents?.slice(
            -1,
          )?.[0] as InteractionEventWithDate;
          const lastEventDate = getEventDate(lastEvent as TimelineEvent);

          return {
            from: lastEvent ? lastEventDate : new Date(),
          };
        },
      },
    );

  const invalidateQuery = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ['GetTimeline.infinite'] });
  }, []);

  const timelineItemsLength = Object.values(data?.pages ?? []).reduce(
    (acc, curr) => curr.organization?.timelineEventsTotalCount + acc,
    0,
  );

  useEffect(() => {
    setTimelineMeta({
      ...timelineMeta,
      getTimelineVariables: {
        organizationId: id,
        from: NEW_DATE.toISOString(),
        size: 50,
      },
    });
  }, [NEW_DATE, id]);

  useEffect(() => {
    setTimelineMeta((prev) => ({
      ...prev,
      itemCount: timelineItemsLength,
    }));
  }, [timelineItemsLength]);

  const virtuosoContext = useMemo(
    () => ({
      loadMore: () => fetchNextPage(),
      loading: isFetchingNextPage,
    }),
    [fetchNextPage, isFetchingNextPage],
  );
  const Footer = useCallback(() => {
    return (
      <>
        <TimelineActions invalidateQuery={invalidateQuery} />
        {/* <FutureZone /> */}
        <div className='h-[64px] bg-white' />
      </>
    );
  }, [invalidateQuery]);

  const flattenData = data?.pages.flatMap(
    (page) => page?.organization?.timelineEvents,
  ) as unknown as TimelineEvent[];

  const loadedDataCount = store.demoMode
    ? timeline?.length
    : flattenData?.length;

  const timelineEmailEvents = (store.demoMode ? timeline : flattenData)
    ?.filter((d) => {
      if (!d) return false;

      switch (d.__typename) {
        case 'InteractionEvent':
          return (
            !!d?.id && ['EMAIL', 'SLACK', 'CHAT'].includes(d.channel ?? '')
          );
        case 'Meeting':
        case 'LogEntry':
        case 'Issue':
          return !!d.id;
        case 'Action':
          return !!d.id && d.actionType !== 'CREATED';
        case 'MarkdownEvent':
          return !!d.markdownEventMetadata?.id;
        default:
          return false;
      }
    })
    .sort((a, b) => {
      const getDate = (a: TimelineEvent) => {
        if (!a) return null;

        switch (a.__typename) {
          case 'InteractionEvent':
            return a.date;
          case 'Meeting':
          case 'Action':
          case 'Issue':
            return a.createdAt;
          case 'LogEntry':
            return a.logEntryStartedAt;
          case 'MarkdownEvent':
            return a.markdownEventMetadata.created;

          default:
            return null;
        }
      };
      const aDate = getDate(a as TimelineEvent);
      const bDate = getDate(b as TimelineEvent);

      return Date.parse(aDate) - Date.parse(bDate);
    });

  useEffect(() => {
    store.timelineEvents.bootstrapTimeline(id);
  }, [id]);

  if (!isPending && !timelineEmailEvents?.length) {
    return (
      <>
        <EmptyTimeline invalidateQuery={invalidateQuery} />
        <TimelineEventPreviewModal invalidateQuery={invalidateQuery} />
        {invoicesTab && invoicePreview && (
          <InvoicePreview previewCard={Boolean(invoicePreview)} />
        )}
        {store.ui.showShortcutsPanel && (
          <div className='absolute top-0 right-0 data-[state=open]:animate-slideLeftAndFade data-[state=closed]:animate-slideRightAndFade flex flex-col border border-r-0 border-t-0 border-b border-grayModern-200 w-[30vw] min-w-[600px] h-[calc(100vh-42px)] overflow-y-auto z-10 bg-white '>
            <ShortcutsPanel />
          </div>
        )}
      </>
    );
  }

  if (isPending && !isFetchingNextPage) {
    return (
      <>
        <div className='flex flex-col mt-4 pl-6 w-full animate-fadeIn'>
          <TimelineItemSkeleton />
          <TimelineItemSkeleton />
        </div>
        {invoicesTab && invoicePreview && (
          <InvoicePreview previewCard={Boolean(invoicePreview)} />
        )}
        {store.ui.showShortcutsPanel && (
          <div className='absolute top-0 right-0 data-[state=open]:animate-slideLeftAndFade data-[state=closed]:animate-slideRightAndFade flex flex-col border border-r-0 border-t-0 border-b border-grayModern-200 w-[30vw] min-w-[600px] h-[calc(100vh-42px)] overflow-y-auto z-10 bg-white '>
            <ShortcutsPanel />
          </div>
        )}
      </>
    );
  }

  return (
    <>
      {isFetchingNextPage && (
        <div className='flex flex-col mt-4 pl-6 w-full'>
          <TimelineItemSkeleton />
          <TimelineItemSkeleton />
        </div>
      )}

      <Virtuoso<TimelineEvent>
        style={styles}
        ref={virtuosoRef}
        atTopThreshold={100}
        increaseViewportBy={300}
        context={virtuosoContext}
        className='animate-fadeIn'
        data={(timelineEmailEvents as TimelineEvent[]) ?? []}
        initialTopMostItemIndex={{
          align: 'start',
          index: timelineEmailEvents?.length - 1,
          behavior: 'auto',
        }}
        components={{
          Header: (rest) => (
            <div className='flex bg-white p-5'>
              {loadedDataCount &&
              !isFetchingNextPage &&
              data?.pages?.[0]?.organization?.timelineEventsTotalCount >
                loadedDataCount ? (
                <Header {...rest} />
              ) : null}
            </div>
          ),
          Footer: Footer,
        }}
        itemContent={(index, timelineEvent) => {
          const showDate =
            index === 0
              ? true
              : !DateTimeUtils.isSameDay(
                  getEventDate(
                    timelineEmailEvents?.[
                      index - 1
                    ] as InteractionEventWithDate,
                  ),
                  getEventDate(timelineEvent as TimelineEvent),
                );

          switch (timelineEvent.__typename) {
            case 'InteractionEvent': {
              return (
                <TimelineItem showDate={showDate} date={timelineEvent?.date}>
                  {timelineEvent.channel === 'EMAIL' && (
                    <EmailStub email={timelineEvent} />
                  )}
                  {timelineEvent.channel === 'CHAT' && (
                    <>
                      {timelineEvent.externalLinks?.[0]?.type ===
                        ExternalSystemType.Slack && (
                        <SlackStub slackEvent={timelineEvent} />
                      )}
                      {timelineEvent.externalLinks?.[0]?.type ===
                        ExternalSystemType.Intercom && (
                        <IntercomStub intercomEvent={timelineEvent} />
                      )}
                    </>
                  )}
                </TimelineItem>
              );
            }

            case 'Meeting': {
              return (
                <TimelineItem
                  showDate={showDate}
                  date={timelineEvent?.createdAt}
                >
                  <MeetingStub data={timelineEvent} />
                </TimelineItem>
              );
            }

            case 'MarkdownEvent': {
              return (
                <TimelineItem
                  showDate={showDate}
                  date={timelineEvent?.markdownEventMetadata?.created}
                >
                  <MarkdownEventStub event={timelineEvent} />
                </TimelineItem>
              );
            }

            case 'Action': {
              return (
                <TimelineItem
                  showDate={showDate}
                  date={timelineEvent?.createdAt}
                >
                  <UserActionStub data={timelineEvent} />
                </TimelineItem>
              );
            }

            case 'LogEntry': {
              return (
                <TimelineItem
                  showDate={showDate}
                  date={timelineEvent?.logEntryStartedAt}
                >
                  <LogEntryStub data={timelineEvent} />
                </TimelineItem>
              );
            }

            case 'Issue': {
              return (
                <TimelineItem
                  showDate={showDate}
                  date={timelineEvent?.createdAt}
                >
                  <IssueStub data={timelineEvent} />
                </TimelineItem>
              );
            }
            default:
              return <div>not supported</div>;
          }
        }}
      />
      <TimelineEventPreviewModal invalidateQuery={invalidateQuery} />
      {invoicesTab && invoicePreview && (
        <InvoicePreview
          previewCard={Boolean(invoicePreview)}
          onClose={() => {
            const params = new URLSearchParams(window.location.search);

            params.delete('preview');
            navigate(`?${params.toString()}`, { replace: true });
          }}
        />
      )}

      {store.ui.showShortcutsPanel && (
        <div className='absolute top-0 right-0 data-[state=open]:animate-slideLeftAndFade data-[state=closed]:animate-slideRightAndFade flex flex-col border border-r-0 border-t-0 border-b border-grayModern-200 w-[30vw] min-w-[600px] h-[calc(100vh-42px)] overflow-y-auto z-10 bg-white '>
          <ShortcutsPanel />
        </div>
      )}
    </>
  );
});

interface InvoicePreviewProps {
  previewCard: boolean;
  onClose?: () => void;
}

export const InvoicePreview = observer(
  ({ previewCard, onClose }: InvoicePreviewProps) => {
    const [searchParams] = useSearchParams();
    const invoiceNumber = searchParams?.get('preview');

    return (
      <div
        data-state={previewCard ? 'open' : 'closed'}
        className='absolute top-0 right-0 data-[state=open]:animate-slideLeftAndFade data-[state=closed]:animate-slideRightAndFade flex flex-col border border-r-0 border-t-0 border-b border-grayModern-200 w-[30vw] min-w-[600px] h-[calc(100vh-42px)] overflow-y-auto z-10 bg-white '
      >
        <InvoicePreviewModal
          onClose={onClose}
          invoiceId={invoiceNumber ?? ''}
        />
      </div>
    );
  },
);
