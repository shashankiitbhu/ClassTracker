import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardContent } from './ui/card';
import { CheckCircleIcon } from '@heroicons/react/solid';
import { getDatabase, ref, onValue, update } from "firebase/database";
import { db } from '../firebase';

const Timetable = () => {
  const days = ['Time', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
  const times = [
    '9:00-10:00',
    '10:00-11:00',
    '11:00-11:30',
    '11:30-1:00',
    '1:00-1:30',
    '1:30-2:30',
    '2:30-3:30',
    '3:30-4:30',
    '4:30-5:30'
  ];

  const courseColors = {
    'OE': 'bg-blue-100 text-blue-800 border-blue-200',
    'PH-322': 'bg-green-100 text-green-800 border-green-200',
    'PH-312': 'bg-purple-100 text-purple-800 border-purple-200',
    'PH-321': 'bg-orange-100 text-orange-800 border-orange-200',
    'PH-321 B-1': 'bg-yellow-100 text-yellow-800 border-yellow-200',
    'PH-321 B-2': 'bg-amber-100 text-amber-800 border-amber-200',
    'Labs': 'bg-red-100 text-red-800 border-red-200',
    'Break': 'bg-pink-100 text-pink-800 border-pink-200',
    'DSA': 'bg-teal-100 text-teal-800 border-teal-200',
    'Lunch': 'bg-gray-100 text-gray-800 border-gray-200',
    'Reading Room': 'bg-cyan-100 text-cyan-800 border-cyan-200',
    'Done': 'bg-gray-300 text-gray-700 border-gray-400'
  };

  const initialSchedule = {
    'Monday': {
      '9:00-10:00': 'OE',
      '10:00-11:00': 'PH-322',
      '11:00-11:30': 'Break',
      '11:30-1:00': 'DSA',
      '1:00-1:30': 'Lunch',
      '1:30-2:30': 'PH-312'
    },
    'Tuesday': {
      '9:00-1:00': 'Reading Room',
      '1:00-1:30': 'Lunch',
      '2:30-3:30': 'PH-321 B-1',
      '3:30-4:30': 'Labs',
      '4:30-5:30': 'Labs'
    },
    'Wednesday': {
      '9:00-10:00': 'OE',
      '10:00-11:00': 'PH-322',
      '11:00-11:30': 'Break',
      '1:00-1:30': 'Lunch',
      '1:30-2:30': 'PH-312',
      '2:30-3:30': 'PH-321 B-2',
      '3:30-4:30': 'Labs',
      '4:30-5:30': 'Labs'
    },
    'Thursday': {
      '9:00-1:00': 'Reading Room',
      '1:00-1:30': 'Lunch',
      '3:30-4:30': 'PH-321'
    },
    'Friday': {
      '9:00-10:00': 'OE',
      '10:00-11:00': 'PH-322',
      '11:00-11:30': 'Break',
      '11:30-1:00': 'DSA',
      '1:00-1:30': 'Lunch',
      '1:30-2:30': 'PH-312'
    }
  };

  const [schedule, setSchedule] = useState(initialSchedule);
  const [counts, setCounts] = useState({});
  const [currentDate, setCurrentDate] = useState(new Date());

  useEffect(() => {
    const scheduleRef = ref(db, "schedule");
    onValue(scheduleRef, (snapshot) => {
      const fetchedData = snapshot.val() || {};
      const mergedSchedule = Object.keys(initialSchedule).reduce((acc, day) => {
        acc[day] = { ...initialSchedule[day], ...(fetchedData[day] || {}) };
        return acc;
      }, {});
      setSchedule(mergedSchedule);
    });
  }, []);

  useEffect(() => {
    const countsRef = ref(db, 'attendance');
    onValue(countsRef, (snapshot) => {
      const data = snapshot.val() || {};
      setCounts(data);
    });
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentDate(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const handleClick = (day, time) => {
    const course = schedule[day]?.[time];
    if (!course || course === "Done") return;

    const updates = {
      [`schedule/${day}/${time}`]: "Done",
      [`attendance/${course}/present`]: (counts[course]?.present || 0) + 1,
    };

    update(ref(db), updates)
      .then(() => {
        console.log("Schedule and attendance updated");
        setSchedule((prev) => ({
          ...prev,
          [day]: {
            ...prev[day],
            [time]: "Done", 
          },
        }));
      })
      .catch((error) => console.error("Failed to update:", error));
  };

  const isPast = (day, time) => {
    const now = new Date();
    const dayIndex = days.indexOf(day);
    if (dayIndex === -1) return false;

    const [startHour, startMinute] = time.split('-')[0].split(':').map(Number);
    const blockDate = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate() + (dayIndex - now.getDay()),
      startHour,
      startMinute
    );

    return blockDate < now;
  };

  return (
    <Card className="w-full max-w-6xl">
  <CardHeader className="bg-gray-50 rounded-t-lg">
    <div className="text-center text-xl font-semibold">
      {currentDate.toLocaleDateString()} {currentDate.toLocaleTimeString()}
    </div>
  </CardHeader>
  <CardContent className="p-4">
    <div className="overflow-x-auto">
      <table className="w-full border-collapse">
        <thead>
          <tr>
            {days.map(day => {
              const isToday = day === days[currentDate.getDay()];
              return (
                <th
                  key={day}
                  className={`border p-2 text-center ${
                    isToday ? 'bg-yellow-100 text-black font-bold' : 'bg-gray-800 text-white'
                  }`}
                >
                  {day}
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody>
          {times.map(time => (
            <tr key={time}>
              <td className="border p-2 text-sm font-medium bg-gray-50">
                {time}
              </td>
              {days.slice(1).map(day => {
                const course = schedule[day]?.[time];
                const past = isPast(day, time);

                return (
                  <td
                    key={`${day}-${time}`}
                    className={`border p-1 text-center ${
                      past ? 'cursor-pointer' : 'opacity-50 cursor-not-allowed'
                    }`}
                    {...(past && {
                      onClick: () => handleClick(day, time),
                    })}
                  >
                    {course && (
                      <div
                        className={`${courseColors[course]} p-2 rounded border text-sm font-medium flex items-center justify-center gap-2`}
                      >
                        {course === 'Done' ? (
                          <>
                            <CheckCircleIcon className="h-5 w-5" />
                            <span>Done</span>
                          </>
                        ) : (
                          course
                        )}
                      </div>
                    )}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>


    <div className="mt-4 flex flex-wrap gap-4 justify-center border-t pt-4">
      {Object.keys(courseColors).map(course => (
        <div key={course} className="flex flex-col items-center">
          <span className="text-sm font-medium">{course}</span>
          <span>Present: {counts[course]?.present || 0}</span>
        </div>
      ))}
    </div>
  </CardContent>
</Card>
  );
};

export default Timetable;
