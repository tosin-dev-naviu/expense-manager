import type { ReactNode } from "react";
import Link from "next/link";

import { signOut } from "../../auth/config";
import { Card } from "../ui/card";
import { Button } from "../ui/button";

const navItems = [
  { label: "Dashboard", href: "/dashboard", enabled: true },
  { label: "Expense Requests", href: "#", enabled: false },
  { label: "Team Budgets", href: "#", enabled: false },
  { label: "Approvals", href: "#", enabled: false },
  { label: "Reports", href: "#", enabled: false },
  { label: "Team", href: "#", enabled: false },
];

export function AppShell({
  children,
  currentPath,
  tenantName,
  userEmail,
  userName,
}: {
  children: ReactNode;
  currentPath: string;
  tenantName: string;
  userEmail: string;
  userName: string;
}) {
  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="sidebar__section">
          <div className="brand-mark">
            <div className="brand-mark__orb" />
            <div>
              <p className="brand-mark__title">ExpenseOS</p>
              <p className="brand-mark__subtitle">{tenantName}</p>
            </div>
          </div>

          <nav className="sidebar__nav" aria-label="Primary">
            {navItems.map((item) =>
              item.enabled ? (
                <Link
                  className={`sidebar__link${
                    currentPath.startsWith(item.href) ? " sidebar__link--active" : ""
                  }`}
                  href={item.href}
                  key={item.label}
                >
                  {item.label}
                </Link>
              ) : (
                <span className="sidebar__link sidebar__link--muted" key={item.label}>
                  {item.label}
                </span>
              ),
            )}
          </nav>
        </div>

        <div className="sidebar__section">
          <Card className="sidebar__profile">
            <div>
              <p className="sidebar__profile-name">{userName}</p>
              <p className="sidebar__profile-email">{userEmail}</p>
            </div>
            <form
              action={async () => {
                "use server";
                await signOut({ redirectTo: "/sign-in" });
              }}
            >
              <Button type="submit" variant="ghost">
                Sign out
              </Button>
            </form>
          </Card>
        </div>
      </aside>

      <main className="main-pane">{children}</main>
    </div>
  );
}
