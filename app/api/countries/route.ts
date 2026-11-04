import { apiSuccess, handleRouteError, readDataFile, type Country } from "@/lib/api";

export async function GET() {
  try {
    const countries = await readDataFile<Country[]>("countries.json");
    return apiSuccess(countries);
  } catch (err) {
    return handleRouteError(err, "GET /api/countries", "Failed to load data");
  }
}
