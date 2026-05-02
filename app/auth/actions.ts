'use server';

export async function handleSignInAction(callbackUrl: string) {
  const { signIn } = await import("@/auth");
  try {
    await signIn("authelia", {
      redirectTo: callbackUrl
    });
  } catch (err) {
    console.error('Server sign in error:', err);
    throw err;
  }
}
