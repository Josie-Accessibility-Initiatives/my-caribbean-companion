import {
  apiError,
  apiSuccess,
  ApiError,
  readDataFile,
  type Country,
} from "@/lib/api";

export async function GET() {
  try {
    const countries = await readDataFile<Country[]>("countries.json");
    return apiSuccess(countries);
  } catch (err) {
    if (err instanceof ApiError) {
      return apiError(err.message, err.status);
    }
    console.error("GET /api/countries:", err);
    return apiError("Failed to load data", 500);
  }
}
