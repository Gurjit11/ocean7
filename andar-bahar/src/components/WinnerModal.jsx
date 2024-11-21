import React, { useEffect, useState } from "react";
import Confetti from "react-confetti";
import { motion } from "framer-motion";
import coin from "/images/coin.png";

const WinnerModal = ({ show, onClose, winner }) => {
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    if (show) {
      setShowConfetti(true);

      // Close the modal after 5 seconds
      const timer = setTimeout(() => {
        onClose();
      }, 500);

      // Stop confetti after 3 seconds
      const confettiTimer = setTimeout(() => {
        setShowConfetti(false);
      }, 500);

      return () => {
        clearTimeout(timer);
        clearTimeout(confettiTimer);
      };
    }
  }, [show, onClose]);

  if (!show) return null;

  return (
    <>
      <div className="fixed h-screen z-50 inset-0 flex items-center justify-center bg-gray-900 bg-opacity-50">
        {showConfetti && <Confetti />}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          exit={{ scale: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full p-8 bg-white rounded-lg shadow-lg relative"
        >
          <div className="flex justify-center items-center">
            <div className="flex items-center justify-center">
              <img src={coin} alt="Trophy" className="w-32 h-32" />
            </div>
            <div className="text-center ml-8">
              <h1 className="text-5xl font-semibold text-gray-800">
                {winner === 0 ? "ANDAR WINS!!" : "BAHAR WINS!!"}
              </h1>
            </div>
          </div>
        </motion.div>
      </div>
    </>
  );
};

export default WinnerModal;
