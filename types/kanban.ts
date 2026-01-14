export type Priority = 'low' | 'medium' | 'high';

export interface Column {
  id: string;
  title: string;
  color: string;
  order_index: number;
}

export interface Task {
  id: string;
  column_id: string;
  title: string;
  description?: string;
  priority: Priority;
  assignee_id?: string;
  client_id?: string;
  due_date?: string;
  delivery_link?: string;
  tags?: string[]; // Array de strings (JSONB no Supabase)
  index_position: number;
  created_at?: string;
  
  // Campos enriquecidos (Joins)
  assignee?: { full_name: string; avatar_url: string };
  client?: { name: string };
}

export interface Subtask {
  id: string;
  task_id: string;
  title: string;
  completed: boolean;
  created_at: string;
}

export interface Profile {
  id: string;
  full_name: string;
  avatar_url: string;
  email: string;
}

export interface TaskComment {
    id: string;
    task_id: string;
    user_id: string;
    content: string;
    created_at: string;
    user?: {
        full_name: string;
        avatar_url: string;
    }
}

export interface ActivityLog {
  id: string;
  task_id: string;
  user_id: string;
  action_type: string; // 'update', 'comment', 'move'
  details: string; // Ex: "Mudou o status para Feito"
  created_at: string;

}
