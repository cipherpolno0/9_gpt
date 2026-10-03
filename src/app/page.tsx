import { Button } from "@/shared/components/ui/button";

export default function Home() {
  return (
    <>
      <header className="border-b border-border bg-white px-5 py-6">
        <div className="mx-auto max-w-4xl font-semibold">
          กองบริหารทะเบียนและวัดผล
        </div>
      </header>
      <main
        id="main-content"
        tabIndex={-1}
        className="mx-auto max-w-4xl px-5 py-14"
      >
        <p className="mb-3 font-semibold text-primary">
          ศูนย์ข้อมูลคณะสงฆ์และการศึกษา
        </p>
        <h1 className="max-w-3xl text-3xl leading-relaxed font-semibold sm:text-4xl">
          เว็บไซต์กองบริหารทะเบียนและวัดผล
        </h1>
        <p className="mt-5 max-w-2xl text-lg leading-relaxed text-muted-foreground">
          เว็บไซต์อยู่ระหว่างจัดเตรียมบริการสำหรับงานการศึกษาและการปกครองคณะสงฆ์
          ข้อมูลการเปิดใช้งานจะประกาศที่นี่
        </p>
        <section
          id="announcements"
          aria-labelledby="announcements-title"
          className="mt-10 rounded-xl border border-border bg-white p-6"
        >
          <h2 id="announcements-title" className="text-xl font-semibold">
            ข่าวประกาศ
          </h2>
          <p className="mt-3 text-muted-foreground">ยังไม่มีประกาศ</p>
        </section>
        <Button asChild className="mt-6">
          <a href="#announcements">ดูข่าวประกาศ</a>
        </Button>
      </main>
      <footer className="border-t border-border px-5 py-6 text-center text-sm text-muted-foreground">
        เว็บไซต์กองบริหารทะเบียนและวัดผล
      </footer>
    </>
  );
}
