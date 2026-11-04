import { apiSuccess, handleRouteError, readDataFile, type Category } from "@/lib/api";

export async function GET() {
  try {
    const categories = await readDataFile<Category[]>("categories.json");
    return apiSuccess(categories);
  } catch (err) {
    return handleRouteError(err, "GET /api/categories", "Failed to load data");
  }
}
