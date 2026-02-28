import { useState, useEffect } from 'react';
import { auth } from '../lib/firebase';
import { AnswerKey } from '../types';

export interface ClassData {
  id: string;
  label: string;
  count: number;
}

const DEFAULT_CLASSES = [
  { id: '1', label: 'P1', count: 30 },
  { id: '2', label: 'P2', count: 34 },
  { id: '3', label: 'P3', count: 32 },
  { id: '4', label: 'P4', count: 29 },
  { id: '5', label: 'P5', count: 32 },
  { id: '6', label: 'P6', count: 27 },
];

export function useUserData() {
  const [user, setUser] = useState(auth.currentUser);
  const [loading, setLoading] = useState(true);
  
  // App State (Initialize from localStorage if available)
  const [classes, setClassesState] = useState<ClassData[]>(() => {
    const saved = localStorage.getItem('app_classes');
    return saved ? JSON.parse(saved) : DEFAULT_CLASSES;
  });
  const [studentCount, setStudentCountState] = useState<number>(() => {
    const saved = localStorage.getItem('app_studentCount');
    return saved ? JSON.parse(saved) : 0;
  });
  const [questionCount, setQuestionCountState] = useState<number>(() => {
    const saved = localStorage.getItem('app_questionCount');
    return saved ? JSON.parse(saved) : 10;
  });
  const [answerKey, setAnswerKeyState] = useState<AnswerKey>(() => {
    const saved = localStorage.getItem('app_answerKey');
    return saved ? JSON.parse(saved) : {};
  });

  // Listen to auth changes
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setUser(user);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // Wrappers to save to localStorage
  const setClasses = (newClasses: ClassData[]) => {
    setClassesState(newClasses);
    localStorage.setItem('app_classes', JSON.stringify(newClasses));
  };
  
  const setStudentCount = (count: number) => {
    setStudentCountState(count);
    localStorage.setItem('app_studentCount', JSON.stringify(count));
  };

  const setQuestionCount = (count: number) => {
    setQuestionCountState(count);
    localStorage.setItem('app_questionCount', JSON.stringify(count));
  };

  const setAnswerKey = (key: AnswerKey) => {
    setAnswerKeyState(key);
    localStorage.setItem('app_answerKey', JSON.stringify(key));
  };

  return {
    user,
    loading,
    classes,
    setClasses,
    studentCount,
    setStudentCount,
    questionCount,
    setQuestionCount,
    answerKey,
    setAnswerKey
  };
}
