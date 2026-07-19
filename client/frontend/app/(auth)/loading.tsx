import { Spinner } from "@/components/ui/spinner";

export default function AuthLoading() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <Spinner size={32} />
    </div>
  );
}
