import UploadFaq from '../components/UploadFaq';

export default function KnowledgebasePage() {
  return (
    <main className="p-8">
      <h1 className="text-2xl font-bold mb-4">📚 Knowledgebase</h1>
      <p className="text-gray-600 mb-6">Upload or update the leasing FAQ used by the AI assistant.</p>
      <UploadFaq />
    </main>
  );
}
