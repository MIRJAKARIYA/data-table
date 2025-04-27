import moment from 'moment';

// Helper to get a random integer in [min, max]
const randInt = (min, max) =>
  Math.floor(Math.random() * (max - min + 1)) + min;

// Generate a random date string between two JS Dates
const generateRandomDate = (start, end) => {
  const date = new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
  return moment(date).format('MM-DD-YYYY');
};

// Generate a random time (h:mm A)
const generateRandomTimeString = () => {
  const hour = randInt(1, 12);
  const minute = randInt(0, 59);
  const period = Math.random() < 0.5 ? 'AM' : 'PM';
  return `${hour}:${String(minute).padStart(2, '0')} ${period}`;
};

const generateRandomEmployeeName = () => {
  const first = ['John','Jane','Alice','Bob','Charlie','Diana'];
  const last  = ['Doe','Smith','Johnson','Williams','Brown','Jones'];
  return `${first[randInt(0, first.length-1)]} ${last[randInt(0, last.length-1)]}`;
};

const generateRandomPropertyName = () => {
  const props = ['Property A','Property B','Property C','Property D','Property E'];
  return props[randInt(0, props.length-1)];
};




export const generateDummyData = (count) => {
  const data = [];
  const startDate = new Date(2023,0,1);    // Jan 1, 2023
  const endDate   = new Date(2025,11,31);  // Dec 31, 2025

  for (let i = 0; i < count; i++) {
    const dateStr = generateRandomDate(startDate, endDate);
    // build a moment for check-in
    const checkInStr = generateRandomTimeString();
    const checkIn = moment(`${dateStr} ${checkInStr}`, 'MM-DD-YYYY h:mm A');

    // pick a random work-duration between 1 minute and 8 hours (in sec)
    const workedSecs = randInt(60, 8 * 3600);

    // derive check-out
    const checkOut = checkIn.clone().add(workedSecs, 'seconds');

    // format for output
    const checkOutStr = checkOut.format('h:mm A');
    const workedMins = Math.floor(workedSecs / 60);
    const workedRemSecs = workedSecs % 60;
    const timeWorkedLabel = `${workedMins} min ${workedRemSecs} sec`;

    const noOfUnits = randInt(1, 50);
    const avgSecPerUnit = (workedSecs / noOfUnits).toFixed(2);

    data.push({
      employeeName: generateRandomEmployeeName(),
      date: dateStr,
      propertyName: generateRandomPropertyName(),
      checkIn: checkInStr,
      checkOut: checkOutStr,
      timeWorked: timeWorkedLabel,
      noOfUnits,
      avgSecPerUnit
    });
  }

  return data;
};



