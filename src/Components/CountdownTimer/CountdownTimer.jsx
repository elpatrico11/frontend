
import React, { useState, useEffect } from 'react';

const CountdownTimer = ({ initialTime, onTimeout }) => {
  const [remainingTime, setRemainingTime] = useState(initialTime);

  useEffect(() => {
    // If the timer reaches zero, trigger the timeout action
    if (remainingTime <= 0) {
      onTimeout();
      return;
    }

    // Update remaining time every second
    const intervalId = setInterval(() => {
      setRemainingTime((prevTime) => prevTime - 1000); // Decrease by 1 second (1000 ms)
    }, 1000);

    // Clean up interval on component unmount
    return () => clearInterval(intervalId);
  }, [remainingTime, onTimeout]);

  // Format time as mm:ss for display
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
