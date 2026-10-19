import type { ReactNode } from "react";
import { MacCloseButton } from "@/components/keyboard-rig";

// macOS-style window (traffic lights + centred title) wrapping the /home side panels; the red light
// closes the panel (brings the laptop back).
export function MacWindow({ title, children, className }: { title: ReactNode; children: ReactNode; className?: string }) {
  return (
    <section className={className ? `mac-window ${className}` : "mac-window"}>
      <div className="mac-titlebar">
        <span className="mac-lights"><MacCloseButton /><i aria-hidden="true" /><i aria-hidden="true" /></span>
        <h2 className="mac-title">{title}</h2>
      </div>
      <div className="mac-window-body">{children}</div>
    </section>
  );
}
