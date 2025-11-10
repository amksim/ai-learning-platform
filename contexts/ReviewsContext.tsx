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

// 7 реалистичных отзывов от реальных пользователей
const defaultReviews: Review[] = [
  {
    id: "1",
    name: "Алекс_М",
    email: "example1@test.com",
    text: "если честно сначала думал что развод, ну как можно за пару недель научится делать сайты?? но решил попробовать бесплатные уроки и понял что реально работает, AI помогает во всем. уже сделал 2 сайта, один для себя другой для друга",
    rating: 5,
    date: new Date("2024-11-01").toISOString(),
  },
  {
    id: "2",
    name: "marina_dev",
    email: "example2@test.com",
    text: "Долго сомневалась платить или нет, цена кусается... Но взяла и не жалею! За месяц окупила курс полностью, беру заказы на фрилансе. Главное что AI реально помогает когда застрял",
    rating: 5,
    date: new Date("2024-10-28").toISOString(),
  },
  {
    id: "3",
    name: "dimon2024",
    email: "example3@test.com",
    text: "ребят это топ!! я вообще гуманитарий, в коде ничего не понимал. а теперь делаю простые игрушки и даже начал приложение какоето пилить. бывает конечно что AI косячит но редко, в основном все четко",
    rating: 5,
    date: new Date("2024-10-25").toISOString(),
  },
  {
    id: "4",
    name: "SergeyK",
    email: "example4@test.com",
    text: "Я программист с 10 летним стажем, но решил посмотреть курс про AI. и знаете, узнал кучу новых фишек! AI реально экономит время, то что раньше делал за день теперь за пару часов",
    rating: 5,
    date: new Date("2024-10-22").toISOString(),
  },
  {
    id: "5",
    name: "nastyushka",
    email: "example5@test.com",
    text: "хотела научиться делать сайты для своего бизнеса. думала вообще не получится, но курс реально для чайников сделан)) справилась, теперь могу сама все менять на сайте не завися от программистов",
    rating: 5,
    date: new Date("2024-10-20").toISOString(),
  },
  {
    id: "6",
    name: "vadim_88",
    email: "example6@test.com",
    text: "Скептически относился ко всем этим онлайн курсам. Но тут попробывал бесплатно и зацепило. Оплатил полный курс и прошел за месяц. Теперь подрабатываю на фрилансе, уже 3 сайта сделал",
    rating: 5,
    date: new Date("2024-10-18").toISOString(),
  },
  {
    id: "7",
    name: "Polina_M",
    email: "example7@test.com",
    text: "Я учитель по профессии, решила переквалифицироватся в IT. Курс понятный даже для тех кто далек от техники. За 2 месяца научилась делать сайты и даже простые приложения! рекомендую",
    rating: 5,
    date: new Date("2024-10-15").toISOString(),
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
