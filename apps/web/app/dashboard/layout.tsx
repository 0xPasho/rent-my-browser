import type { Metadata } from "next";
import DashboardShell from "./dashboard-shell";

export const metadata: Metadata = {
  title: "Dashboard",
  description:
    "Manage your rent my browser account. View balance, tasks, and credits. Top up and monitor browser automation tasks.",
  robots: { index: false },
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <DashboardShell>{children}</DashboardShell>;
}
