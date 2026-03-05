import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Settings",
  description: "Manage your account settings. View API key, link wallet, update email.",
};

export default function SettingsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
