export interface User {
  _id: string;
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  emailVerifiedAt?: Date | null;
  phone?: string;
  address?: string;
  bio?: string;
  skills?: string[];
  profilePicture?: string;
  balance?: number;
  createdAt: Date;
  updatedAt: Date;
}
