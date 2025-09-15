import React from 'react';

const Input = ({ className = '', ...props }) => {
  return (
    <input 
      className={`form-input ${className}`}
      {...props}
    />
  );
};

export default Input;