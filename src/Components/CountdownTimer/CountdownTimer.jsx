import React, { useState, useEffect } from 'react';

const CountdownTimer = ({ initialTime, onTimeout }) => {
  const [remainingTime, setRemainingTime] = useState(initialTime);

  useEffect(() => {
    const intervalId = setInterval(() => {
      setRemainingTime((prevTime) => {
        if (prevTime <= 1000) {
          clearInterval(intervalId);
          console.log("Timer reached zero, scheduling onTimeout...");
          setTimeout(onTimeout, 0); // Schedule onTimeout after render completes
          return 0;
        }
        return prevTime - 1000;
      });
    }, 1000);

    return () => clearInterval(intervalId);
  }, [onTimeout]);

  const formatTime = (milliseconds) => {
    const minutes = Math.floor(milliseconds / 60000);
    const seconds = Math.floor((milliseconds % 60000) / 1000);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  return (
    <div>
      <p>Session expires in: {formatTime(remainingTime)}</p>
    </div>
  );
};

export default CountdownTimer;
