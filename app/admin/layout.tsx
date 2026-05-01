import { auth } from "@/auth";
import { redirect } from "next/navigation";
import Link from "next/link";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session) {
    redirect("/api/auth/signin");
  }

  // Ensure user is in the correct group
  const groups = session.user?.groups || [];
  if (!groups.includes("abba-das_admins") && !groups.includes("admins")) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background text-foreground dir-rtl" dir="rtl">
        <div className="text-center space-y-4">
          <h1 className="text-3xl font-bold text-red-500">אין הרשאה</h1>
          <p>אין לך את ההרשאות הנדרשות לגשת לעמוד זה.</p>
          <Link href="/" className="inline-block mt-4 text-sage hover:text-navy">
            חזרה לדף הבית
          </Link>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
