import Link from "next/link";

export const metadata = {
  title: "Cookie Policy — Printboom",
};

export default function CookiesPage() {
  return (
    <main className="min-h-screen bg-[#0a0a0c] px-5 py-10 text-white">
      <div className="mx-auto max-w-3xl space-y-6 rounded-3xl border border-white/10 bg-[#111114] p-6 md:p-8">
        <Link href="/" className="text-sm text-neutral-400 hover:text-white">← Назад до конструктора</Link>
        <h1 className="text-2xl font-bold">Політика cookies</h1>
        <p className="text-sm text-neutral-400">Останнє оновлення: 23.05.2026</p>

        <section className="space-y-3 text-sm leading-6 text-neutral-300">
          <p>
            Ця політика пояснює, як Printboom використовує cookies, localStorage та подібні технології у відповідності до законодавства України про захист персональних даних.
          </p>

          <h2 className="text-lg font-semibold text-white">Що ми використовуємо</h2>
          <ul className="list-disc space-y-1 pl-5">
            <li><b>Необхідне зберігання:</b> localStorage для запамʼятовування налаштувань конструктора, онбордингу та факту закриття cookie-банера.</li>
            <li><b>Аналітика:</b> Vercel Web Analytics для агрегованої статистики відвідувань.</li>
            <li><b>Продуктивність:</b> Vercel Speed Insights для вимірювання швидкості завантаження та Core Web Vitals.</li>
          </ul>

          <h2 className="text-lg font-semibold text-white">Для чого це потрібно</h2>
          <p>
            Необхідні технології забезпечують роботу конструктора. Аналітичні та performance-дані допомагають знаходити проблеми швидкості, стабільності та покращувати сайт.
          </p>

          <h2 className="text-lg font-semibold text-white">Чи можна вимкнути</h2>
          <p>
            Ви можете обмежити cookies та схожі технології у налаштуваннях браузера. Частина функцій конструктора може працювати некоректно, якщо повністю заблокувати локальне зберігання даних.
          </p>

          <h2 className="text-lg font-semibold text-white">Термін дії</h2>
          <p>
            Запис про закриття cookie-банера зберігається у браузері до очищення localStorage. Аналітичні дані зберігаються згідно з політиками Vercel.
          </p>

          <h2 className="text-lg font-semibold text-white">Оновлення політики</h2>
          <p>
            Ми можемо оновлювати цю політику при зміні функцій сайту або сервісів аналітики. Актуальна версія завжди доступна на цій сторінці.
          </p>
        </section>
      </div>
    </main>
  );
}
