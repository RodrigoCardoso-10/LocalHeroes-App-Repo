import React, { createContext, useContext, useState } from 'react';

export type Review = {
  id: string;
  userName: string;
  userImage: string;
  rating: number;
  comment: string;
  date: string;
  reviewedUserId: string;
};

type ReviewsContextType = {
  reviews: Review[];
  addReview: (review: Omit<Review, 'id' | 'userImage' | 'date'>) => void;
};

const ReviewsContext = createContext<ReviewsContextType | undefined>(undefined);

// Initial reviews data - starting with an empty array
const initialReviews: Review[] = [];

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