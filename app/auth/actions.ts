'use server';

export async function handleSignInAction(callbackUrl: string) {
  const { signIn } = await import("@/auth");
  await signIn("authelia", { redirectTo: callbackUrl });
}

export async function handleCredentialsSignIn(
  username: string,
  password: string,
  callbackUrl: string,
) {
  const { signIn } = await import("@/auth");
  await signIn("credentials", {
    username,
    password,
    redirectTo: callbackUrl,
  });
}
