"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";

export default function ReferralCodeHandler() {
  const searchParams = useSearchParams();

  useEffect(() => {
    const ref = searchParams.get("ref");
    if (ref) {
      localStorage.setItem("referral_code", ref);
      console.log("✅ Реферальный код сохранён:", ref);
    }
  }, [searchParams]);

  return null;
}
