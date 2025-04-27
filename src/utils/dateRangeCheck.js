export function isDateInRange(dateStr, startStr, endStr) {
    const [month, day, year] = dateStr.split('-').map(Number);
    const [startMonth, startDay, startYear] = startStr.split('-').map(Number);
    const [endMonth, endDay, endYear] = endStr.split('-').map(Number);
  
    const date = new Date(year, month - 1, day);
    const startDate = new Date(startYear, startMonth - 1, startDay);
    const endDate = new Date(endYear, endMonth - 1, endDay);
  
    return date >= startDate && date <= endDate;
  }