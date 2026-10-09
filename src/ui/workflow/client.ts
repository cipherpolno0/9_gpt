export async function sendJson(path: string, data: object) {
  const response = await fetch(path, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
    cache: "no-store",
  });
  const body = await response.json();
  if (!response.ok) throw new Error(body.error ?? "บันทึกไม่ได้");
  return body;
}
// Retain a key on unknown network failure; changing the body creates a new operation.
export function operationKey(
  ref: { current: { body: string; key: string } | null },
  body: object,
) {
  const serialized = JSON.stringify(body);
  if (ref.current?.body !== serialized)
    ref.current = { body: serialized, key: crypto.randomUUID() };
  return ref.current!.key;
}
