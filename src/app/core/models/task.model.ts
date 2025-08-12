export interface Task {
  id?: string;
  name: string;
  description: string;
  created_at: string; // formato YYYY-MM-DD
  dead_line: string;  // formato YYYY-MM-DD
  status: TaskStatus;
  is_alive: boolean;
  created_by: string;
}

export type TaskStatus = 'InProgress' | 'Revision' | 'Completed' | 'Paused' | 'Incomplete';

export interface TaskResponse {
  statusCode: number;
  intData: {
    message: string;
    data: Task | Task[] | null;
  };
}

export interface TaskProxyResponse {
  proxied_response: TaskResponse;
}

export interface TaskCreateRequest {
  name: string;
  description: string;
  created_at: string;
  dead_line: string;
  status: TaskStatus;
  is_alive: boolean;
  created_by: string;
}

export const TASK_STATUSES: TaskStatus[] = ['InProgress', 'Revision', 'Completed', 'Paused', 'Incomplete'];

export const TASK_STATUS_LABELS: Record<TaskStatus, string> = {
  'InProgress': 'En progreso',
  'Revision': 'En revisión',
  'Completed': 'Completada',
  'Paused': 'En pausa',
  'Incomplete': 'Incompleta'
};

export const TASK_STATUS_COLORS: Record<TaskStatus, string> = {
  'InProgress': 'info',
  'Revision': 'warning',
  'Completed': 'success',
  'Paused': 'secondary',
  'Incomplete': 'danger'
};