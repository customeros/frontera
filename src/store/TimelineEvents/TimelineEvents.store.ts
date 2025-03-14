import { match } from 'ts-pattern';
import { RootStore } from '@store/root';
import { Transport } from '@infra/transport';
import { runInAction, makeAutoObservable } from 'mobx';

import {
  Note,
  Issue,
  Action,
  Meeting,
  PageView,
  LogEntry,
  TimelineEvent,
  InteractionEvent,
  InteractionSession,
} from '@graphql/types';

import { NoteStore } from './Note/Note.store';
import { NotesStore } from './Note/Notes.store';
import { IssueStore } from './Issues/Issue.store';
import { IssuesStore } from './Issues/Issues.store';
import { ActionStore } from './Actions/Action.store';
import { ActionsStore } from './Actions/Actions.store';
import { MeetingStore } from './Meetings/Meeting.store';
import { MeetingsStore } from './Meetings/Meetings.store';
import { LogEntryStore } from './LogEntry/LogEntry.store';
import { MarkdownEventType } from './MarkdownEvent/types';
import { PageViewStore } from './PageViews/PageView.store';
import { PageViewsStore } from './PageViews/PageViews.store';
import { LogEntriesStore } from './LogEntry/LogEntries.store';
import { MarkdownEventStore } from './MarkdownEvent/MarkdownEvent.store';
import { MarkdownEventsStore } from './MarkdownEvent/MarkdownEvents.store';
import { TimelineEventsService } from './__service__/TimelineEvents.service';
import { InteractionEventStore } from './InteractionEvents/InteractionEvent.store';
import { InteractionEventsStore } from './InteractionEvents/InteractionEvents.store';
import { InteractionSessionStore } from './InteractionSessions/InteractionSession.store';
import { InteractionSessionsStore } from './InteractionSessions/InteractionsSessions.store';

type TimelineEventStore =
  | NoteStore
  | IssueStore
  | ActionStore
  | MeetingStore
  | PageViewStore
  | LogEntryStore
  | InteractionEventStore
  | MarkdownEventStore
  | InteractionSessionStore;

export class TimelineEventsStore {
  notes: NotesStore;
  issues: IssuesStore;
  actions: ActionsStore;
  meetings: MeetingsStore;
  pageViews: PageViewsStore;
  logEntries: LogEntriesStore;
  interactionEvents: InteractionEventsStore;
  interactionSessions: InteractionSessionsStore;
  markdownEvents: MarkdownEventsStore;
  private service: TimelineEventsService;
  isLoading = false;
  error: string | null = null;
  value: Map<string, TimelineEventStore[]> = new Map();

  constructor(public root: RootStore, public transport: Transport) {
    this.notes = new NotesStore(this.root, this.transport);
    this.issues = new IssuesStore(this.root, this.transport);
    this.actions = new ActionsStore(this.root, this.transport);
    this.meetings = new MeetingsStore(this.root, this.transport);
    this.pageViews = new PageViewsStore(this.root, this.transport);
    this.logEntries = new LogEntriesStore(this.root, this.transport);
    this.markdownEvents = new MarkdownEventsStore(this.root, this.transport);
    this.interactionEvents = new InteractionEventsStore(
      this.root,
      this.transport,
    );
    this.interactionSessions = new InteractionSessionsStore(
      this.root,
      this.transport,
    );
    this.service = TimelineEventsService.getInstance(this.transport);

    makeAutoObservable(this);
  }

  bootstrapTimeline(organizationId: string) {
    if (this.value.has(organizationId)) {
      return;
    }

    this.invalidateTimeline(organizationId);
  }

  async invalidateTimeline(organizationId: string) {
    try {
      this.isLoading = true;

      const { organization } = await this.service.getTimeline({
        from: new Date(),
        organizationId,
        size: 100,
      });

      runInAction(() => {
        const timeline = this.makeTimeline(
          (organization?.timelineEvents as TimelineEvent[]) || [],
        );

        this.value.set(organizationId, timeline as TimelineEventStore[]);
      });
    } catch (e) {
      runInAction(() => {
        this.error = (e as Error).message;
      });
    } finally {
      runInAction(() => {
        this.isLoading = false;
      });
    }
  }

  getByOrganizationId(organizationId: string) {
    return this.value.get(organizationId);
  }

  private makeTimeline(timelineEvents: TimelineEvent[]) {
    return timelineEvents.map((event) => {
      return match(event)
        .with({ __typename: 'Note' }, (note) => {
          this.notes.load([note as Note]);

          return this.notes.value.get((note as Note).id);
        })
        .with({ __typename: 'Issue' }, (issue) => {
          this.issues.load([issue as unknown as Issue]);

          return this.issues.value.get((issue as unknown as Issue).id);
        })
        .with({ __typename: 'Action' }, (action) => {
          this.actions.load([action as Action]);

          return this.actions.value.get((action as Action).id);
        })
        .with({ __typename: 'Meeting' }, (meeting) => {
          this.meetings.load([meeting as Meeting]);

          return this.meetings.value.get((meeting as Meeting).id);
        })
        .with({ __typename: 'PageView' }, (pageView) => {
          this.pageViews.load([pageView as PageView]);

          return this.pageViews.value.get((pageView as PageView).id);
        })
        .with({ __typename: 'LogEntry' }, (logEntry) => {
          this.logEntries.load([logEntry as unknown as LogEntry]);

          return this.logEntries.value.get(
            (logEntry as unknown as LogEntry).id,
          );
        })
        .with({ __typename: 'InteractionEvent' }, (interactionEvent) => {
          this.interactionEvents.load([
            interactionEvent as unknown as InteractionEvent,
          ]);

          return this.interactionEvents.value.get(
            (interactionEvent as unknown as InteractionEvent).id,
          );
        })
        .with({ __typename: 'MarkdownEvent' }, (markdownEvent) => {
          this.markdownEvents.load([
            markdownEvent as unknown as MarkdownEventType,
          ]);

          return this.markdownEvents.value.get(
            (markdownEvent as unknown as MarkdownEventType)
              .markdownEventMetadata.id,
          );
        })
        .with({ __typename: 'InteractionSession' }, (interactionSession) => {
          this.interactionSessions.load([
            interactionSession as InteractionSession,
          ]);

          return this.interactionSessions.value.get(
            (interactionSession as InteractionSession).id,
          );
        })
        .otherwise(() => {});
    });
  }
}
