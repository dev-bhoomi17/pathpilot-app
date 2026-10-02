export async function generateJourney(profile) {
  const response = await fetch("/api/generate-journey", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(profile),
  });

  const data = await response.json();

  if (!response.ok || !data.success) {
    throw new Error(
      data?.error || "Failed to generate your journey."
    );
  }

  return data.roadmap;
}