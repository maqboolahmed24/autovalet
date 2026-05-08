import { EmptyState } from "../../../components/ui/EmptyState";

export default function AdminNotFound() {
  return (
    <EmptyState
      eyebrow="Admin"
      title="Admin page not found."
      description="This admin screen is not available. Use the admin navigation to return to an existing tool."
      action={{
        href: "/admin",
        label: "Back to Today",
      }}
    />
  );
}
