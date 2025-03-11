import { observable } from 'mobx';
import { TasksService } from '@domain/services/task/tasks.service';
import { OpportunityStore } from '@store/Opportunities/Opportunity.store';

import { Task } from '@shared/types/__generated__/graphql.types';
export class AddTaskToOpportunityUsecase {
  @observable accessor taskName: string = '';
  @observable accessor taskId: string = '';
  @observable accessor taskOptions: Task[] = [];

  private taskService = new TasksService();

  constructor(private opportunity: OpportunityStore) {
    this.setTaskName = this.setTaskName.bind(this);
    this.setTaskId = this.setTaskId.bind(this);
  }

  setTaskName(taskName: string) {
    this.taskName = taskName;
  }

  setTaskId(taskId: string) {
    this.taskId = taskId;
  }

  execute() {
    if (!this.taskId) {
      return;
    }
    const task = this.opportunity.root.tasks.getById(this.taskId)?.value;

    if (!task) {
      return;
    }

    if (task.opportunityIds.length === 0) {
      task.opportunityIds.push(this.opportunity.id);
    } else {
      task.opportunityIds[0] = this.opportunity.id;
    }

    this.opportunity.value.taskIds.push(this.taskId);

    this.taskService.updateTask(this.taskId, task);
  }
}
