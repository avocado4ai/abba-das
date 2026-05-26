'use server';

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
