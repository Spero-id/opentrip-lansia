"use client";

interface AuthErrorAlertProps {
  message: string;
}

export default function AuthErrorAlert({ message }: AuthErrorAlertProps) {
  if (!message) return null;

  return (
    <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm">
      {message}
    </div>
  );
}
