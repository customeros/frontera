import { TasksQuery } from './queries/tasks.generated';

export type TaskDatum = TasksQuery['tasks'][number];
