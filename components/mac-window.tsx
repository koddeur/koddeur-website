import type { ReactNode } from "react";

// macOS-style window (traffic lights + centred title) wrapping the /home side panels.
export function MacWindow({ title, children, className }: { title: ReactNode; children: ReactNode; className?: string }) {
  return (
    <section className={className ? `mac-window ${className}` : "mac-window"}>
      <div className="mac-titlebar">
        <span className="mac-lights" aria-hidden="true"><i /><i /><i /></span>
        <h2 className="mac-title">{title}</h2>
      </div>
      <div className="mac-window-body">{children}</div>
    </section>
  );
}
