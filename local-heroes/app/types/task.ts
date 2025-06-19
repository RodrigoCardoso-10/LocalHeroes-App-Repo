export enum TaskStatus {
  OPEN = 'OPEN',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}

// Task-related types and interfaces
export interface Task {
  _id: string;
  title: string;
  description: string;
  status: TaskStatus;
  postedBy: User;
  acceptedBy?: User | null;
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
  applicants?: User[];
  views?: number;
}

export type PopulatedTask = Task & {
  postedBy: User;
  acceptedBy?: User | null;
  applicants: User[];
};

export interface User {
  _id?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  address?: string;
  skills?: string[];
  bio?: string;
  profilePicture?: string;
  [key: string]: any;
}

export interface Review {
  _id?: string;
  reviewedUserId?: string;
  reviewerUserId?: string;
  reviewerName?: string;
  comment?: string;
  rating?: number;
  createdAt?: string;
  [key: string]: any;
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
