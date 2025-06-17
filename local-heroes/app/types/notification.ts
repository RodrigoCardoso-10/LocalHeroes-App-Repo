export interface Notification {
  _id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  taskId?: string;
  fromUserId?: string;
  read: boolean;
  metadata?: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

export enum NotificationType {
  JOB_APPLICATION = 'JOB_APPLICATION',
  APPLICATION_ACCEPTED = 'APPLICATION_ACCEPTED',
  APPLICATION_REJECTED = 'APPLICATION_REJECTED',
  JOB_COMPLETED = 'JOB_COMPLETED',
  JOB_CANCELLED = 'JOB_CANCELLED',
}

export interface NotificationsResponse {
  notifications: Notification[];
  total: number;
  unreadCount: number;
}
