"use client";

import clsx from "clsx";
import { Link } from "i18n/navigation";
import { Menu } from "lib/shopify/types";
import { usePathname } from "i18n/navigation";
import { useEffect, useState } from "react";

export function FooterMenuItem({ item }: { item: Menu }) {
  const pathname = usePathname();
  const [active, setActive] = useState(pathname === item.path);

  useEffect(() => {
    setActive(pathname === item.path);
  }, [pathname, item.path]);

  return (
    <li>
      <Link
        href={item.path}
        className={clsx(
          "block text-sm text-ink-muted transition hover:text-accent dark:text-canvas/70 dark:hover:text-gold-soft",
          {
            "text-accent dark:text-gold-soft": active,
          },
        )}
      >
        {item.title}
      </Link>
    </li>
  );
}

export default function FooterMenuClient({ menu }: { menu: Menu[] }) {
  return (
    <ul className="space-y-3">
      {menu.map((item: Menu) => {
        return <FooterMenuItem key={item.title} item={item} />;
      })}
    </ul>
  );
}
