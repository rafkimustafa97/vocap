import { UserLearningSettings, PaceType } from '../types';

/**
 * Calculates total weekdays (Mon-Fri) between two dates
 */
export function countWeekdaysBetween(startDateStr: string, endDateStr: string): number {
  const start = new Date(startDateStr);
  const end = new Date(endDateStr);
  if (isNaN(start.getTime()) || isNaN(end.getTime()) || start > end) return 0;

  let count = 0;
  const current = new Date(start);
  while (current <= end) {
    const day = current.getDay(); // 0 is Sun, 6 is Sat
    if (day !== 0 && day !== 6) {
      count++;
    }
    current.setDate(current.getDate() + 1);
  }
  return count;
}

/**
 * Calculates estimated completion date for 3655 words based on pace
 */
export function calculateCompletionDate(startDateStr: string, pace: PaceType): {
  totalStudyDays: number;
  totalWeeks: number;
  completionDate: string;
  formattedCompletionDate: string;
} {
  const totalWords = 3655;
  const totalStudyDays = Math.ceil(totalWords / pace);
  const totalWeeks = Math.ceil(totalStudyDays / 5);

  const start = new Date(startDateStr);
  let addedDays = 0;
  const current = new Date(start);

  while (addedDays < totalStudyDays) {
    const day = current.getDay();
    if (day !== 0 && day !== 6) {
      addedDays++;
    }
    if (addedDays < totalStudyDays) {
      current.setDate(current.getDate() + 1);
    }
  }

  const completionDateStr = current.toISOString().split('T')[0];
  const formattedCompletionDate = current.toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  return {
    totalStudyDays,
    totalWeeks,
    completionDate: completionDateStr,
    formattedCompletionDate,
  };
}

/**
 * Gets day type: 'study' (Mon-Fri) | 'review' (Sat) | 'rest' (Sun)
 */
export function getDayType(date: Date = new Date()): 'study' | 'review' | 'rest' {
  const day = date.getDay();
  if (day === 6) return 'review';
  if (day === 0) return 'rest';
  return 'study';
}

/**
 * Get current word range for today based on user settings and actual studied count.
 * Seamlessly calculates next batch continuing from actual studied words.
 */
export function getDailyWordRange(
  settings: UserLearningSettings,
  currentDateStr: string = new Date().toISOString().split('T')[0],
  actualStudiedCount?: number
): {
  startNo: number;
  endNo: number;
  dayType: 'study' | 'review' | 'rest';
  weekIndex: number;
  dayCount: number;
  totalWordsToday: number;
} {
  const today = new Date(currentDateStr);
  const dayType = getDayType(today);

  const weekdaysElapsed = settings.startDate ? countWeekdaysBetween(settings.startDate, currentDateStr) : 1;
  const dayCount = Math.max(1, weekdaysElapsed);
  const weekIndex = Math.ceil(dayCount / 5);

  if (dayType === 'rest') {
    return {
      startNo: 0,
      endNo: 0,
      dayType: 'rest',
      weekIndex,
      dayCount,
      totalWordsToday: 0,
    };
  }

  if (dayType === 'review') {
    const maxNumberStudied = actualStudiedCount !== undefined
      ? Math.max(30, actualStudiedCount)
      : Math.min(3655, weekIndex * 5 * settings.pace);

    return {
      startNo: 1,
      endNo: maxNumberStudied,
      dayType: 'review',
      weekIndex,
      dayCount,
      totalWordsToday: maxNumberStudied,
    };
  }

  // DYNAMIC CONTINUATION LOGIC
  let startNo: number;
  let endNo: number;

  if (actualStudiedCount !== undefined && actualStudiedCount > 0) {
    startNo = Math.min(3655, actualStudiedCount + 1);
    endNo = Math.min(3655, actualStudiedCount + settings.pace);
  } else {
    endNo = Math.min(3655, dayCount * settings.pace);
    startNo = Math.max(1, endNo - settings.pace + 1);
  }

  return {
    startNo,
    endNo,
    dayType: 'study',
    weekIndex,
    dayCount,
    totalWordsToday: Math.max(1, endNo - startNo + 1),
  };
}
