import AuthSkeleton from "@/features/auth/components/AuthSkeleton";

// Register keeps its own loading state because the group-level
// (auth)/loading.tsx renders the login-shaped skeleton (fields={2});
// the register form has three fields and no remember row.
export default function Loading() {
  return <AuthSkeleton fields={3} />;
}
