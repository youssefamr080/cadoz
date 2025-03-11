import React from "react";
import Link from "next/link";
import { FaFacebook, FaInstagram, FaWhatsapp } from "react-icons/fa";

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-white py-6">
      <div className="container mx-auto px-4 flex flex-col md:flex-row items-center justify-between">
        {/* حقوق الملكية */}
        <p className="text-sm text-gray-400 mb-4 md:mb-0">
          © {new Date().getFullYear()} Cadoz. جميع الحقوق محفوظة.
        </p>

        {/* التواصل ووسائل التواصل الاجتماعي */}
        <div className="text-center">
          <p className="text-base text-gray-300 mb-4">نحن هنا لمساعدتك! تواصل معنا:</p>
          <div className="flex justify-center space-x-6">
            {/* واتساب */}
            <Link
              href="https://wa.me/01055594040"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-green-400 transition-transform transform hover:scale-110"
              aria-label="تواصل عبر واتساب"
            >
              <FaWhatsapp className="text-green-500 text-3xl md:text-4xl" />
            </Link>

            {/* فيسبوك */}
            <Link
              href="https://facebook.com/cadoz"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-blue-400 transition-transform transform hover:scale-110"
              aria-label="تابعنا على فيسبوك"
            >
              <FaFacebook className="text-blue-500 text-3xl md:text-4xl" />
            </Link>

            {/* انستجرام */}
            <Link
              href="https://instagram.com/cadoz"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-pink-400 transition-transform transform hover:scale-110"
              aria-label="تابعنا على انستجرام"
            >
              <FaInstagram className="text-pink-500 text-3xl md:text-4xl" />
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;