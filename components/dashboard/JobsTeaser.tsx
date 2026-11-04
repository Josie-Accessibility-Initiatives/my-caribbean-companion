"use client";

import Link from "next/link";
import JobCard from "@/components/jobs/JobCard";
import type { JobsApiResponse } from "@/lib/types/jobs";
import type { PlanInput } from "@/lib/types/plan";

const PREVIEW_COUNT = 2;

/** Dashboard tab: first couple of live jobs, or a link to the job boards. */
export default function JobsTeaser({
  input,
  preview,
}: {
  input: PlanInput;
  preview: JobsApiResponse | null;
}) {
  const { jobs, total } = preview?.listings ?? { jobs: [], total: 0 };

  return (
    <div>
      <h2 className="section-title tab-title">Job Opportunities</h2>
      <p className="tab-subtitle">
        Jobs for <strong>{input.categoryLabel}</strong> in{" "}
        <strong>{input.targetCountryName}</strong>
      </p>

      {jobs.length > 0 ? (
        <>
          <p className="text-xs text-muted">
            Showing {Math.min(PREVIEW_COUNT, total)} of {total} opportunit
            {total === 1 ? "y" : "ies"}
          </p>
          <div className="stack-md">
            {jobs.slice(0, PREVIEW_COUNT).map((job) => (
              <JobCard key={job.jobId} job={job} userProfession={input.categoryLabel} />
            ))}
          </div>
          <div className="plan-actions">
            <Link href="/jobs" className="btn-primary">
              View All Jobs →
            </Link>
          </div>
        </>
      ) : (
        <>
          <p className="text-body tab-body">
            Browse Caribbean job boards for <strong>{input.categoryLabel}</strong>{" "}
            opportunities.
          </p>
          <Link href="/jobs" className="btn-secondary">
            Browse Job Boards →
          </Link>
        </>
      )}
    </div>
  );
}
