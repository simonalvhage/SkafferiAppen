const BASE_URL = 'https://alvhage.se/api';
const GS1_URL = 'https://productsearch.gs1.se/foodservice';

export async function apiLogin(username, pin) {
  const response = await fetch(`${BASE_URL}/login.php`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: `username=${encodeURIComponent(username)}&pin=${encodeURIComponent(pin)}`,
  });
  return response.json();
}

export async function apiSignup(username, email, pin) {
  const response = await fetch(`${BASE_URL}/new.php`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: `username=${encodeURIComponent(username)}&email=${encodeURIComponent(email)}&pin=${encodeURIComponent(pin)}`,
  });
  return response.json();
}

export async function apiForgotPassword(email) {
  const response = await fetch(`${BASE_URL}/forgot.php`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: `email=${encodeURIComponent(email)}`,
  });
    const text = await response.text();
  try {
    return JSON.parse(text);
  } catch {
    console.error('Server response (not JSON):', text);
    throw new Error(`Server error (${response.status}): ${text.substring(0, 200)}`);
  }
}

export async function apiGetProducts(apiKey, list = null) {
  let url = `${BASE_URL}/get.php?api_key=${encodeURIComponent(apiKey)}`;
  if (list) url += `&list=${encodeURIComponent(list)}`;
  const response = await fetch(url);
  return response.json();
}

export async function apiGetProductByEAN(ean, apiKey = null) {
  let url = `${BASE_URL}/get.php?EAN=${encodeURIComponent(ean)}`;
  if (apiKey) url += `&api_key=${encodeURIComponent(apiKey)}`;
  const response = await fetch(url);
  return response.json();
}

export async function apiAddProduct(ean, product, apiKey, list = null) {
  let body = `EAN=${encodeURIComponent(ean)}&product=${encodeURIComponent(product)}&api_key=${encodeURIComponent(apiKey)}`;
  if (list) body += `&list=${encodeURIComponent(list)}`;
  const response = await fetch(`${BASE_URL}/post.php`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body,
  });
  return response.text();
}

export async function apiDeleteProduct(ean, apiKey, list = null) {
  let url = `${BASE_URL}/delete.php?EAN=${encodeURIComponent(ean)}&api_key=${encodeURIComponent(apiKey)}`;
  if (list) url += `&list=${encodeURIComponent(list)}`;
  const response = await fetch(url);
  return response.text();
}

export async function apiDeleteAllProducts(apiKey, list = null) {
  let url = `${BASE_URL}/delete.php?EAN=ALLPRODUCTS&api_key=${encodeURIComponent(apiKey)}`;
  if (list) url += `&list=${encodeURIComponent(list)}`;
  const response = await fetch(url);
  return response.text();
}

export async function apiDeleteUser(apiKey) {
  const response = await fetch(`${BASE_URL}/delete_user.php`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: `api_key=${encodeURIComponent(apiKey)}`,
  });
  return response.json();
}

export async function gs1Search(query) {
  const response = await fetch(`${GS1_URL}/tradeItem/search`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query, sortby: 0, sortDirection: 1 }),
  });
  return response.json();
}

export async function gs1GetThumbnailUrl(barcode) {
  try {
    const json = await gs1Search(barcode);
    if (json.results?.[0]?.thumbnail) {
      const thumbnailResponse = await fetch(
        `${GS1_URL}/asset/${json.results[0].thumbnail}`
      );
      return thumbnailResponse.url;
    }
  } catch (error) {
    console.warn('Could not fetch thumbnail:', error);
  }
  return null;
}
