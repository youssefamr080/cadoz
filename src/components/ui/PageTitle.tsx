"use client";

import React from 'react';
import { motion } from 'framer-motion';

interface PageTitleProps {
  title: string;
  description?: string;
  align?: 'left' | 'center' | 'right';
  className?: string;
}

const PageTitle: React.FC<PageTitleProps> = ({ 
  title, 
  description, 
  align = 'center',
  className = ''
}) => {
  const alignClass = {
    'left': 'text-start',
    'center': 'text-center',
    'right': 'text-end'
  }[align];

  return (
    <div className={`py-8 px-4 mb-6 bg-gradient-to-r from-teal-50 to-teal-100 ${alignClass} ${className}`}>
      <div className="container mx-auto">
        <motion.h1 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-3xl md:text-4xl font-bold text-teal-800"
        >
          {title}
        </motion.h1>
        
        {description && (
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mt-2 text-teal-600 max-w-2xl mx-auto"
          >
            {description}
          </motion.p>
        )}
      </div>
    </div>
  );
};

export default PageTitle;
