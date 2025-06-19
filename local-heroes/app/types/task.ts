// Task-related types and interfaces

// Task Status Enum - matching backend TaskStatus
export enum TaskStatus {
  OPEN = 'OPEN',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
  PAID = 'PAID',
}

export interface Task {
  _id: string;
  title: string;
  description: string;
  status: TaskStatus;
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
  location?: string;
  price: number;
  dueDate?: string;
  category?: string;
  tags?: string[];
  experienceLevel?: string;
  createdAt: string;
  updatedAt: string;
  views?: number;
  applicants?: number;
}

export interface User {
  _id: string;
  id: string;
  username?: string;
  firstName: string;
  lastName: string;
  email: string;
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

export interface PopulatedTask extends Task {
  postedBy: User;
  acceptedBy?: User | null;
}
