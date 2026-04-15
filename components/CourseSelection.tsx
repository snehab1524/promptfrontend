import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '../api';

interface Course {
  name: string;
  amount: number;
  duration: number;
}

interface Props {
  onCourseSelect: (courseName: string) => void;
  selectedCourse?: string;
}

const CourseSelection: React.FC<Props> = ({ onCourseSelect, selectedCourse }) => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_BASE_URL}/api/courses`);
      setCourses(res.data.courses || []);
    } catch (err) {
      console.error('Failed to fetch courses:', err);
      setError('Failed to load courses. Please refresh.');
    } finally {
      setLoading(false);
    }
  };

  const handleSelect = (courseName: string) => {
    onCourseSelect(courseName);
    // Save to localStorage
    const masterData = JSON.parse(localStorage.getItem('prompt_master_data') || '{}');
    masterData.courseName = courseName;
    localStorage.setItem('prompt_master_data', JSON.stringify(masterData));
  };

  if (loading) {
    return <div className="p-4 text-center">Loading courses...</div>;
  }

  if (error) {
    return <div className="p-4 text-red-500 text-center">{error}</div>;
  }

  return (
    <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-200">
      <h3 className="text-xl font-bold mb-4 text-gray-800">
        Select Course Package <span className="text-red-500">*</span>
      </h3>
      
      {courses.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          No courses available. Please contact support.
        </div>
      ) : (
        <div className="space-y-3">
          {courses.map((course) => (
            <label key={course.name} className="flex items-center p-4 border rounded-xl hover:border-indigo-300 cursor-pointer transition-all">
              <input
                type="radio"
                name="course"
                value={course.name}
                checked={selectedCourse === course.name}
                onChange={() => handleSelect(course.name)}
                className="w-5 h-5 text-indigo-600"
                required
              />
              <div className="ml-4 flex-1">
                <div className="flex justify-between items-start">
                  <span className="font-bold text-lg">{course.name}</span>
                  <span className="bg-indigo-100 text-indigo-800 px-3 py-1 rounded-full text-sm font-bold">
                    ₹{course.amount}
                  </span>
                </div>
                <p className="text-sm text-gray-600 mt-1">{course.duration} days access</p>
              </div>
            </label>
          ))}
        </div>
      )}
      
      {selectedCourse && (
        <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
          <p className="font-bold text-green-800">✅ Selected: {selectedCourse}</p>
        </div>
      )}
    </div>
  );
};

export default CourseSelection;

