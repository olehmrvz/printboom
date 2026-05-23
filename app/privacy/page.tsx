import Link from "next/link";

export const metadata = {
  title: "Privacy Policy — Printboom",
};

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-[#0a0a0c] px-5 py-10 text-white">
      <div className="mx-auto max-w-3xl space-y-6 rounded-3xl border border-white/10 bg-[#111114] p-6 md:p-8">
        <Link href="/" className="text-sm text-neutral-400 hover:text-white">← Назад до конструктора</Link>
        <h1 className="text-2xl font-bold">Політика конфіденційності</h1>
        <p className="text-sm text-neutral-400">Останнє оновлення: 23.05.2026</p>

        <section className="space-y-3 text-sm leading-6 text-neutral-300">
          <p>
            Printboom поважає приватність користувачів та обробляє персональні дані відповідно до Закону України «Про захист персональних даних».
          </p>
          <h2 className="text-lg font-semibold text-white">Які дані ми обробляємо</h2>
          <ul className="list-disc space-y-1 pl-5">
            <li>Instagram-нік, який ви вводите для оформлення замовлення.</li>
            <li>Завантажені вами фото та згенерований PDF-макет для друку.</li>
            <li>Технічні дані: тип пристрою, браузер, приблизна країна/регіон, швидкість завантаження сторінки, події перегляду сторінок.</li>
          </ul>

          <h2 className="text-lg font-semibold text-white">Для чого використовуються дані</h2>
          <ul className="list-disc space-y-1 pl-5">
            <li>Для створення та передачі макету на друк.</li>
            <li>Для звʼязку із замовником через Instagram за вказаним ніком.</li>
            <li>Для вимірювання стабільності, швидкості та зручності сайту за допомогою Vercel Web Analytics і Vercel Speed Insights.</li>
          </ul>

          <h2 className="text-lg font-semibold text-white">Аналітика</h2>
          <p>
            Ми використовуємо Vercel Web Analytics та Vercel Speed Insights. Ці сервіси допомагають бачити агреговану статистику відвідувань і продуктивності сайту. Ми не використовуємо ці дані для продажу, реклами або створення детальних маркетингових профілів.
          </p>

          <h2 className="text-lg font-semibold text-white">Передача третім сторонам</h2>
          <p>
            Макет і нік можуть передаватися у Telegram-чат менеджера/виробництва для виконання замовлення. Технічні аналітичні дані обробляються сервісами Vercel. Ми не продаємо персональні дані третім особам.
          </p>

          <h2 className="text-lg font-semibold text-white">Зберігання даних</h2>
          <p>
            Дані зберігаються лише стільки, скільки потрібно для обробки замовлення, підтримки сервісу та виконання законних інтересів бізнесу.
          </p>

          <h2 className="text-lg font-semibold text-white">Ваші права</h2>
          <p>
            Ви можете звернутися до нас із запитом на доступ, уточнення або видалення ваших персональних даних, якщо це не суперечить вимогам законодавства та необхідності виконання замовлення.
          </p>

          <h2 className="text-lg font-semibold text-white">Контакти</h2>
          <p>
            Для питань щодо приватності звертайтесь до Printboom через офіційний Instagram або канал звʼязку, вказаний на сайті/у профілі бренду.
          </p>
        </section>
      </div>
    </main>
  );
}
