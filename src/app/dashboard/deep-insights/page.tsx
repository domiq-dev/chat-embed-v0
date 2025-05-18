import { Suspense } from "react";
import ClientRecordModal from "./ClientRecordModal";
import DeepInsightsTable from "../components/DeepInsightsTable";

export default function DeepInsightsPage() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Deep Insights</h1>
      <DeepInsightsTable />
        <Suspense fallback={null}>
        <ClientRecordModal />
      </Suspense>
    </div>
  );
}
