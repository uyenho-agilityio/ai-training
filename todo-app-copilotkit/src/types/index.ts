export interface Todo {
  id: string;
  taskNumber: number;
  text: string;
  isCompleted: boolean;
  assignedTo?: string;
}
