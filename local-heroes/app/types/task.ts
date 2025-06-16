// Task-related types and interfaces
export interface Task {
  _id: string;
  title: string;
  description: string;
  status: 'OPEN' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  postedBy: {
    _id: string;
    id: string;
    username?: string;
    email: string;
    firstName: string;
    lastName: string;
  };
  acceptedBy?: {
    _id: string;
    id: string;
    username?: string;
    email: string;
    firstName: string;
    lastName: string;
  } | null;
  location?: string;
  price: number;
  dueDate?: string;
  category?: string;
  tags?: string[];
  experienceLevel?: string;
  createdAt: string;
  updatedAt: string;
}

export interface TaskFilters {
  search?: string;
  location?: string;
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  status?: string;
  datePosted?: string;
  tags?: string[];
  experienceLevel?: string;
  page?: number;
  limit?: number;
}

export interface TasksResponse {
  tasks: Task[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface CreateTaskData {
  title: string;
  description: string;
  location?: string;
  price: number;
  dueDate?: string;
  category?: string;
  tags?: string[];
  experienceLevel?: string;
}

export interface UpdateTaskData {
  title?: string;
  description?: string;
  location?: string;
  price?: number;
  dueDate?: string;
  category?: string;
  tags?: string[];
  experienceLevel?: string;
}
