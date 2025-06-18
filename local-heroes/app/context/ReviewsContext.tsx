import React, { createContext, useContext, useState } from 'react';

export type Review = {
  id: string;
  userName: string;
  userImage: string;
  rating: number;
  comment: string;
  date: string;
};

type ReviewsContextType = {
  reviews: Review[];
  addReview: (review: Omit<Review, 'id' | 'userImage' | 'date'>) => void;
};

const ReviewsContext = createContext<ReviewsContextType | undefined>(undefined);

// Initial reviews data
const initialReviews: Review[] = [
  {
    id: '1',
    userName: 'John Doe',
    userImage: 'https://randomuser.me/api/portraits/men/1.jpg',
    rating: 5,
    comment: 'Excellent work! Very professional and completed the job quickly.',
    date: '2024-02-15',
  },
  {
    id: '2',
    userName: 'Sarah Smith',
    userImage: 'https://randomuser.me/api/portraits/women/1.jpg',
    rating: 4,
    comment: 'Great communication and service. Would recommend!',
    date: '2024-02-10',
  },
  {
    id: '3',
    userName: 'Mike Johnson',
    userImage: 'https://randomuser.me/api/portraits/men/2.jpg',
    rating: 5,
    comment: 'Did an amazing job with my garden. Very knowledgeable and professional.',
    date: '2024-02-08',
  },
  {
    id: '4',
    userName: 'Emily Brown',
    userImage: 'https://randomuser.me/api/portraits/women/2.jpg',
    rating: 4,
    comment: 'Very reliable and thorough. Will definitely hire again!',
    date: '2024-02-05',
  },
];

export function ReviewsProvider({ children }: { children: React.ReactNode }) {
  const [reviews, setReviews] = useState<Review[]>(initialReviews);

  const addReview = (newReview: Omit<Review, 'id' | 'userImage' | 'date'>) => {
    const review: Review = {
      ...newReview,
      id: (reviews.length + 1).toString(),
      userImage: `https://randomuser.me/api/portraits/${Math.random() > 0.5 ? 'men' : 'women'}/${
        Math.floor(Math.random() * 10) + 1
      }.jpg`,
      date: new Date().toISOString().split('T')[0],
    };

    setReviews((prevReviews) => [review, ...prevReviews]);
  };

  return (
    <ReviewsContext.Provider value={{ reviews, addReview }}>
      {children}
    </ReviewsContext.Provider>
  );
}

export function useReviews() {
  const context = useContext(ReviewsContext);
  if (context === undefined) {
    throw new Error('useReviews must be used within a ReviewsProvider');
  }
  return context;
} 