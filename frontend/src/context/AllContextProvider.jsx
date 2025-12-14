import React from 'react';
import { UserProvider } from './Index';

export const AllContextProvider = ({ children }) => {
  return (
    <UserProvider>
      {/* Other providers can be added here when they're created */}
      {children}
    </UserProvider>
  );
};

export default AllContextProvider;