"use client";
import React, {useRef,useState, useEffect } from 'react';


interface PreLeaseSummaryProps {
  fullName: string;
  moveInDate: string;
  apartmentSize: string;
  incomeQualified: boolean;
  evictionStatus: boolean;
  onSignAndPay: () => void;
  onScheduleTour: () => void;
  isPreLeaseSigned: boolean;
  isTourScheduled: boolean;
}

const PreLeaseSummary: React.FC<PreLeaseSummaryProps> = ({
  fullName,
  moveInDate,
  apartmentSize,
  incomeQualified,
  evictionStatus,
  onSignAndPay,
  onScheduleTour,
  isPreLeaseSigned,
  isTourScheduled,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [showVideoCTA, setShowVideoCTA] = useState(true);
  const [fadeIn, setFadeIn] = useState(false);

  const [showTourCTA, setShowTourCTA] = useState(false);

useEffect(() => {
  if (isPreLeaseSigned && !isTourScheduled) {
    const timeout = setTimeout(() => {
      setShowTourCTA(true);
    }, 2000); // 2 seconds
    return () => clearTimeout(timeout);
  }
}, [isPreLeaseSigned, isTourScheduled]);

  useEffect(() => {
    const t = setTimeout(() => setFadeIn(true), 100);
    return () => clearTimeout(t);
  }, []);
  return (
      <div
          className="relative w-full max-w-md h-[90vh] rounded-2xl shadow-2xl overflow-hidden flex flex-col"
          style={{
            backgroundImage: "url('https://lh3.googleusercontent.com/44QJS-Cl0QQLTNCVjqJ6VH-tFLwLbqhkyb_qLtYoxa0v1JblFPFMK0Xe7W8cWcKTbqoIZATYnAdWDkZte6jBDPQph9Mgb3HM9vs0yD2n=s3000-rw')", // ← Replace with actual path
            backgroundSize: 'cover',
            backgroundPosition: 'center'
          }}
      >
        {/* Frosted overlay for readability */}
        <div className="absolute inset-0 bg-white/80 backdrop-blur-sm z-0"/>

        {/* Main content on top of overlay */}
        <div className="relative z-10 flex flex-col justify-between p-8 h-full overflow-y-auto">
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-center text-blue-600">
              📝 Your Are Pre-Qualified!
            </h2>
            <p className="text-center text-sm text-gray-600">
              Review your information below before proceeding.
            </p>

            <div className="space-y-3 text-gray-700 text-sm">
              <div><strong>Name:</strong> {fullName}</div>
              <div><strong>Move-In Date:</strong> {moveInDate}</div>
              <div><strong>Apartment Size:</strong> {apartmentSize}</div>
              <div><strong>Income Meets Requirement:</strong> {incomeQualified ? "✅ Yes" : "❌ No"}</div>
              <div><strong>Prior Evictions:</strong> {evictionStatus ? "❌ Yes" : "✅ No"}</div>
            </div>
          </div>

          <div className="relative w-full rounded-xl overflow-hidden shadow-lg mt-6">
            <video
                ref={videoRef}
                src="/demo.mp4"
                controls
                className="w-full rounded-xl"
                onPlay={() => setShowVideoCTA(false)}
            />
            {showVideoCTA && (
                <div
                    className={`absolute inset-0 flex items-center justify-center transition-opacity duration-700 ${
                        fadeIn ? 'opacity-100' : 'opacity-0'
                    }`}
                >
                  <button
                      onClick={() => {
                        videoRef.current?.play();
                        setShowVideoCTA(false);
                      }}
                      className="bg-white text-blue-600 font-semibold text-sm px-4 py-2 rounded-full shadow-md hover:bg-blue-100 transition-all animate-bounce"
                  >
                    🎥 We made a special message for you
                  </button>
                </div>
            )}
          </div>
          <div className="space-y-6 mt-10">
            {!isPreLeaseSigned ? (
                <button
                    onClick={onSignAndPay}
                    className="w-full py-3 bg-gradient-to-r from-green-400 to-blue-500 hover:from-green-500 hover:to-blue-600 text-white text-lg font-bold rounded-full shadow-md transition-all animate-pulse"
                >
                  ✍️ Pre-Qualify Now
                </button>
            ) : null}

            <div className="border-t my-4"></div>

            {/* Tour CTA */}
            {isPreLeaseSigned && !isTourScheduled && (
                showTourCTA ? (
                    <>
                      <p className="text-center text-green-600 font-semibold">
                        🚀 Schedule your tour now and save <span className="text-blue-600">$50 off</span> your first
                        month’s rent!
                      </p>
                      <button
                          onClick={onScheduleTour}
                          className="w-full py-3 bg-gradient-to-r from-blue-500 to-green-400 hover:from-blue-600 hover:to-green-500 text-white text-lg font-bold rounded-full shadow-lg animate-pulse"
                      >
                        🏡 Schedule My Tour
                      </button>
                    </>
                ) : (
                    <button
                        disabled
                        className="w-full py-3 bg-gray-300 text-gray-600 font-bold rounded-full shadow-md"
                    >
                      ✅ Pre-Qualified!
                    </button>
                )
            )}

            {isPreLeaseSigned && isTourScheduled && (
                <div className="text-center text-green-500 font-bold mt-4">
                  🎉 Tour Scheduled! We'll see you soon!
                </div>
            )}
          </div>


        </div>
      </div>
  );
};

export default PreLeaseSummary;
