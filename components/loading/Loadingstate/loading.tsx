import React from "react";

const LoadingState = () => {
  return (


      <div className="flex items-center justify-center space-x-2">
        <div className="w-3 h-3 bg-blue-600 rounded-full animate-bounce" />
        <div className="w-3 h-3 bg-pink-600 rounded-full animate-bounce delay-100" />
        <div className="w-3 h-3 bg-violet-600 rounded-full animate-bounce delay-200" />
      </div>
  
  );
};

export default LoadingState;
