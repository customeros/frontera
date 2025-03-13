import { Tracer } from '@infra/tracer';
import { action, observable } from 'mobx';
import { Task } from '@store/Tasks/Task.dto';
import { TasksService } from '@domain/services/task/tasks.service';

export class EditTaskUsecase {
  private tasksService = new TasksService();
  @observable accessor searchTerm: string = '';

  constructor(private readonly task: Task) {
    this.setSearchTerm = this.setSearchTerm.bind(this);
  }

  @action
  setSearchTerm(searchTerm: string) {
    this.searchTerm = searchTerm;
  }

  @action
  setProperty(property: keyof Task['value'], value: string | number) {
    const span = Tracer.span('EditTaskUsecase.setProperty', {
      property,
      value: this.task.value[property],
    });

    this.task.draft();

    if (Array.isArray(this.task.value[property])) {
      this.task.value[property][0] = value;
    } else {
      this.task.value[property] = value;
    }
    this.task.commit({ syncOnly: true });
    span.end();
  }

  async execute() {
    await this.tasksService.updateTask(this.task.id, this.task.value);
  }

  @action
  removeOpportunity(opportunityId: string) {
    const span = Tracer.span('EditTaskUsecase.removeOpportunity', {
      opportunityId,
    });

    this.task.value.opportunityIds = this.task.value.opportunityIds.filter(
      (id) => id !== opportunityId,
    );
    span.end();

    const opportunity =
      this.task.store.root.opportunities.value.get(opportunityId);

    if (opportunity) {
      opportunity.value.taskIds = opportunity.value.taskIds.filter(
        (id) => id !== this.task.id,
      );
    }
    this.execute();
  }

  async init() {}
}
