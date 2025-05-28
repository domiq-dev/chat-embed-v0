import React, { FC } from 'react';

interface AvatarLoadingScreenProps {
  message?: string;
}

const AvatarLoadingScreen: FC<AvatarLoadingScreenProps> = ({ message = "Initializing Avatar..." }) => {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/95 backdrop-blur-sm z-10">
      <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
      <p className="text-gray-700 text-sm">{message}</p>
    </div>
  );
};

export default AvatarLoadingScreen; 