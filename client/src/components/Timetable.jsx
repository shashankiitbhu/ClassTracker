import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardContent } from './ui/card';
import { CheckCircleIcon } from '@heroicons/react/solid';
import { getDatabase, ref, onValue, update } from "firebase/database";
import { getAuth } from 'firebase/auth';
import { db } from '../firebase';

const getWeekRange = (weekOffset) => {
  const today = new Date();
  const currentWeekStart = new Date(today);
  currentWeekStart.setDate(today.getDate() + weekOffset * 7 - today.getDay() + 1);
  
  const currentWeekEnd = new Date(currentWeekStart);
  currentWeekEnd.setDate(currentWeekStart.getDate() + 6); 
  
  const formatDate = (date) =>
    `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1)
      .toString()
      .padStart(2, '0')}/${date.getFullYear().toString().slice(-2)}`;
  
  return `${formatDate(currentWeekStart)} - ${formatDate(currentWeekEnd)}`;
};

const Timetable = () => {
  const days = ['Time', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
  const times = [
    '9:00-10:00',
    '10:00-11:00',
    '11:00-12:00',
    '12:00-1:00',
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
    'Labs': 'bg-red-100 text-red-800 border-red-200',
    'Done': 'bg-gray-300 text-gray-700 border-gray-400'
  };

  const initialSchedule = {
    'Monday': {
      '9:00-10:00': 'OE',
      '10:00-11:00': 'PH-322',
      '1:30-2:30': 'PH-312'
    },
    'Tuesday': {
      '3:30-4:30': 'Labs',
      '4:30-5:30': 'Labs'
    },
    'Wednesday': {
      '9:00-10:00': 'OE',
      '10:00-11:00': 'PH-322',
      '1:30-2:30': 'PH-312',
      '2:30-3:30': 'PH-321',
      '3:30-4:30': 'Labs',
      '4:30-5:30': 'Labs'
    },
    'Thursday': {
      '3:30-4:30': 'PH-321'
    },
    'Friday': {
      '9:00-10:00': 'OE',
      '10:00-11:00': 'PH-322',
      '1:30-2:30': 'PH-312'
    }
  };

  const [schedule, setSchedule] = useState(initialSchedule);
  const [counts, setCounts] = useState({});
  const [dynamicCourses, setDynamicCourses] = useState({});
  const [currentDate, setCurrentDate] = useState(new Date());
  const [currentWeekOffset, setCurrentWeekOffset] = useState(0);
  const [user, setUser] = useState(null);
  const auth = getAuth();
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingCell, setEditingCell] = useState({ day: null, time: null });
  const [newCourse, setNewCourse] = useState('');
  const [newCourseName, setNewCourseName] = useState('');

  const saveNewCourseToFirebase = async (courseName, courseColor) => {
    if (!user) return;

    const newCourse = { [courseName]: courseColor };

    try {
      const coursesRef = ref(db, `users/${user.uid}/dynamicCourses`);
      await update(coursesRef, newCourse);
      console.log("New course saved to Firebase");
    } catch (error) {
      console.error("Failed to save course:", error);
    }
  };

  const handleEditCell = (day, time) => {
    if (!isEditMode) return;
    setEditingCell({ day, time });
    setNewCourse(schedule[day]?.[time] || '');
  };

  const handleSaveCourse = async () => {
    if (!editingCell.day || !editingCell.time) return;

    const { day, time } = editingCell;

    const updates = {
      [`users/${user.uid}/weeklySchedules/week${currentWeekOffset}/${day}/${time}`]: newCourse || null,
    };

    try {
      await update(ref(db), updates);
      setSchedule((prev) => ({
        ...prev,
        [day]: {
          ...prev[day],
          [time]: newCourse || null,
        },
      }));
      console.log("Course updated successfully");
      setEditingCell({ day: null, time: null });
      setNewCourse('');
    } catch (error) {
      console.error("Failed to update course:", error);
    }
  };

  const handleRemoveCourse = async () => {
    if (!editingCell.day || !editingCell.time) return;

    const { day, time } = editingCell;

    const updates = {
      [`users/${user.uid}/weeklySchedules/week${currentWeekOffset}/${day}/${time}`]: null,
    };

    try {
      await update(ref(db), updates);
      setSchedule((prev) => {
        const updatedDay = { ...prev[day] };
        delete updatedDay[time];
        return { ...prev, [day]: updatedDay };
      });
      console.log("Course removed successfully");
      setEditingCell({ day: null, time: null });
      setNewCourse('');
    } catch (error) {
      console.error("Failed to remove course:", error);
    }
  };

  const handleCloseModal = () => {
    setEditingCell({ day: null, time: null });
    setNewCourse('');
  };

  const toggleEditMode = () => {
    setIsEditMode((prev) => !prev);
  };

  const handleAddNewCourse = () => {
    if (!newCourseName.trim()) {
      alert("Course name cannot be empty.");
      return;
    }

    const existingStyles = Object.values(courseColors);
    const randomStyle = existingStyles[Math.floor(Math.random() * existingStyles.length)];

    setDynamicCourses((prev) => ({
      ...prev,
      [newCourseName]: randomStyle,
    }));

    saveNewCourseToFirebase(newCourseName, randomStyle);
    setNewCourseName('');
  };

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setUser(user);
      if (user) {
        loadUserData(user.uid);
      } else {
        setSchedule(initialSchedule); // Reset to initial schedule
        setCounts({});
      }
    });
  
    return () => unsubscribe();
  }, []);
  

  const loadUserData = (userId) => {
    const userScheduleRef = ref(db, `users/${userId}/weeklySchedules/week${currentWeekOffset}`);
    
    onValue(userScheduleRef, async (snapshot) => {
      const fetchedData = snapshot.val();
      if (!fetchedData) {
        const defaultSchedulePath = `users/${userId}/weeklySchedules/week${currentWeekOffset}`;
        try {
          await update(ref(db), { [defaultSchedulePath]: initialSchedule });
          console.log("Default schedule initialized for the week");
          setSchedule(initialSchedule);
        } catch (error) {
          console.error("Failed to initialize default schedule:", error);
        }
      } else {
        setSchedule(fetchedData);
      }
    });
  
    const userAttendanceRef = ref(db, `users/${userId}/attendance`);
    onValue(userAttendanceRef, (snapshot) => {
      const data = snapshot.val() || {};
      setCounts(data);
    });
  
    const dynamicCoursesRef = ref(db, `users/${userId}/dynamicCourses`);
    onValue(dynamicCoursesRef, (snapshot) => {
      const data = snapshot.val() || {};
      setDynamicCourses(data);
    });
  };
  
  
  useEffect(() => {
    if (user) {
      loadUserData(user.uid);
    }
  }, [currentWeekOffset, user]);
  
  const handleWeekChange = (offset) => {
    setCurrentWeekOffset((prev) => {
      const newOffset = prev + offset;
      loadUserData(user?.uid, newOffset);
      return newOffset;
    });
  };
  

  const handleClick = async (day, time) => {
    if (!user) {
      console.log("Please sign in to track attendance");
      return;
    }
  
    const course = initialSchedule[day]?.[time];
    if (!course) return;
  
    const isDone = schedule[day]?.[time] === "Done";
    const updates = isDone
      ? {
          [`users/${user.uid}/weeklySchedules/week${currentWeekOffset}/${day}/${time}`]: null,
          [`users/${user.uid}/attendance/${course}/present`]: Math.max((counts[course]?.present || 0) - 1, 0),
        }
      : {
          [`users/${user.uid}/weeklySchedules/week${currentWeekOffset}/${day}/${time}`]: "Done",
          [`users/${user.uid}/attendance/${course}/present`]: (counts[course]?.present || 0) + 1,
        };
  
    try {
      await update(ref(db), updates);
      console.log(isDone ? "Attendance undone" : "Attendance updated");
      setSchedule((prev) => ({
        ...prev,
        [day]: {
          ...prev[day],
          [time]: isDone ? course : "Done",
        },
      }));
    } catch (error) {
      console.error("Failed to update schedule:", error);
    }
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

  if (!user) {
    return (
      <Card className="w-full max-w-6xl">
        <CardContent className="p-8 text-center">
          <p className="text-lg text-gray-600">Please sign in to view and track your schedule</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-6xl">
  <CardHeader className="bg-gray-50 rounded-t-lg">
    <div className="flex justify-between items-center">
      <div className="text-xl font-semibold text-gray-700">
        {currentDate.toLocaleDateString()} {currentDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
      </div>
      <div>
        <button
          onClick={() => handleWeekChange(-1)}
          className="btn bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Previous Week
        </button>
        <span className="mx-4 font-semibold text-gray-700">
          {getWeekRange(currentWeekOffset)}
        </span>
        <button
          onClick={() => handleWeekChange(1)}
          className="btn bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Next Week
        </button>
      </div>
    </div>
  </CardHeader>
  <CardContent className="p-4">
    <div className="overflow-x-auto">
      <table className="w-full border-collapse">
        <thead>
          <tr>
            {days.map((day) => {
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
          {times.map((time) => (
            <tr key={time}>
              <td className="border p-2 text-sm font-medium bg-gray-50">
                {time}
              </td>
              {days.slice(1).map((day) => {
                const course = schedule[day]?.[time];
                const past = isPast(day, time);

                return (
                  <td
                    key={`${day}-${time}`}
                    className={`border p-1 text-center ${past ? 'cursor-pointer' : 'opacity-50 cursor-not-allowed'}`}
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

    <div className="mt-4 border-t pt-4">
      <h2 className="text-lg font-semibold text-center mb-2">Course Attendance</h2>
      <div className="overflow-x-auto">
        <table className="w-full text-center border-collapse">
          <thead>
            <tr className="bg-gray-200">
              <th className="border p-2">Course</th>
              <th className="border p-2">Present</th>
            </tr>
          </thead>
          <tbody>
            {Object.keys(courseColors).map((course) => (
              <tr key={course} className="hover:bg-gray-50">
                <td className={`border p-2 ${courseColors[course]} font-medium`}>{course}</td>
                <td className="border p-2">{counts[course]?.present || 0}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  </CardContent>
</Card>

  );
};

export default Timetable;
