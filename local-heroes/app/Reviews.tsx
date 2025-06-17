import React, { useState } from 'react';

type Review = {
  id: number;
  name: string;
  title: string;
  experience: string;
  rating: number;
};

const initialReviews: Review[] = [
  {
    id: 1,
    name: 'Jane Doe',
    title: 'Helped me land my first job!',
    experience: 'The app made it easy to browse and apply to jobs. Notifications were super helpful.',
    rating: 5,
  },
  {
    id: 2,
    name: 'Sam Lee',
    title: 'Good, but could improve search filters',
    experience: 'I found several listings, but filtering by salary range would be great.',
    rating: 4,
  },
];

const ReviewsPage: React.FC = () => {
  const [reviews, setReviews] = useState<Review[]>(initialReviews);
  const [name, setName] = useState('');
  const [title, setTitle] = useState('');
  const [experience, setExperience] = useState('');
  const [rating, setRating] = useState(5);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !title || !experience) return;
    const newReview: Review = {
      id: Date.now(),
      name,
      title,
      experience,
      rating,
    };
    setReviews([newReview, ...reviews]);
    setName('');
    setTitle('');
    setExperience('');
    setRating(5);
  };

  return (
    <div style={{ maxWidth: 600, margin: '0 auto', padding: 24 }}>
      <h1>Review the Job Listings App</h1>
      <form onSubmit={handleSubmit} style={{ marginBottom: 32 }}>
        <div>
          <label>
            Your Name:
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              required
              style={{ marginLeft: 8 }}
            />
          </label>
        </div>
        <div>
          <label>
            Review Title:
            <input
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value)}
              required
              style={{ marginLeft: 8 }}
            />
          </label>
        </div>
        <div>
          <label>
            Your Experience (e.g., job search, applying, notifications):
            <textarea
              value={experience}
              onChange={e => setExperience(e.target.value)}
              required
              style={{ marginLeft: 8, verticalAlign: 'top', width: '100%', minHeight: 60 }}
            />
          </label>
        </div>
        <div>
          <label>
            App Usefulness Rating:
            <select
              value={rating}
              onChange={e => setRating(Number(e.target.value))}
              style={{ marginLeft: 8 }}
            >
              {[5, 4, 3, 2, 1].map(star => (
                <option key={star} value={star}>
                  {star} - {star === 5 ? 'Excellent' : star === 1 ? 'Poor' : ''}
                </option>
              ))}
            </select>
          </label>
        </div>
        <button type="submit" style={{ marginTop: 12 }}>
          Submit Review
        </button>
      </form>
      <ul style={{ listStyle: 'none', padding: 0 }}>
        {reviews.map(review => (
          <li key={review.id} style={{ marginBottom: 24, borderBottom: '1px solid #ccc', paddingBottom: 12 }}>
            <strong>{review.title}</strong> by {review.name} ({review.rating} / 5)
            <p>{review.experience}</p>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ReviewsPage;
