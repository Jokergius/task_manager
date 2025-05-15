export interface User {
  id: number
  username: string
  email: string
  role: string
}

export interface Project {
  id: number
  name: string
  code: string
  description: string
  created_at: string
  boards?: Board[]
}

export interface Board {
  id: number
  name: string
  project_id: number
  project_name?: string
  created_at: string
  columns?: Column[]
}

export interface Column {
  id: number
  name: string
  order: number
  board_id: number
  created_at: string
  tasks?: Task[]
}

export interface Task {
  id: number
  code: string
  title: string
  description: string
  priority: 'low' | 'medium' | 'high'
  status: string
  column_id: number
  column_name?: string
  estimated_time: number
  remaining_time: number
  spent_time: number
  author_id: number
  author?: string
  assignee_id?: number
  assignee?: string
  created_at: string
  updated_at: string
  started_at?: string
  completed_at?: string
  time_logs?: TimeLog[]
}

export interface TimeLog {
  id: number
  task_id: number
  user_id: number
  username: string
  logged_by_id: number
  logged_by_username: string
  spent_hours: number
  comment?: string
  logged_at: string
}

export interface TimeSummary {
  task_id: number
  task_code: string
  task_title: string
  project_id: number
  project_code: string
  project_name: string
  board_id: number
  board_name: string
  assignee_id?: number
  assignee_name?: string
  total_spent_hours: number
  estimated_hours: number
  remaining_hours: number
}

export interface TimeLogFilter {
  user_id?: number
  logged_by_id?: number
  from_date?: string
  to_date?: string
  sort?: 'asc' | 'desc'
  page?: number
  per_page?: number
}
