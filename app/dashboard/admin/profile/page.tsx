import { PageHeader } from "@/components/dashboard/page-header";
import { ProfileForm } from "@/components/dashboard/profile-form";

export default function AdminProfilePage() {
  return (
    <>
      <PageHeader
        eyebrow="Account"
        title="Profile Settings"
        subtitle="Update your name and profile photo."
      />
      <ProfileForm />
    </>
  );
}
