import {MIN_AGE} from './constants';

export const calculateAge = dateOfBirth => {
  const today = new Date();
  const birthDate = new Date(dateOfBirth);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  if (
    monthDiff < 0 ||
    (monthDiff === 0 && today.getDate() < birthDate.getDate())
  ) {
    age--;
  }
  return age;
};

export const isOver18 = dateOfBirth => {
  return calculateAge(dateOfBirth) >= MIN_AGE;
};

export const formatDate = (date, format = 'short') => {
  const d = new Date(date);
  if (isNaN(d.getTime())) return '';

  const months = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
  ];
  const fullMonths = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
  ];

  const day = d.getDate();
  const month = d.getMonth();
  const year = d.getFullYear();

  switch (format) {
    case 'short':
      return `${months[month]} ${day}, ${year}`;
    case 'long':
      return `${fullMonths[month]} ${day}, ${year}`;
    case 'numeric':
      return `${String(month + 1).padStart(2, '0')}/${String(day).padStart(2, '0')}/${year}`;
    default:
      return `${months[month]} ${day}, ${year}`;
  }
};

export const getRelativeTime = date => {
  const now = new Date();
  const d = new Date(date);
  const diffMs = now - d;
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHr = Math.floor(diffMin / 60);
  const diffDays = Math.floor(diffHr / 24);

  if (diffSec < 60) return 'Just now';
  if (diffMin < 60) return `${diffMin}m ago`;
  if (diffHr < 24) return `${diffHr}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)}w ago`;
  return formatDate(date, 'short');
};

export const getMaxDateForAge = minAge => {
  const date = new Date();
  date.setFullYear(date.getFullYear() - minAge);
  return date;
};

export const getMinDate = () => {
  const date = new Date();
  date.setFullYear(date.getFullYear() - 100);
  return date;
};
