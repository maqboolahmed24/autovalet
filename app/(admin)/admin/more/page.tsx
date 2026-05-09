import Link from "next/link";
import { AdminPageHeader } from "../../../../components/admin/AdminPageHeader";
import { adminMoreGroups } from "../../../../components/admin/adminNavigation";

export const metadata = {
  title: "More | AUTO VALET Admin",
  description: "AUTO VALET admin setup and account links.",
};

export default function AdminMorePage() {
  return (
    <div className="admin-page">
      <AdminPageHeader
        eyebrow="More"
        title="More"
        description="Setup, content and account tools for AUTO VALET operations."
      />

      <div className="admin-more-grid">
        {adminMoreGroups.map((group) => (
          <section
            className="admin-more-group"
            aria-labelledby={`more-${group.title.toLowerCase().replace(/\s+/g, "-")}`}
            key={group.title}
          >
            <h2 id={`more-${group.title.toLowerCase().replace(/\s+/g, "-")}`}>{group.title}</h2>
            <div className="admin-more-list">
              {group.items.map((item) => (
                <Link className="admin-more-link" href={item.href} key={item.href}>
                  <span>{item.label}</span>
                  {item.description ? <small>{item.description}</small> : null}
                </Link>
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
