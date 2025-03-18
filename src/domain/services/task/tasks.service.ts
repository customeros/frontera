import { RootStore } from '@store/root';
import { Task } from '@store/Tasks/Task.dto';
import { injectable } from '@infra/container';
import { TaskRepository } from '@infra/repositories/core/task';

import { unwrap } from '@utils/unwrap';

@injectable
export class TasksService {
  private tasksRepo = new TaskRepository();
  private store = RootStore.getInstance();

  public async updateTask(taskId: string, data: Partial<Task>) {
    const [res, err] = await unwrap(
      this.tasksRepo.saveTask({
        input: {
          id: taskId,
          ...data,
        },
      }),
    );

    if (err) {
      console.error(err);

      return;
    }

    if (!res) {
      console.error('No response from update task');

      return;
    }
  }
}
