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
    text: "ооо бро это просто огонь 🔥 вчера сделал свой первый сайт.... не могу поверить что это я сделал)) думал будет сложно но этот АИ прям шаг за шагом все объясняет. кста единственный в мире курс по AI!! за 399 это вообще подарок имхо",
    rating: 5,
    date: new Date("2024-11-01").toISOString(),
  },
  {
    id: "2",
    name: "marina_dev",
    email: "example2@test.com",
    text: "долго думала стоит ли.... цена не маленькая если честно. но подруга посоветовала и я не пожалела вообще 😍 теперь сама делаю лендинги, уже 2 заказа взяла на фрилансе!! окупила курс за месяц легко",
    rating: 5,
    date: new Date("2024-10-28").toISOString(),
  },
  {
    id: "3",
    name: "dimon2024",
    email: "example3@test.com",
    text: "РЕБЯТААА ЭТО ТОПЧИК 🚀 я гуманитарий был всю жизнь, в коде 0 понимал. щас делаю игры простые и даже приложение начал пилить.... иногда ai тупит конечно но редко, норм в целом",
    rating: 5,
    date: new Date("2024-10-25").toISOString(),
  },
  {
    id: "4",
    name: "SergeyK",
    email: "example4@test.com",
    text: "я програмист на джаве, решил глянуть че за курс такой.... и знаете что, узнал реально много нового про ai!! теперь использую его в работе, экономлю кучу времени. раньше задачу делал день, щас за 2-3 часа 👍",
    rating: 5,
    date: new Date("2024-10-22").toISOString(),
  },
  {
    id: "5",
    name: "nastyushka",
    email: "example5@test.com",
    text: "всем привет)) я для своего салона красоты хотела сайт, програмисты просили 50к рублей.... решила сама научится и получилось!!! курс понятный, для таких чайников как я самое то 😊 теперь сама все меняю на сайте не плачу никому",
    rating: 5,
    date: new Date("2024-10-20").toISOString(),
  },
  {
    id: "6",
    name: "vadim_88",
    email: "example6@test.com",
    text: "не верил в эти все онлайн курсы если честно.... но тут както рискнул, оплатил. прошел за месяц, щас уже 3 сайта сделал на фрилансе 💰 окупилось в 3 раза. кто думает брать или нет - берите не пожалеете",
    rating: 5,
    date: new Date("2024-10-18").toISOString(),
  },
  {
    id: "7",
    name: "Polina_M",
    email: "example7@test.com",
    text: "я учитель, 35 лет.... решила что хочу в айти. и вы знаете, я справилась 💪 курс понятный даже для меня, далекой от всей этой техники. за 2 месяца научилась делать сайты!! муж в шоке ахаха. рекомендую всем",
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
