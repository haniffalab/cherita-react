export async function fetchData(endpoint, params, signal = null) {
  const apiUrl = process.env.REACT_APP_API_URL;
  const response = await fetch(
    new URL(endpoint, apiUrl),
    {
      method: "POST",
      mode: "cors",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(params),
      signal: signal,
    }
  );
  if (!response.ok) {
    throw response;
  }
  return await response.json();
}
