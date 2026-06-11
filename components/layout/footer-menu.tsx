import { getTranslations } from "next-intl/server";
import { Menu } from "lib/shopify/types";
import FooterMenuClient from "./footer-menu-client";

export default async function FooterMenu({ menu }: { menu: Menu[] }) {
  if (!menu.length) return null;

  const t = await getTranslations("Footer");

  return (
    <nav>
      <p className="eyebrow mb-4">{t("explore")}</p>
      <FooterMenuClient menu={menu} />
    </nav>
  );
}
