export function scrollToHashLink(e: React.MouseEvent<HTMLAnchorElement>, href: string) {
  if (typeof window === "undefined" || window.location.pathname !== "/") return;
  const hashIndex = href.indexOf("#");
  if (hashIndex === -1) return;
  const id = href.slice(hashIndex + 1);
  const el = document.getElementById(id);
  if (!el) return;
  e.preventDefault();
  el.scrollIntoView({ behavior: "smooth", block: "start" });
  window.history.replaceState(null, "", `/#${id}`);
}
