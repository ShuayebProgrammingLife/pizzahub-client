import { DashboardShell } from "@/components/dashboard/dashboard-shell";

export default function VendorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <DashboardShell role="vendor">{children}</DashboardShell>;
}
