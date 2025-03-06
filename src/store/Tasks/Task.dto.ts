import merge from 'lodash/merge';
import { Entity } from '@store/record';
import { computed, observable } from 'mobx';
import { TaskDatum } from '@infra/repositories/task';

import { TaskStatus } from '@graphql/types';

import { Tasks } from './Tasks.store';

export class Task extends Entity<TaskDatum> {
  @observable accessor value: TaskDatum = Task.default();

  constructor(store: Tasks, datum: TaskDatum) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    super(store as any, datum);
  }

  @computed
  get firstAssignee() {
    const id = this.value.assignees[0];

    if (!id) return null;

    return this.store.root.users.getById(id);
  }

  static default(payload?: Partial<TaskDatum>): TaskDatum {
    return merge(
      {
        id: crypto.randomUUID(),
        assignees: [],
        authorId: '',
        status: TaskStatus.Todo,
        opportunityIds: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        __typename: 'Task',
      },
      payload,
    );
  }
}
