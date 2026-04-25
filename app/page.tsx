import Dashboard from "@/components/Dashboard";
import { fetchKojimaResults } from "@/lib/csv";

export const revalidate = 3600;

export default async function Home() {
  const data = await fetchKojimaResults();

  if (data.length === 0) {
    return (
      <main className="min-h-screen bg-gray-900 text-white p-4 max-w-3xl mx-auto">
        <h1 className="text-xl font-bold text-center mb-6 text-yellow-400">
          児島ボートレース 予測システム
        </h1>
        <div className="rounded-lg border border-red-700 bg-red-900/30 p-4 text-center">
          <p className="font-bold mb-2">データを取得できませんでした</p>
          <p className="text-sm text-gray-300">
            時間をおいて再度アクセスしてください。
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-900 text-white p-4 max-w-3xl mx-auto">
      <h1 className="text-xl font-bold text-center mb-2 text-yellow-400">
        児島ボートレース 予測システム
      </h1>
      <p className="text-center text-xs text-gray-400 mb-6">
        データソース: kojima_results.csv（GitHub raw 経由 / 1時間キャッシュ）
      </p>
      <Dashboard data={data} />
    </main>
  );
}
