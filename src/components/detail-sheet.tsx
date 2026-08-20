"use client";

import type { ReactNode } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "motion/react";
import { Phone, MapPin, Bookmark } from "lucide-react";
import type { ModuleDef } from "@/lib/modules";

// Bottom detail sheet shared by /eat, /live and /explore (DEMO-SPRINT Block A).
// Fixed action row: CALL (tel:), DIRECTIONS (Google Maps dir, new tab), SAVE.
export function DetailSheet({
  open,
  onClose,
  module,
  name,
  area,
  image,
  phone,
  saved,
  onToggleSave,
  children,
}: {
  open: boolean;
  onClose: () => void;
  module: ModuleDef;
  name: string;
  area: string;
  /** Optional hero photo shown above the name. */
  image?: string;
  phone?: string | null;
  /** Omit both to hide the Save button entirely (e.g. entity types with no `saves` support). */
  saved?: boolean;
  onToggleSave?: () => void;
  children?: ReactNode;
}) {
  const directions = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(
    `${name}, ${area}, Chennai`,
  )}`;

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-end justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <button aria-label="Close" onClick={onClose} className="absolute inset-0 bg-ink/40" />
          <motion.div
            role="dialog"
            aria-label={`${name} details`}
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "tween", duration: 0.28, ease: "easeOut" }}
            className="relative z-10 max-h-[85dvh] w-full max-w-[440px] overflow-y-auto rounded-t-[28px] bg-surface p-5"
          >
            <div aria-hidden="true" className="mx-auto mb-3 h-1 w-10 rounded-full bg-line" />
            {image && (
              <div className="relative mb-4 h-44 w-full overflow-hidden rounded-inner">
                <Image src={image} alt={name} fill sizes="440px" className="object-cover" />
              </div>
            )}
            <h2 className="t-title text-ink">{name}</h2>
            <p className="t-label text-muted">{area}</p>

            <div className="mt-4">{children}</div>

            <div className="mt-5 flex gap-2">
              {phone && (
                <a
                  href={`tel:${phone}`}
                  className="t-subtitle flex flex-1 items-center justify-center gap-2 rounded-full border border-line py-3 text-ink"
                >
                  <Phone size={18} /> Call
                </a>
              )}
              <a
                href={directions}
                target="_blank"
                rel="noopener noreferrer"
                className="t-subtitle flex flex-1 items-center justify-center gap-2 rounded-full border border-line py-3 text-ink"
              >
                <MapPin size={18} /> Directions
              </a>
            </div>
            {onToggleSave && (
              <button
                type="button"
                onClick={onToggleSave}
                className={`t-subtitle mt-2 flex w-full items-center justify-center gap-2 rounded-full py-3 ${
                  saved ? `${module.bgClass} ${module.onColorClass}` : "bg-speak text-white"
                }`}
              >
                <Bookmark size={18} /> {saved ? "Saved" : "Save"}
              </button>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
