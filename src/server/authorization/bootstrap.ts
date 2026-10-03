/** ยังไม่มีAuth/grantsในบท05 ปิดพื้นที่ทำงานทุกmethodด้วยserver response */
export function workspaceUnavailable() {
  return new Response("ยังไม่เปิดพื้นที่ทำงาน กรุณาติดตามประกาศจากหน้าแรก", {
    status: 403,
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "no-store",
    },
  });
}
