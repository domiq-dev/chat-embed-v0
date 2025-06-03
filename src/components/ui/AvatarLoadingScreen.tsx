import React, { FC } from 'react';

interface AvatarLoadingScreenProps {
  message?: string;
}

const AvatarLoadingScreen: FC<AvatarLoadingScreenProps> = ({ message = "Initializing Avatar..." }) => {
  return (
    <div className="absolute inset-0 flex flex-col bg-gradient-to-br from-blue-50 to-indigo-100 overflow-hidden z-10 w-full h-full">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-600/5 to-purple-600/5"></div>
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-blue-200/20 to-transparent rounded-full -mr-16 -mt-16"></div>
      <div className="absolute bottom-0 left-0 w-40 h-40 bg-gradient-to-tr from-purple-200/20 to-transparent rounded-full -ml-20 -mb-20"></div>
      
      {/* Content */}
      <div className="relative z-10 flex flex-col items-center justify-center h-full w-full px-8 text-center">
        {/* Logo/Brand Area */}
        <div className="mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-purple-600 rounded-full flex items-center justify-center mb-4 mx-auto shadow-lg">
            <span className="text-white text-2xl font-bold">GO</span>
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            Welcome to Grand Oaks
          </h2>
          <h3 className="text-lg text-gray-600 font-medium">
            Luxury Apartments
          </h3>
        </div>

        {/* Loading Animation */}
        <div className="mb-6">
          <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto"></div>
        </div>

        {/* Loading Messages */}
        <div className="space-y-3">
          <p className="text-lg font-semibold text-gray-800">
            {message.includes("Connecting") ? message : "Connecting you with Ava"}
          </p>
          <p className="text-sm text-gray-600 leading-relaxed">
            Your personal leasing assistant is being prepared.<br />
            This will just take a moment...
          </p>
        </div>

        {/* Features Preview */}
        <div className="mt-8 space-y-2">
          <div className="flex items-center justify-center space-x-2 text-xs text-gray-500">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            <span>Live Video Chat</span>
          </div>
          <div className="flex items-center justify-center space-x-2 text-xs text-gray-500">
            <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse" style={{animationDelay: '0.5s'}}></div>
            <span>Instant Answers</span>
          </div>
          <div className="flex items-center justify-center space-x-2 text-xs text-gray-500">
            <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse" style={{animationDelay: '1s'}}></div>
            <span>Tour Scheduling</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AvatarLoadingScreen; 