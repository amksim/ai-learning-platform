"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

export interface Review {
  id: string;
  name: string;
  email: string;
  text: string;
  rating: number;
  date: string;
}

interface ReviewsContextType {
  reviews: Review[];
  addReview: (review: Omit<Review, "id" | "date">) => void;
  hasUserReviewed: (email: string) => boolean;
}

const ReviewsContext = createContext<ReviewsContextType | undefined>(undefined);

// Начальные отзывы (примеры)
const defaultReviews: Review[] = [
  {
    id: "1",
    name: "Алексей М.",
    email: "example1@test.com",
    text: "За 3 месяца я создал свой первый коммерческий сайт с платёжной системой. AI-помощник объяснял каждый шаг понятно и просто!",
    rating: 5,
    date: new Date("2024-10-15").toISOString(),
  },
  {
    id: "2",
    name: "Мария С.",
    email: "example2@test.com",
    text: "Прошла все 16 уровней! Теперь делаю приложения на React Native. Курс действительно работает, рекомендую!",
    rating: 5,
    date: new Date("2024-10-20").toISOString(),
  },
  {
    id: "3",
    name: "Дмитрий К.",
    email: "example3@test.com",
    text: "Создал свою первую игру и опубликовал в Steam! Никогда не думал, что программирование может быть таким доступным. Спасибо!",
    rating: 5,
    date: new Date("2024-10-25").toISOString(),
  },
];

export function ReviewsProvider({ children }: { children: React.ReactNode }) {
  const [reviews, setReviews] = useState<Review[]>(defaultReviews);

  useEffect(() => {
    // Загрузка отзывов из localStorage
    const savedReviews = localStorage.getItem("reviews");
    if (savedReviews) {
      try {
        const parsed = JSON.parse(savedReviews);
        setReviews([...defaultReviews, ...parsed]);
      } catch (e) {
        console.error("Failed to parse reviews", e);
      }
    }
  }, []);

  const addReview = (review: Omit<Review, "id" | "date">) => {
    const newReview: Review = {
      ...review,
      id: Date.now().toString(),
      date: new Date().toISOString(),
    };

    const userReviews = reviews.filter((r) => !defaultReviews.find((d) => d.id === r.id));
    const updatedUserReviews = [newReview, ...userReviews];
    
    setReviews([...defaultReviews, ...updatedUserReviews]);
    localStorage.setItem("reviews", JSON.stringify(updatedUserReviews));
  };

  const hasUserReviewed = (email: string) => {
    return reviews.some((r) => r.email === email);
  };

  return (
    <ReviewsContext.Provider value={{ reviews, addReview, hasUserReviewed }}>
      {children}
    </ReviewsContext.Provider>
  );
}

export function useReviews() {
  const context = useContext(ReviewsContext);
  if (!context) {
    throw new Error("useReviews must be used within ReviewsProvider");
  }
  return context;
}
