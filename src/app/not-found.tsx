import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center h-full bg-gray-100">
      <h1 className="text-6xl font-bold text-red-600 mb-4">404</h1>
      <h2 className="text-2xl font-semibold text-gray-700 mb-4">الصفحة غير موجودة</h2>
      <p className="text-gray-500 mb-6">يبدو أنك وصلت إلى رابط غير صحيح. حاول الرجوع إلى الصفحة الرئيسية.</p>
      <Link href="/" className="bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition">
        العودة إلى الصفحة الرئيسية
      </Link>
    </div>
  );
}
