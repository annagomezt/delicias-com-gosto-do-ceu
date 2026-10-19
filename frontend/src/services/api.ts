const API_URL =
  import.meta.env.VITE_API_URL;

export async function apiRequest(
  endpoint: string,
  options?: RequestInit
) {
  const token =
    localStorage.getItem(
      "dgc_admin_token"
    );

  const headers: Record<
    string,
    string
  > = {
    "Content-Type":
      "application/json"
  };

  if (token) {
    headers.Authorization =
      `Bearer ${token}`;
  }

  const response = await fetch(
    `${API_URL}${endpoint}`,
    {
      ...options,
      headers
    }
  );

  const data =
    await response.json();

  if (!response.ok) {
    if (response.status === 401) {
      localStorage.removeItem(
        "dgc_admin_token"
      );
    }

    throw new Error(
      data.message ||
        "Ocorreu um erro na comunicação com o servidor."
    );
  }

  return data;
}