/// <reference types="vite/client" />
import type { EnforceRequest, EnforceResponse, ScanConfig, ScanResponse } from "./types";

const BASE = import.meta.env.VITE_API_BASE ?? "/api";
const SCAN_ENDPOINT = `${BASE}/scan`;
const ENFORCE_ENDPOINT = `${BASE}/enforce`;

function authHeaders(token: string | null): Record<string, string> {
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (token) headers["Authorization"] = `Bearer ${token}`;
  return headers;
}

async function errorMessage(response: Response, fallback: string): Promise<string> {
  const text = await response.text();
  try {
    const detail = JSON.parse(text).detail;
    if (typeof detail === "string") return detail;
  } catch {}
  return text || fallback;
}

export async function submitScan(config: ScanConfig, token: string | null = null): Promise<{ scan_id: string; status: string }> {
  const response = await fetch(SCAN_ENDPOINT, {
    method: "POST",
    headers: authHeaders(token),
    body: JSON.stringify(config),
  });

  if (!response.ok) {
    throw new Error(await errorMessage(response, "Scan request failed"));
  }

  return response.json();
}

export async function pollScan(scanId: string, token: string | null, maxMs = 600_000): Promise<any> {
  const start = Date.now();
  while (Date.now() - start < maxMs) {
    const scan = await getScan(scanId, token);
    if (scan.status === "complete" || scan.status === "failed") return scan;
    await new Promise((r) => setTimeout(r, 3000));
  }
  throw new Error("Scan timed out");
}

// Legacy sync wrapper
export async function runScan(config: ScanConfig, token: string | null = null): Promise<ScanResponse> {
  const { scan_id, status, ...rest } = await submitScan(config, token);
  if (status === "complete" && (rest as any).summary) return rest as unknown as ScanResponse;
  const result = await pollScan(scan_id, token);
  return result as ScanResponse;
}

export async function runEnforce(payload: EnforceRequest, token: string | null = null): Promise<EnforceResponse> {
  const response = await fetch(ENFORCE_ENDPOINT, {
    method: "POST",
    headers: authHeaders(token),
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error(await errorMessage(response, "Enforcement request failed"));
  }

  return (await response.json()) as EnforceResponse;
}

// ── Scans ──

export async function listScans(token: string | null): Promise<any[]> {
  const res = await fetch(`${BASE}/scans`, { headers: authHeaders(token) });
  if (!res.ok) throw new Error("Failed to fetch scans");
  return res.json();
}

export async function getScan(scanId: string, token: string | null): Promise<any> {
  const res = await fetch(`${BASE}/scans/${scanId}`, { headers: authHeaders(token) });
  if (!res.ok) throw new Error("Scan not found");
  return res.json();
}

// ── Layers ──

export async function createLayer(data: any, token: string | null): Promise<{ layer_id: string }> {
  const res = await fetch(`${BASE}/layers`, {
    method: "POST",
    headers: authHeaders(token),
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function listLayers(token: string | null): Promise<any[]> {
  const res = await fetch(`${BASE}/layers`, { headers: authHeaders(token) });
  if (!res.ok) throw new Error("Failed to fetch layers");
  return res.json();
}

export async function getLayer(layerId: string, token: string | null): Promise<any> {
  const res = await fetch(`${BASE}/layers/${layerId}`, { headers: authHeaders(token) });
  if (!res.ok) throw new Error("Layer not found");
  return res.json();
}

export async function updateLayer(layerId: string, data: any, token: string | null): Promise<void> {
  const res = await fetch(`${BASE}/layers/${layerId}`, {
    method: "PUT",
    headers: authHeaders(token),
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error(await res.text());
}

export async function deleteLayer(layerId: string, token: string | null): Promise<void> {
  const res = await fetch(`${BASE}/layers/${layerId}`, {
    method: "DELETE",
    headers: authHeaders(token),
  });
  if (!res.ok) throw new Error("Failed to delete layer");
}

export async function listLayerRequests(layerId: string, token: string | null): Promise<any[]> {
  const res = await fetch(`${BASE}/layers/${layerId}/requests`, { headers: authHeaders(token) });
  if (!res.ok) throw new Error("Failed to fetch requests");
  return res.json();
}

// ── Usage ──

export async function getUsage(token: string | null): Promise<{ plan: string; monthly_tests_used: number; monthly_tests_limit: number }> {
  const res = await fetch(`${BASE}/usage`, { headers: authHeaders(token) });
  if (!res.ok) throw new Error("Failed to fetch usage");
  return res.json();
}

// ── Reports ──

export function getScanReportUrl(scanId: string): string {
  return `${BASE}/scans/${scanId}/report.pdf`;
}
