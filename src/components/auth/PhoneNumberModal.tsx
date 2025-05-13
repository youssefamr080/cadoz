"use client";

import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '@/lib/redux/store';
import { updatePhoneNumber } from '@/lib/redux/slices/authSlice';

const PhoneNumberModal = () => {
  const dispatch = useDispatch<AppDispatch>();
  const user = useSelector((state: RootState) => state.auth.user);
  const phoneNumberRequired = useSelector((state: RootState) => state.auth.phoneNumberRequired);
  const error = useSelector((state: RootState) => state.auth.error);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showModal, setShowModal] = useState(false);

  // عرض النافذة عندما يكون المستخدم مسجلاً وبحاجة إلى إدخال رقم هاتف
  useEffect(() => {
    if (user && phoneNumberRequired) {
      setShowModal(true);
    } else {
      setShowModal(false);
    }
  }, [user, phoneNumberRequired]);

  // عرض الخطأ في حال وجوده
  useEffect(() => {
    if (error) {
      toast.error(error);
    }
  }, [error]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!phoneNumber) {
      toast.error('يرجى إدخال رقم الهاتف');
      return;
    }
    
    // التحقق من صحة رقم الهاتف
    const phoneRegex = /^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/;
    if (!phoneRegex.test(phoneNumber)) {
      toast.error('رقم الهاتف غير صالح');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      if (user?.id) {
        await dispatch(updatePhoneNumber({
          userId: user.id,
          phoneNumber
        })).unwrap();
        toast.success('تم تحديث رقم الهاتف بنجاح');
      }
    } catch (err) {
      console.error('Error updating phone number:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!showModal) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="w-full max-w-md p-6 mx-auto bg-white rounded-lg shadow-xl">
        <h2 className="mb-4 text-xl font-semibold text-gray-800">أكمل بياناتك</h2>
        <p className="mb-4 text-gray-600">
          يرجى إدخال رقم هاتفك لإكمال تسجيل حسابك. هذا سيساعدنا في التواصل معك بخصوص طلباتك.
        </p>
        
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="phoneNumber" className="block mb-1 text-sm font-medium text-gray-700">
              رقم الهاتف
            </label>
            <input
              id="phoneNumber"
              type="tel"
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-teal-400 focus:border-transparent"
              placeholder="+201XXXXXXXXX"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              required
              dir="ltr"
            />
          </div>
          
          <div className="flex justify-center mt-6">
            <button
              type="submit"
              className="px-4 py-2 text-white bg-teal-500 rounded-md hover:bg-teal-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'جاري الحفظ...' : 'حفظ رقم الهاتف'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PhoneNumberModal;
