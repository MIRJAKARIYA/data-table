export function formatDate(dateStr) {
    const date = new Date(dateStr);
    date.setDate(date.getDate()); // Increment the day by 1
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are zero-based
    const day = String(date.getDate()).padStart(2, '0');
    const year = date.getFullYear();
    return `${month}-${day}-${year}`;
  }
  