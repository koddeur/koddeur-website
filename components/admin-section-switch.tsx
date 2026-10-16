import Link from "next/link";

export function AdminSectionSwitch({ active }: { active: "articles" | "projects" | "messages" }) {
  return (
    <div className="admin-switch" role="tablist" aria-label="Section admin">
      <Link href="/admin" role="tab" aria-selected={active === "articles"} className={active === "articles" ? "admin-switch-tab active" : "admin-switch-tab"}>
        Articles
      </Link>
      <Link href="/admin/projects" role="tab" aria-selected={active === "projects"} className={active === "projects" ? "admin-switch-tab active" : "admin-switch-tab"}>
        Projets
      </Link>
      <Link href="/admin/messages" role="tab" aria-selected={active === "messages"} className={active === "messages" ? "admin-switch-tab active" : "admin-switch-tab"}>
        Messages
      </Link>
    </div>
  );
}
