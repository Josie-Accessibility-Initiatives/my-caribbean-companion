import {
  apiError,
  apiSuccess,
  ApiError,
  readDataFile,
  type Category,
} from "@/lib/api";

export async function GET() {
  try {
    const categories = await readDataFile<Category[]>("categories.json");
    return apiSuccess(categories);
  } catch (err) {
    if (err instanceof ApiError) {
      return apiError(err.message, err.status);
    }
    console.error("GET /api/categories:", err);
    return apiError("Failed to load data", 500);
  }
}
