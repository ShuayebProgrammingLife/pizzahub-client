"use client";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { PageHeader } from "@/components/dashboard/page-header";
import { ItemForm, type ItemPayload } from "@/components/dashboard/item-form";
import { apiFetch } from "@/lib/api";

export default function AddMenuItemPage() {
  const router = useRouter();

  async function create(payload: ItemPayload) {
    await apiFetch("/api/items", {
      method: "POST",
      body: JSON.stringify(payload),
    });
    toast.success("Item submitted. It goes live after admin approval.");
    router.push("/dashboard/vendor/items");
  }

  return (
    <>
      <PageHeader
        eyebrow="Menu"
        title="Create New Pizza Item"
        subtitle="New items start as Pending until an admin approves them."
      />
      <div className="max-w-2xl rounded-lg border border-white/5 bg-card p-5 sm:p-6">
        <ItemForm submitLabel="Submit for Approval" onSubmit={create} />
      </div>
    </>
  );
}
