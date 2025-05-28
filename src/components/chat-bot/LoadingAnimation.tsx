"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";

const funnyMessages = [
  "استني بدور في المخزن...",
  "بقلب في الصناديق...",
  "بنبش في الرفوف...",
  "بفتش في الأدراج...",
  "بسأل المدير...",
  "بجري بين الممرات...",
  "بحاول أفتكر فين شفت الحاجة دي...",
  "بنفض الغبار عن الكتالوج...",
  "بتصل بالمورد...",
  "بعد الهدايا واحدة واحدة..."
];

export default function LoadingAnimation() {
  const [message, setMessage] = useState(funnyMessages[0]);

  useEffect(() => {
    const interval = setInterval(() => {
      const randomIndex = Math.floor(Math.random() * funnyMessages.length);
      setMessage(funnyMessages[randomIndex]);
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-white rounded-2xl shadow-xl p-6 max-w-xs mx-auto text-center"
    >
      <div className="relative w-40 h-40 mx-auto mb-4">
        {/* Person searching in box animation */}
        <motion.div 
          className="absolute inset-0"
          animate={{ 
            y: [0, -5, 0],
            rotate: [0, 2, -2, 0]
          }}
          transition={{ 
            duration: 2,
            repeat: Infinity,
            repeatType: "loop"
          }}
        >
          <svg viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
            {/* Box */}
            <rect x="40" y="110" width="120" height="80" rx="4" fill="#E9D5FF" stroke="#9333EA" strokeWidth="3"/>
            <path d="M40 130 L160 130" stroke="#9333EA" strokeWidth="2" strokeDasharray="5 5"/>
            
            {/* Dust particles */}
            <motion.circle 
              cx="70" 
              cy="100" 
              r="3" 
              fill="#9333EA" 
              animate={{ 
                y: [-5, -15, -5],
                opacity: [0.2, 0.8, 0.2]
              }}
              transition={{ 
                duration: 2,
                repeat: Infinity,
                repeatType: "loop",
                delay: 0.2
              }}
            />
            <motion.circle 
              cx="90" 
              cy="95" 
              r="2" 
              fill="#9333EA" 
              animate={{ 
                y: [-5, -20, -5],
                opacity: [0.2, 0.7, 0.2]
              }}
              transition={{ 
                duration: 2.5,
                repeat: Infinity,
                repeatType: "loop",
                delay: 0.5
              }}
            />
            <motion.circle 
              cx="110" 
              cy="98" 
              r="2.5" 
              fill="#9333EA" 
              animate={{ 
                y: [-5, -18, -5],
                opacity: [0.2, 0.6, 0.2]
              }}
              transition={{ 
                duration: 3,
                repeat: Infinity,
                repeatType: "loop",
                delay: 0.8
              }}
            />
            
            {/* Person */}
            <motion.g
              animate={{ 
                y: [0, 5, 0],
                rotate: [0, -5, 0]
              }}
              transition={{ 
                duration: 1.5,
                repeat: Infinity,
                repeatType: "loop"
              }}
            >
              {/* Body */}
              <path d="M100 60 L100 110" stroke="#4B5563" strokeWidth="3" strokeLinecap="round"/>
              <circle cx="100" cy="45" r="15" fill="#9333EA"/>
              
              {/* Arms */}
              <motion.path 
                d="M100 70 L80 90" 
                stroke="#4B5563" 
                strokeWidth="3" 
                strokeLinecap="round"
                animate={{ 
                  rotate: [0, 10, 0],
                }}
                transition={{ 
                  duration: 1.5,
                  repeat: Infinity,
                  repeatType: "loop"
                }}
                style={{ transformOrigin: '100px 70px' }}
              />
              <motion.path 
                d="M100 70 L120 100" 
                stroke="#4B5563" 
                strokeWidth="3" 
                strokeLinecap="round"
                animate={{ 
                  rotate: [0, -15, 0],
                }}
                transition={{ 
                  duration: 1.5,
                  repeat: Infinity,
                  repeatType: "loop",
                  delay: 0.2
                }}
                style={{ transformOrigin: '100px 70px' }}
              />
              
              {/* Legs */}
              <path d="M100 110 L90 130" stroke="#4B5563" strokeWidth="3" strokeLinecap="round"/>
              <path d="M100 110 L110 130" stroke="#4B5563" strokeWidth="3" strokeLinecap="round"/>
            </motion.g>
          </svg>
        </motion.div>
      </div>
      
      <motion.p 
        className="text-purple-700 font-medium"
        animate={{ opacity: [0.6, 1, 0.6] }}
        transition={{ 
          duration: 2,
          repeat: Infinity,
          repeatType: "loop"
        }}
      >
        {message}
      </motion.p>
    </motion.div>
  );
}
