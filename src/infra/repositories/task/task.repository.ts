import { Transport } from '@infra/transport';

import TasksDocument from './queries/tasks.graphql';
import SaveTaskDocument from './mutations/saveTask.graphql';
import SearchTasksDocument from './queries/searchTasks.graphql';
import ArchiveTaskDocument from './mutations/archiveTask.graphql';
import { ArchiveTaskMutation } from './mutations/archiveTask.generated';
import { TasksQuery, TasksQueryVariables } from './queries/tasks.generated';
import { ArchiveTaskMutationVariables } from './mutations/archiveTask.generated';
import {
  SaveTaskMutation,
  SaveTaskMutationVariables,
} from './mutations/saveTask.generated';
import {
  SearchTasksQuery,
  SearchTasksQueryVariables,
} from './queries/searchTasks.generated';

export class TaskRepository {
  static instance: TaskRepository | null = null;
  private transport = Transport.getInstance();

  public static getInstance() {
    if (!TaskRepository.instance) {
      TaskRepository.instance = new TaskRepository();
    }

    return TaskRepository.instance;
  }

  async saveTask(payload: SaveTaskMutationVariables) {
    return this.transport.graphql.request<
      SaveTaskMutation,
      SaveTaskMutationVariables
    >(SaveTaskDocument, payload);
  }

  async retrieveTasks(payload: TasksQueryVariables) {
    return this.transport.graphql.request<TasksQuery, TasksQueryVariables>(
      TasksDocument,
      payload,
    );
  }

  async searchTasks(payload: SearchTasksQueryVariables) {
    return this.transport.graphql.request<
      SearchTasksQuery,
      SearchTasksQueryVariables
    >(SearchTasksDocument, payload);
  }

  async archiveTasks(payload: ArchiveTaskMutationVariables) {
    return this.transport.graphql.request<
      ArchiveTaskMutation,
      ArchiveTaskMutationVariables
    >(ArchiveTaskDocument, payload);
  }
}
