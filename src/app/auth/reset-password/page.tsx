// Reset password is handled entirely by Firebase via email link.
// Users land on this URL from the Firebase email — redirect them to forgot-password
// so they can request a new link if needed.
import { redirect } from "next/navigation";

export default function ResetPasswordPage() {
  redirect("/auth/forgot-password");
}
