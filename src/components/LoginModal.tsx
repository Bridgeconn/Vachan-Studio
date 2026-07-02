// src/components/LoginModal.tsx

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, Eye, EyeOff } from "lucide-react";
import { authService } from "@/services/auth";
import { toast } from "sonner";

type View = "login" | "register" | "forgot" | "verify-code" | "reset-password";

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (
    token: string,
    userId: string,
    apiKey: string,
    expiresInSeconds: number,
  ) => void;
}

export function LoginModal({ isOpen, onClose, onSuccess }: LoginModalProps) {
  const [view, setView] = useState<View>("login");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Login fields
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  // Register fields
  const [regEmail, setRegEmail] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [regConfirmPassword, setRegConfirmPassword] = useState("");
  const [regFirstname, setRegFirstname] = useState("");
  const [regLastname, setRegLastname] = useState("");

  // Forgot password fields
  const [forgotEmail, setForgotEmail] = useState("");
  const [recoveryFlowId, setRecoveryFlowId] = useState("");
  const [recoveryCode, setRecoveryCode] = useState("");
  const [settingsFlowId, setSettingsFlowId] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");

  const resetAll = () => {
    setError("");
    setUsername("");
    setPassword("");
    setRegEmail("");
    setRegPassword("");
    setRegConfirmPassword("");
    setRegFirstname("");
    setRegLastname("");
    setForgotEmail("");
    setRecoveryFlowId("");
    setRecoveryCode("");
    setSettingsFlowId("");
    setNewPassword("");
    setConfirmNewPassword("");
    setShowPassword(false);
    setShowConfirmPassword(false);
  };

  const switchView = (newView: View) => {
    setError("");
    setView(newView);
  };

  const handleClose = () => {
    resetAll();
    setView("login");
    onClose();
  };

  // Login
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const { token, userId } = await authService.login(username, password);
      const { apiKey, expiresInSeconds } = await authService.generateApiKey(
        token,
        userId,
      );
      resetAll();
      setView("login");
      onSuccess(token, userId, apiKey, expiresInSeconds);
      onClose();
    } catch {
      setError("Invalid username or password");
    } finally {
      setLoading(false);
    }
  };

  // Register
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (regPassword !== regConfirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);
    try {
      await authService.register(
        regEmail,
        regPassword,
        regFirstname || undefined,
        regLastname || undefined,
      );
      toast.success("Registration successful! Please login.");
      resetAll();
      switchView("login");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  // Forgot password — step 1
  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const flowId = await authService.forgotPassword(forgotEmail);
      setRecoveryFlowId(flowId);
      switchView("verify-code");
      toast.success("Recovery code sent to your email");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to send recovery code",
      );
    } finally {
      setLoading(false);
    }
  };

  // Verify recovery code — step 2
  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const flowId = await authService.verifyRecoveryCode(
        recoveryFlowId,
        recoveryCode,
      );
      setSettingsFlowId(flowId);
      switchView("reset-password");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Invalid recovery code");
    } finally {
      setLoading(false);
    }
  };

  // Reset password — step 3
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (newPassword !== confirmNewPassword) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);
    try {
      await authService.resetPassword(settingsFlowId, newPassword);
      toast.success("Password reset successfully! Please login.");
      resetAll();
      switchView("login");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to reset password");
    } finally {
      setLoading(false);
    }
  };

  const getTitle = () => {
    switch (view) {
      case "login":
        return "Login";
      case "register":
        return "Create Account";
      case "forgot":
        return "Forgot Password";
      case "verify-code":
        return "Enter Recovery Code";
      case "reset-password":
        return "Reset Password";
    }
  };

  const getDescription = () => {
    switch (view) {
      case "login":
        return "Enter your credentials to access AI features";
      case "register":
        return "Create a new account to get started";
      case "forgot":
        return "Enter your email to receive a recovery code";
      case "verify-code":
        return "Enter the recovery code sent to your email";
      case "reset-password":
        return "Enter your new password";
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="space-y-3">
          <DialogTitle className="text-2xl text-center">
            {getTitle()}
          </DialogTitle>
          <DialogDescription className="text-center">
            {getDescription()}
          </DialogDescription>
        </DialogHeader>

        {/* LOGIN VIEW */}
        {view === "login" && (
          <form onSubmit={handleLogin} className="space-y-6 mt-6">
            <div className="space-y-1">
              <label className="text-sm font-medium">Username</label>
              <Input
                type="text"
                placeholder="Enter your username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                disabled={loading}
                className="h-11 mt-1"
              />
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium">Password</label>
              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={loading}
                  className="h-11 mt-1 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer"
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => switchView("forgot")}
                  className="text-sm text-primary hover:underline cursor-pointer"
                >
                  Forgot password?
                </button>
              </div>
            </div>

            {error && (
              <div className="text-sm text-destructive bg-destructive/10 p-3 rounded-lg border border-destructive/20">
                {error}
              </div>
            )}

            <Button
              type="submit"
              className="w-full h-11 cursor-pointer"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Logging in...
                </>
              ) : (
                "Login"
              )}
            </Button>

            <div className="text-center text-sm text-muted-foreground pt-2">
              Don't have an account?{" "}
              <button
                type="button"
                onClick={() => switchView("register")}
                className="text-primary hover:underline font-medium cursor-pointer"
              >
                Sign Up
              </button>
            </div>
          </form>
        )}

        {/* REGISTER VIEW */}
        {view === "register" && (
          <form onSubmit={handleRegister} className="space-y-4 mt-6">
            <div className="space-y-1">
              <label className="text-sm font-medium">
                Email <span className="text-destructive">*</span>
              </label>
              <Input
                type="email"
                placeholder="Enter your email"
                value={regEmail}
                onChange={(e) => setRegEmail(e.target.value)}
                required
                disabled={loading}
                className="h-11 mt-1"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-sm font-medium">
                  First Name{" "}
                  <span className="text-xs text-muted-foreground">
                    (optional)
                  </span>
                </label>
                <Input
                  type="text"
                  placeholder="First name"
                  value={regFirstname}
                  onChange={(e) => setRegFirstname(e.target.value)}
                  disabled={loading}
                  className="h-11 mt-1"
                />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium">
                  Last Name{" "}
                  <span className="text-xs text-muted-foreground">
                    (optional)
                  </span>
                </label>
                <Input
                  type="text"
                  placeholder="Last name"
                  value={regLastname}
                  onChange={(e) => setRegLastname(e.target.value)}
                  disabled={loading}
                  className="h-11 mt-1"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium">
                Password <span className="text-destructive">*</span>
              </label>
              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder="Create a password"
                  value={regPassword}
                  onChange={(e) => setRegPassword(e.target.value)}
                  required
                  disabled={loading}
                  className="h-11 mt-1 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer"
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium">
                Confirm Password <span className="text-destructive">*</span>
              </label>
              <div className="relative">
                <Input
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Confirm your password"
                  value={regConfirmPassword}
                  onChange={(e) => setRegConfirmPassword(e.target.value)}
                  required
                  disabled={loading}
                  className="h-11 mt-1 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer"
                  tabIndex={-1}
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            {error && (
              <div className="text-sm text-destructive bg-destructive/10 p-3 rounded-lg border border-destructive/20">
                {error}
              </div>
            )}

            <Button
              type="submit"
              className="w-full h-11 cursor-pointer"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating account...
                </>
              ) : (
                "Create Account"
              )}
            </Button>

            <div className="text-center text-sm text-muted-foreground pt-2">
              Already have an account?{" "}
              <button
                type="button"
                onClick={() => switchView("login")}
                className="text-primary hover:underline font-medium cursor-pointer"
              >
                Login
              </button>
            </div>
          </form>
        )}

        {/* FORGOT PASSWORD VIEW */}
        {view === "forgot" && (
          <form onSubmit={handleForgotPassword} className="space-y-6 mt-6">
            <div className="space-y-1">
              <label className="text-sm font-medium">Email</label>
              <Input
                type="email"
                placeholder="Enter your email"
                value={forgotEmail}
                onChange={(e) => setForgotEmail(e.target.value)}
                required
                disabled={loading}
                className="h-11 mt-1"
              />
            </div>

            {error && (
              <div className="text-sm text-destructive bg-destructive/10 p-3 rounded-lg border border-destructive/20">
                {error}
              </div>
            )}

            <Button
              type="submit"
              className="w-full h-11 cursor-pointer"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Sending...
                </>
              ) : (
                "Send Recovery Code"
              )}
            </Button>

            <div className="text-center text-sm text-muted-foreground">
              <button
                type="button"
                onClick={() => switchView("login")}
                className="text-primary hover:underline cursor-pointer"
              >
                Back to Login
              </button>
            </div>
          </form>
        )}

        {/* VERIFY CODE VIEW */}
        {view === "verify-code" && (
          <form onSubmit={handleVerifyCode} className="space-y-6 mt-6">
            <div className="space-y-1">
              <label className="text-sm font-medium">Recovery Code</label>
              <Input
                type="text"
                placeholder="Enter recovery code"
                value={recoveryCode}
                onChange={(e) => setRecoveryCode(e.target.value)}
                required
                disabled={loading}
                className="h-11 mt-1"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Check your email for the recovery code
              </p>
            </div>

            {error && (
              <div className="text-sm text-destructive bg-destructive/10 p-3 rounded-lg border border-destructive/20">
                {error}
              </div>
            )}

            <Button
              type="submit"
              className="w-full h-11 cursor-pointer"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Verifying...
                </>
              ) : (
                "Verify Code"
              )}
            </Button>

            <div className="text-center text-sm text-muted-foreground">
              <button
                type="button"
                onClick={() => switchView("forgot")}
                className="text-primary hover:underline cursor-pointer"
              >
                Resend code
              </button>
            </div>
          </form>
        )}

        {/* RESET PASSWORD VIEW */}
        {view === "reset-password" && (
          <form onSubmit={handleResetPassword} className="space-y-6 mt-6">
            <div className="space-y-1">
              <label className="text-sm font-medium">New Password</label>
              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter new password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  disabled={loading}
                  className="h-11 mt-1 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer"
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium">
                Confirm New Password
              </label>
              <div className="relative">
                <Input
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Confirm new password"
                  value={confirmNewPassword}
                  onChange={(e) => setConfirmNewPassword(e.target.value)}
                  required
                  disabled={loading}
                  className="h-11 mt-1 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground cursor-pointer"
                  tabIndex={-1}
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            {error && (
              <div className="text-sm text-destructive bg-destructive/10 p-3 rounded-lg border border-destructive/20">
                {error}
              </div>
            )}

            <Button
              type="submit"
              className="w-full h-11 cursor-pointer"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Resetting...
                </>
              ) : (
                "Reset Password"
              )}
            </Button>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
