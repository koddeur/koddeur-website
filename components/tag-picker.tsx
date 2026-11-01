"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import { Bi } from "@/components/i18n";

export type TagPickerItem = { keyword: string; count: number; href: string };

// Tag filter on /blog: a native <details> menu, closed on outside tap, Escape or choosing a tag.
export function TagPicker({ items, active, resetHref }: { items: TagPickerItem[]; active?: string; resetHref: string }) {
  const ref = useRef<HTMLDetailsElement>(null);

  useEffect(() => {
    const close = () => { if (ref.current) ref.current.open = false; };
    const onPointerDown = (event: PointerEvent) => { if (!ref.current?.contains(event.target as Node)) close(); };
    const onKeyDown = (event: KeyboardEvent) => { if (event.key === "Escape") close(); };
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, []);

  const close = () => { if (ref.current) ref.current.open = false; };

  return (
    <details className="tag-picker" ref={ref}>
      <summary className={active ? "active" : undefined}>
        {active ? `#${active}` : "Tags"}
        <span className="tag-picker-chevron" aria-hidden="true" />
      </summary>
      <div className="tag-picker-menu">
        <Link href={resetHref} onClick={close} className={active ? undefined : "active"}><Bi fr="Tous les articles" en="All articles" /></Link>
        {items.map((item) => (
          <Link key={item.keyword} href={item.href} onClick={close} className={active === item.keyword ? "active" : undefined}>
            #{item.keyword} <span className="tag-count">{item.count}</span>
          </Link>
        ))}
      </div>
    </details>
  );
}
