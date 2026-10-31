import type { SVGProps } from "react";
type Name = "search" | "chat" | "plus" | "user" | "market";
const paths: Record<Name, React.ReactNode> = {
  search: (
    <>
      <circle cx="10.5" cy="10.5" r="6.5" />
      <path d="m16 16 4.5 4.5" />
    </>
  ),
  chat: (
    <path d="M20 11.5a8 8 0 0 1-8 8H5l-3 2v-10a9 9 0 0 1 18 0Z M7 11h.01 M12 11h.01 M17 11h.01" />
  ),
  plus: <path d="M12 5v14M5 12h14" />,
  user: (
    <>
      <circle cx="12" cy="8" r="4" />
      <path d="M4 21v-2a8 8 0 0 1 16 0v2" />
    </>
  ),
  market: (
    <>
      <path d="M4 8h16l-1 13H5L4 8Z" />
      <path d="M8 8V6a4 4 0 0 1 8 0v2M9 12v1a3 3 0 0 0 6 0v-1" />
    </>
  ),
};
export default function Icon({
  name,
  ...props
}: SVGProps<SVGSVGElement> & { name: Name }) {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      {paths[name]}
    </svg>
  );
}
