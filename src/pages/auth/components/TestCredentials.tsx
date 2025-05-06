
export function TestCredentials() {
  return (
    <div className="mt-8 pt-6 border-t border-slate-200">
      <p className="text-sm text-center text-muted-foreground mb-2">Test credentials:</p>
      <div className="bg-slate-50 p-3 rounded-md text-sm">
        <p><strong>Email:</strong> test@example.com</p>
        <p><strong>Password:</strong> password123</p>
        <p className="text-xs text-muted-foreground mt-1">
          For testing purposes only
        </p>
      </div>
    </div>
  );
}
