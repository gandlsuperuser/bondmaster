"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { isSupabaseConfigured } from "@/lib/supabase/client";
import { createClient } from "@/lib/supabase/server";

export async function loginAction(prevState: any, formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  if (!email || !password) {
    return { success: false, error: "Email and password are required." };
  }

  const isConfigured = isSupabaseConfigured();

  // Check if we should use mock auth
  // We fall back to mock auth if Supabase isn't configured, OR if they use the special demo email.
  const useMock = !isConfigured || email === "admin@bondsmaster.com";

  if (useMock) {
    // Artificial delay for loading experience
    await new Promise((resolve) => setTimeout(resolve, 800));

    if (email === "admin@bondsmaster.com" && password === "admin123") {
      const cookieStore = await cookies();
      cookieStore.set("bondsmaster-mock-session", "mock_session_token_xyz_12345", {
        path: "/",
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        maxAge: 60 * 60 * 24 * 7, // 1 week
      });
      return { success: true };
    }

    return { success: false, error: "Invalid email or password. (Demo: admin@bondsmaster.com / admin123)" };
  }

  // Supabase Authenticated Login
  try {
    const supabase = await createClient();
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || "An unexpected error occurred." };
  }
}

export async function logoutAction() {
  const cookieStore = await cookies();
  
  // Clean up mock cookie
  cookieStore.delete("bondsmaster-mock-session");

  // Clean up Supabase cookies if configured
  if (isSupabaseConfigured()) {
    try {
      const supabase = await createClient();
      await supabase.auth.signOut();
    } catch (e) {
      // Ignore
    }
  }

  redirect("/login");
}

export async function forgotPasswordAction(prevState: any, formData: FormData) {
  const email = formData.get("email") as string;

  if (!email) {
    return { success: false, error: "Email is required." };
  }

  const isConfigured = isSupabaseConfigured();

  if (!isConfigured || email.endsWith("@bondsmaster.com")) {
    await new Promise((resolve) => setTimeout(resolve, 800));
    return {
      success: true,
      message: `Password reset email sent to ${email} (Mock Mode). Click the reset link in the mock email to continue.`,
    };
  }

  try {
    const supabase = await createClient();
    // In server context, need to get header host to build redirectTo
    const origin = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${origin}/reset-password`,
    });

    if (error) {
      return { success: false, error: error.message };
    }

    return {
      success: true,
      message: "Check your email for the password reset link.",
    };
  } catch (error: any) {
    return { success: false, error: error.message || "An unexpected error occurred." };
  }
}

export async function resetPasswordAction(prevState: any, formData: FormData) {
  const password = formData.get("password") as string;
  const confirmPassword = formData.get("confirmPassword") as string;

  if (!password || !confirmPassword) {
    return { success: false, error: "Both password fields are required." };
  }

  if (password !== confirmPassword) {
    return { success: false, error: "Passwords do not match." };
  }

  const isConfigured = isSupabaseConfigured();

  if (!isConfigured) {
    await new Promise((resolve) => setTimeout(resolve, 800));
    return { success: true };
  }

  try {
    const supabase = await createClient();
    const { error } = await supabase.auth.updateUser({ password });

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || "An unexpected error occurred." };
  }
}
