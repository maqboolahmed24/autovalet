import { EmptyState } from "../../components/ui/EmptyState";

export default function PublicNotFound() {
  return (
    <EmptyState
      eyebrow="Not found"
      title="Page not found."
      description="The page you are looking for is not available."
      action={{
        href: "/",
        label: "Back to home",
      }}
    />
  );
}
