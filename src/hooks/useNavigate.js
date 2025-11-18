// src/hooks/useNavigate.js
// Simple wrapper for React Router's useNavigate
// Removed startTransition to eliminate input latency
import { useNavigate as useRouterNavigate } from 'react-router-dom';

export function useNavigate() {
  return useRouterNavigate();
}
