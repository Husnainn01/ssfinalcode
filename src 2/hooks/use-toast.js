"use client";
import { useState, useCallback } from "react";

export function useToast() {
  const [toasts, setToasts] = useState([]);

  const toast = useCallback(({ title, description, action }) => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, title, description, action }]);
    
    setTimeout(() => {
      setToasts((prev) => prev.filter((toast) => toast.id !== id));
    }, 5000);
  }, []);

  return { toast, toasts };
}