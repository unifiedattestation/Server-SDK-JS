export type BackendInfo = {
  backendId: string;
  publicKeys: Array<{ kid: string; alg: string; publicKey: string }>;
};

export type DecodeTokenResponse = {
  verdict: { isTrusted: boolean; reasonCodes: string[] };
  requestHash: string;
  claims: {
    iss: string;
    projectId: string;
    requestHash: string;
    app: { packageName: string; signerDigests: string[] };
    deviceIntegrity: Record<string, unknown>;
  };
};

export async function getBackendInfo(baseUrl: string): Promise<BackendInfo> {
  const res = await fetch(normalize(baseUrl) + "/api/v1/info");
  if (!res.ok) {
    throw new Error(`Backend info failed: ${res.status}`);
  }
  return res.json();
}

export async function decodeToken(params: {
  baseUrl: string;
  apiSecret: string;
  projectId: string;
  token: string;
  expectedRequestHash?: string;
}): Promise<DecodeTokenResponse> {
  const res = await fetch(normalize(params.baseUrl) + "/api/v1/app/decodeToken", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-ua-api-secret": params.apiSecret
    },
    body: JSON.stringify({
      projectId: params.projectId,
      token: params.token,
      expectedRequestHash: params.expectedRequestHash
    })
  });
  const raw = await res.text();
  if (!res.ok) {
    throw new Error(raw);
  }
  return JSON.parse(raw) as DecodeTokenResponse;
}

export async function getTrustedBackends(baseUrl: string): Promise<string[]> {
  const res = await fetch(normalize(baseUrl) + "/api/v1/info/trusted-backends");
  if (!res.ok) {
    throw new Error(`Trusted backends failed: ${res.status}`);
  }
  const data = (await res.json()) as { backendIds?: string[] };
  return data.backendIds || [];
}

function normalize(baseUrl: string): string {
  return baseUrl.endsWith("/") ? baseUrl.slice(0, -1) : baseUrl;
}
