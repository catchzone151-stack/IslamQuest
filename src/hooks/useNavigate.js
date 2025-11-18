// src/hooks/useNavigate.js
// Custom navigate hook that wraps React Router's useNavigate with startTransition
// to prevent "suspended during synchronous input" errors in React 18
import { useNavigate as useRouterNavigate } from 'react-router-dom';
import { useTransition } from 'react';

export function useNavigate() {
  const navigate = useRouterNavigate();
  const [, startTransition] = useTransition();

  return (...args) => {
    startTransition(() => {
      navigate(...args);
    });
  };
}
