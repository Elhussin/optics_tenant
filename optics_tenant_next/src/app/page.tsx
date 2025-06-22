import { Metadata } from "next";

export const metadata: Metadata = {
  title: "الصفحة الرئيسية",
  description: "مرحبًا بك في الصفحة الرئيسية لتطبيقنا!",
};

export default function HomePage() {
  return (
    <div className="max-w-2xl mx-auto mt-10 p-6 bg-white rounded shadow">
      <h1 className="text-2xl font-bold mb-4">مرحبًا بك في الصفحة الرئيسية!</h1>
      <p className="text-gray-700">
        هذه هي الصفحة الرئيسية لتطبيقنا. يمكنك البدء من هنا لاستكشاف المزيد من الميزات.
      </p>
    </div>
  );
}

