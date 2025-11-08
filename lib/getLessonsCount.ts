// Get total lessons count from localStorage
export function getTotalLessonsCount(): number {
  if (typeof window === 'undefined') return 100; // Server-side default
  
  const savedLevels = localStorage.getItem("courseLevels");
  if (savedLevels) {
    try {
      const levels = JSON.parse(savedLevels);
      return levels.length || 100;
    } catch (e) {
      console.error("Failed to parse levels", e);
    }
  }
  return 100; // Default if no lessons in localStorage
}
