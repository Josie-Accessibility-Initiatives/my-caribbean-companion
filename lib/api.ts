import { promises as fs } from "fs";
import path from "path";
import { NextResponse } from "next/server";

export type Country = {
  id: number;
  code: string;
  name: string;
  immigrationUrl: string | null;
  competentAuthorityUrl: string | null;
  formsUrl: string | null;
  notes: string | null;
};

export type Category = {
  id: number;
  code: string;
  label: string;
  description: string | null;
};

export type PlanRequest = {
  fromCountry: string;
  toCountry: string;
  category: string | number;
};

export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

const DATA_DIR = path.join(process.cwd(), "data");

export async function readDataFile<T = unknown>(filename: string): Promise<T> {
  const filePath = path.join(DATA_DIR, filename);
  try {
    const contents = await fs.readFile(filePath, "utf-8");
    return JSON.parse(contents) as T;
  } catch (err) {
    if ((err as NodeJS.ErrnoException).code === "ENOENT") {
      throw new ApiError(`Data file not found: ${filename}`, 500);
    }
    throw new ApiError(`Failed to read data file: ${filename}`, 500);
  }
}

export function validatePlanRequest(body: unknown): PlanRequest {
  if (!body || typeof body !== "object") {
    throw new ApiError(
      "Missing or invalid required fields (fromCountry, toCountry, category).",
      400
    );
  }

  const { fromCountry, toCountry, category } = body as Record<string, unknown>;

  const fromCode =
    typeof fromCountry === "string" ? fromCountry.trim() : "";
  const toCode = typeof toCountry === "string" ? toCountry.trim() : "";

  const hasValidCategory =
    typeof category === "number" ||
    (typeof category === "string" && category.trim().length > 0);

  if (!fromCode || !toCode || !hasValidCategory) {
    throw new ApiError(
      "Missing or invalid required fields (fromCountry, toCountry, category).",
      400
    );
  }

  if (fromCode === toCode) {
    throw new ApiError(
      "Home country and destination country cannot be the same.",
      400
    );
  }

  return {
    fromCountry: fromCode,
    toCountry: toCode,
    category: typeof category === "string" ? category.trim() : category,
  };
}

export function apiError(message: string, status: number): NextResponse {
  return NextResponse.json(
    { error: message },
    {
      status,
      headers: {
        "Content-Type": "application/json",
      },
    }
  );
}

export function apiSuccess<T>(data: T): NextResponse {
  return NextResponse.json(data, {
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "no-store",
    },
  });
}
