import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { BundlesTab } from "@/components/bundles-tab";

// Bundles isn't one of the 5 nav modules — reached from Home's preview row.
export default function BundlesPage() {
  return (
    <div className="flex flex-col gap-4 px-4 py-4">
      <Link href="/" className="t-label flex items-center gap-1 text-muted">
        <ArrowLeft size={16} /> Home
      </Link>
      <div>
        <h1 className="t-hero text-ink">Bundles</h1>
        <p className="t-label text-muted">Student essentials, reserved on WhatsApp</p>
      </div>
      <BundlesTab />
    </div>
  );
}
