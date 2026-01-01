import React from 'react';
import './Loading.css';
import { useUser } from '../../context/Index';

export default function Loading() {
  const { loading } = useUser();
  if (!loading) return null;
  return (
    <div className="loading-overlay">
      <div className="spinner" />
    </div>
  );
}
