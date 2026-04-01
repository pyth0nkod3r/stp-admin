export function clearAuthAndRedirect(): void {
  localStorage.removeItem("stp_token");
  localStorage.removeItem("stp_user_name");
  localStorage.removeItem("stp_user_email");
  window.location.replace("/login");
}
