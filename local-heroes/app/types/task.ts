// Task-related types and interfaces
export interface Task {
  _id: string;
  title: string;
  description: string;
  status: 'open' | 'in_progress' | 'completed' | 'cancelled';
  postedBy: {
    _id: string;
    id: string;
    username?: string;
    email: string;
    firstName: string;
    lastName: string;
    skills?: string[];
  };
  acceptedBy?: {
    _id: string;
    id: string;
    username?: string;
    email: string;
    firstName: string;
    lastName: string;
    skills?: string[];
  } | null;
  location?: {
    address?: string;
    point?: {
      type: 'Point';
      coordinates: [number, number];
    };
  };
  price: number;
  dueDate?: string;
  category?: string;
  tags?: string[];
  experienceLevel?: string;
  createdAt: string;
  updatedAt: string;
  applicants?: any[];
  views?: number;
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
  sortBy?: string;
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
  location?: {
    address?: string;
    coordinates?: [number, number];
  };
  price: number;
  dueDate?: string;
  category?: string;
  tags?: string[];
  experienceLevel?: string;
}

export interface UpdateTaskData {
  title?: string;
  description?: string;
  location?: {
    address?: string;
    coordinates?: [number, number];
  };
  price?: number;
  dueDate?: string;
  category?: string;
  tags?: string[];
  experienceLevel?: string;
}
