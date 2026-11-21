import { PageHeader } from "@/components/dashboard/page-header";
import { ProfileForm } from "@/components/dashboard/profile-form";

export default function VendorProfilePage() {
  return (
    <>
      <PageHeader
        eyebrow="Account"
        title="Profile Settings"
        subtitle="Update your name, photo and restaurant name."
      />
      <ProfileForm isVendor />
    </>
  );
}
