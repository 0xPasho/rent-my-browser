import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Tasks",
  description: "View and manage your browser automation tasks. Track status, steps, cost, and results.",
};

export default function TasksLayout({ children }: { children: React.ReactNode }) {
  return children;
}
