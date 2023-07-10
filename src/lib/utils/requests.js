export async function fetchData(endpoint, params) {
  const response = await fetch(
    new URL(endpoint, import.meta.env.VITE_API_URL),
    {
      method: "POST",
      mode: "cors",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(params),
    }
  );
  if (!response.ok) {
    throw response;
  }
  return await response.json();
}
