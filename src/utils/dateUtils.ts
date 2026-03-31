
import { 
  format, 
  startOfMonth, 
  endOfMonth, 
  startOfWeek, 
  endOfWeek, 
  eachDayOfInterval, 
  isSameMonth, 
  isSameDay, 
  addMonths, 
  subMonths,
  addDays,
  startOfDay,
  endOfDay,
  isToday,
  parseISO
} from 'date-fns';

export { 
  format, 
  isSameMonth, 
  isSameDay, 
  addMonths, 
  subMonths, 
  addDays,
  isToday,
  parseISO,
  startOfDay,
  endOfDay
};

export const getMonthDays = (date: Date) => {
  const start = startOfWeek(startOfMonth(date));
  const end = endOfWeek(endOfMonth(date));
  return eachDayOfInterval({ start, end });
};

export const getWeekDays = (date: Date) => {
  const start = startOfWeek(date);
  const end = endOfWeek(date);
  return eachDayOfInterval({ start, end });
};

export const getTimeSlots = () => {
  const slots = [];
  for (let i = 0; i < 24; i++) {
    slots.push(`${i.toString().padStart(2, '0')}:00`);
  }
  return slots;
};
