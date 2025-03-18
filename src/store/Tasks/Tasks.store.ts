import { Store } from '@store/_store';
import { RootStore } from '@store/root';
import { Transport } from '@infra/transport';
import { observable, runInAction } from 'mobx';
import { TaskDatum, TaskRepository } from '@infra/repositories/core/task';

import { Task } from './Task.dto';
import { TeamViews } from './__views__/Team.view';
import { TasksView } from './__views__/Tasks.view';
import { CustomView } from './__views__/Custom.view';
export class Tasks extends Store<TaskDatum, Task> {
  private chunkSize = 500;
  private repository = TaskRepository.getInstance();
  @observable accessor cursors: Map<string, number> = new Map();
  @observable accessor availableCounts: Map<string, number> = new Map();

  constructor(public root: RootStore, public transport: Transport) {
    super(root, transport, {
      name: 'Tasks',
      factory: Task,
      getId: (datum) => datum.id,
    });

    new TasksView(this);
    new CustomView(this);
    new TeamViews(this);
  }

  async search(preset: string) {
    const viewDef = this.root.tableViewDefs.getById(preset);
    const cursor = (
      this.cursors.has(preset)
        ? this.cursors.get(preset)
        : this.cursors.set(preset, 0).get(preset)
    ) as number;

    if (!viewDef) {
      console.error(`viewDef with preset=${preset} not found`);

      return;
    }

    try {
      runInAction(() => {
        if (cursor > 0) {
          // reset chunk if new search is performed
          this.cursors.set(preset, 0);
        }
        this.isLoading = true;
      });

      const payload = viewDef.toSearchPayload();

      const { tasks_Search: searchResult } = await this.repository.searchTasks({
        ...payload,
      });

      if (cursor === 0) {
        const ids = (searchResult?.tasks ?? []).slice(
          this.chunkSize * cursor,
          this.chunkSize * cursor + this.chunkSize,
        );

        // retrieve first chunk of data after new search is performed
        await this.retrieve(ids);
      }

      runInAction(() => {
        this.isLoading = false;
        this.availableCounts.set(preset, searchResult?.totalElements);
        this.totalElements = searchResult?.totalAvailable ?? 0;
        this.searchResults.set(preset, searchResult?.tasks ?? []);
        this.version++;
      });
    } catch (err) {
      runInAction(() => {
        this.error = (err as Error)?.message;
      });
    }
  }

  async retrieve(ids: string[]) {
    if (ids.length === 0) return;
    const invalidIds = ids.filter((id) => id.length !== 36);

    if (invalidIds.length > 0) return;

    try {
      const { tasks } = await this.repository.retrieveTasks({
        ids,
      });

      runInAction(() => {
        tasks.forEach((raw) => {
          const foundRecord = this.value.get(raw.id);

          if (foundRecord) {
            Object.assign(foundRecord.value, raw);
          } else {
            const record = new Task(this, raw);

            this.value.set(record.id, record);
          }
        });

        this.size = this.value.size;
        this.version++;
      });
    } catch (err) {
      runInAction(() => {
        this.error = (err as Error)?.message;
      });
    }
  }

  async createTask() {
    try {
      const { task_Save } = await this.repository.saveTask({
        input: {
          subject: 'Unnamed task: In need of a name',
        },
      });

      runInAction(() => {
        const recordId = task_Save.id;

        this.value.set(
          recordId,
          new Task(this, {
            ...task_Save,
            opportunityIds: [],
          }),
        );
        this.version++;
        this.totalElements++;
        this.sync({
          action: 'APPEND',
          ids: [recordId],
        });
      });

      return task_Save.id;
    } catch (err) {
      this.root.ui.toastError('Failed to create task', 'create-task-failure');
    } finally {
      this.root.ui.toastSuccess('Task created', 'create-task-success');
    }
    this.refreshCurrentView();
  }

  async archive(ids: string[]) {
    if (ids.length === 0) return;

    ids.forEach((id) => {
      this.getById(id)?.value.opportunityIds.forEach((opportunityId) => {
        const opportunity = this.root.opportunities.value.get(opportunityId);

        if (opportunity) {
          opportunity.value.taskIds = [];
        }
      });

      this.value.delete(id);
    });

    try {
      await this.repository.archiveTasks({ ids });

      runInAction(() => {
        this.sync({ action: 'DELETE', ids });

        this.root.ui.toastSuccess(
          `Archived ${ids.length} ${ids.length === 1 ? 'task' : 'tasks'}`,
          crypto.randomUUID(),
        );
      });
    } catch (err) {
      runInAction(() => {
        this.error = (err as Error)?.message;
        this.root.ui.toastError(
          `Failed to archive ${ids.length === 1 ? 'task' : 'tasks'}`,
          crypto.randomUUID(),
        );
      });
    } finally {
      runInAction(() => {
        this.isLoading = false;
      });
    }
    this.refreshCurrentView();
  }

  private refreshCurrentView() {
    const currentPreset = new URLSearchParams(window.location.search).get(
      'preset',
    );

    if (currentPreset) {
      this.search(currentPreset);
    }
  }
}
