import { useState, useEffect, useCallback } from "react";
import { PHASES, DOC_CATEGORIES, type UploadedFile } from "@/lib/onboardingData";

const STORAGE_KEY = "apartmentcorp-onboarding-v1";

interface OnboardingState {
  employeeName: string;
  startDate: string;
  role: string;
  checkedTasks: Record<string, boolean>;
  uploadedFiles: Record<string, UploadedFile[]>;
  lastSaved: string | null;
}

const defaultState: OnboardingState = {
  employeeName: "",
  startDate: "",
  role: "",
  checkedTasks: {},
  uploadedFiles: {},
  lastSaved: null,
};

export function useOnboardingState() {
  const [state, setState] = useState<OnboardingState>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) return { ...defaultState, ...JSON.parse(saved) };
    } catch {}
    return defaultState;
  });

  // Persist to localStorage on every change
  useEffect(() => {
    try {
      const toSave = { ...state, lastSaved: new Date().toISOString() };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(toSave));
    } catch {}
  }, [state]);

  const toggleTask = useCallback((taskId: string) => {
    setState((prev) => ({
      ...prev,
      checkedTasks: {
        ...prev.checkedTasks,
        [taskId]: !prev.checkedTasks[taskId],
      },
    }));
  }, []);

  const setEmployeeInfo = useCallback(
    (name: string, startDate: string, role: string) => {
      setState((prev) => ({ ...prev, employeeName: name, startDate, role }));
    },
    []
  );

  const addFile = useCallback((categoryId: string, file: UploadedFile) => {
    setState((prev) => ({
      ...prev,
      uploadedFiles: {
        ...prev.uploadedFiles,
        [categoryId]: [...(prev.uploadedFiles[categoryId] || []), file],
      },
    }));
  }, []);

  const removeFile = useCallback((categoryId: string, fileId: string) => {
    setState((prev) => ({
      ...prev,
      uploadedFiles: {
        ...prev.uploadedFiles,
        [categoryId]: (prev.uploadedFiles[categoryId] || []).filter(
          (f) => f.id !== fileId
        ),
      },
    }));
  }, []);

  const resetAll = useCallback(() => {
    setState(defaultState);
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  // Computed stats
  const totalTasks = PHASES.reduce((total, phase) => {
    return (
      total +
      phase.sections.reduce((s, section) => s + section.tasks.length, 0)
    );
  }, 0);

  const completedTasks = Object.values(state.checkedTasks).filter(Boolean).length;
  const overallProgress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  const getPhaseProgress = useCallback(
    (phaseId: string) => {
      const phase = PHASES.find((p) => p.id === phaseId);
      if (!phase) return { completed: 0, total: 0, percent: 0 };
      const tasks = phase.sections.flatMap((s) => s.tasks);
      const total = tasks.length;
      const completed = tasks.filter((t) => state.checkedTasks[t.id]).length;
      return { completed, total, percent: total > 0 ? Math.round((completed / total) * 100) : 0 };
    },
    [state.checkedTasks]
  );

  const totalFiles = Object.values(state.uploadedFiles).reduce(
    (sum, files) => sum + files.length,
    0
  );

  const categoriesFiled = Object.values(state.uploadedFiles).filter(
    (files) => files.length > 0
  ).length;

  const formatLastSaved = () => {
    if (!state.lastSaved) return "never";
    const d = new Date(state.lastSaved);
    return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  return {
    state,
    toggleTask,
    setEmployeeInfo,
    addFile,
    removeFile,
    resetAll,
    totalTasks,
    completedTasks,
    overallProgress,
    getPhaseProgress,
    totalFiles,
    categoriesFiled,
    formatLastSaved,
  };
}
