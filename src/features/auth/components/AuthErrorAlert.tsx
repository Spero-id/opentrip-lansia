"use client";

interface AuthErrorAlertProps {
  message: string;
}

export default function AuthErrorAlert({ message }: AuthErrorAlertProps) {
  if (!message) return null;

  return (
    <div
      role="alert"
      className="mb-4 p-3 rounded-lg border border-destructive/20 bg-destructive/10 text-destructive text-sm"
    >
      {message}
    </div>
  );
}
