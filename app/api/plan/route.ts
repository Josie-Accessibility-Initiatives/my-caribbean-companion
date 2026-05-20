// Migrated from Express backend — ../Inter_Regional_Planner_Webapp/backend/server.js (POST /api/plan)
import { createHash } from "crypto";
import {
  apiError,
  apiSuccess,
  ApiError,
  readDataFile,
  validatePlanRequest,
  type Country,
  type Category,
} from "@/lib/api";

type ChecklistItem = {
  id: string;
  label: string;
  description: string;
};

function buildChecklist(categoryLabel: string): ChecklistItem[] {
  return [
    {
      id: "passport",
      label: "Valid passport",
      description:
        "Ensure your passport is valid for at least 6–12 months beyond your planned stay.",
    },
    {
      id: "qualifications",
      label: "Certified copies of qualifications",
      description: `Gather original and certified copies of your ${categoryLabel} qualifications (degree, diploma, trade certificate, etc.).`,
    },
    {
      id: "passport-photos",
      label: "Passport photos",
      description:
        "Prepare the number and size of passport photos required by the Skills Certificate application form.",
    },
    {
      id: "police-record",
      label: "Police record / Certificate of character",
      description:
        "Obtain a recent police record (typically less than 6 months old) from your home country.",
    },
    {
      id: "medical-certificate",
      label: "Medical certificate",
      description:
        "Complete a medical examination and obtain the required health certificate.",
    },
    {
      id: "birth-certificate",
      label: "Birth certificate",
      description:
        "Provide an official birth certificate (original or certified copy).",
    },
    {
      id: "marriage-certificate",
      label: "Marriage certificate (if applicable)",
      description:
        "If married or divorced, provide relevant certificates to verify name changes.",
    },
    {
      id: "employment-contract",
      label: "Employment contract or job offer",
      description:
        "If you already have employment lined up, include your contract or offer letter.",
    },
    {
      id: "bank-statements",
      label: "Bank statements / Proof of funds",
      description:
        "Show you can support yourself initially (amount varies by country).",
    },
    {
      id: "skills-certificate-application",
      label: "CSME Skills Certificate application",
      description:
        "Complete and submit the Skills Certificate application to your home country's Competent Authority.",
    },
  ];
}

const TIMELINE = {
  documents:
    "2–6 weeks to gather documents, depending on processing time for police records and transcripts.",
  skillsCertificate:
    "2–8 weeks for Skills Certificate application processing, depending on the competent authority.",
  verification:
    "1–4 weeks for verification checks in the destination country after arrival, if required.",
};

const PLAN_NOTES =
  "Always verify requirements with official websites, as procedures and documents can change.";

function findCategory(
  categories: Category[],
  value: string | number
): Category | undefined {
  if (typeof value === "number" || /^\d+$/.test(String(value))) {
    const idNum = Number(value);
    return categories.find((c) => c.id === idNum);
  }
  return categories.find((c) => c.code === value);
}

function makePlanId(
  fromCode: string,
  toCode: string,
  categoryRef: string | number
): string {
  return createHash("sha256")
    .update(`${fromCode}|${toCode}|${categoryRef}`)
    .digest("hex")
    .slice(0, 12);
}

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => null);
    const { fromCountry, toCountry, category } = validatePlanRequest(body);

    const [countries, categories] = await Promise.all([
      readDataFile<Country[]>("countries.json"),
      readDataFile<Category[]>("categories.json"),
    ]);

    const fromC = countries.find((c) => c.code === fromCountry);
    const toC = countries.find((c) => c.code === toCountry);
    const cat = findCategory(categories, category);

    if (!fromC || !toC || !cat) {
      return apiError("Invalid country or category.", 400);
    }

    const planData = {
      summary: `This plan outlines the steps for a ${cat.label} moving from ${fromC.name} to ${toC.name} under the CSME Free Movement of Skills.`,
      notes: PLAN_NOTES,
      checklist: buildChecklist(cat.label),
      timeline: TIMELINE,
      officialLinks: {
        immigration: toC.immigrationUrl,
        competentAuthority: toC.competentAuthorityUrl,
        forms: toC.formsUrl,
      },
      planId: makePlanId(fromC.code, toC.code, category),
    };

    return apiSuccess(planData);
  } catch (err) {
    if (err instanceof ApiError) {
      return apiError(err.message, err.status);
    }
    console.error("POST /api/plan:", err);
    return apiError("Failed to generate plan.", 500);
  }
}
