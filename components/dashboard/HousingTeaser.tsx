"use client";

import Link from "next/link";
import { PillLink } from "@/components/ui/LinkCard";
import { resolveRentRange, type HousingApiResponse } from "@/lib/types/housing";
import type { PlanInput } from "@/lib/types/plan";

/** Dashboard tab: estimated 1-bed rent plus quick links to housing sources. */
export default function HousingTeaser({
  input,
  preview,
}: {
  input: PlanInput;
  preview: HousingApiResponse | null;
}) {
  const oneBed = preview
    ? resolveRentRange(preview.liveData.averageRentOneBed, preview.staticData.averageRent?.oneBed)
    : null;
  const bookingUrl = preview?.staticData.bookingComUrl ?? null;
  const firstFbGroup = preview?.staticData.facebookGroups[0] ?? null;
  const countryName = preview?.country.name ?? input.targetCountryName;

  return (
    <div>
      <h2 className="section-title tab-title">Housing Discovery</h2>

      {oneBed ? (
        <>
          <div className="rent-highlight">
            <p className="rent-highlight-amount">
              ${oneBed.min.toLocaleString()} – ${oneBed.max.toLocaleString()}{" "}
              <span>{preview?.staticData.averageRent?.currency ?? "USD"}/month</span>
            </p>
            <p className="text-xs text-muted no-margin">
              Estimated 1-bedroom rent in {countryName}
            </p>
          </div>

          {(bookingUrl || firstFbGroup) && (
            <div className="row mb-1">
              {bookingUrl && (
                <PillLink href={bookingUrl} icon={false}>
                  Browse Booking.com →
                </PillLink>
              )}
              {firstFbGroup && (
                <PillLink href={firstFbGroup.url} variant="facebook" icon={false}>
                  Join Housing Groups →
                </PillLink>
              )}
            </div>
          )}
        </>
      ) : (
        <p className="text-body tab-body">
          Find accommodation in <strong>{countryName}</strong>: temporary stays,
          long-term rentals, and local housing communities.
        </p>
      )}

      <div className="plan-actions">
        <Link href="/housing" className="btn-primary">
          Explore Housing Options →
        </Link>
      </div>
    </div>
  );
}
