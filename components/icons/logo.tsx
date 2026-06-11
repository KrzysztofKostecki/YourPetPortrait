import clsx from "clsx";

export default function LogoIcon(props: React.ComponentProps<"svg">) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      viewBox="0 0 40 40"
      fill="none"
      {...props}
    >
      <rect
        x="4"
        y="4"
        width="32"
        height="32"
        rx="2"
        className="stroke-current"
        strokeWidth="1.5"
      />
      <rect
        x="8"
        y="8"
        width="24"
        height="24"
        rx="1"
        className="stroke-current opacity-50"
        strokeWidth="1"
      />
      <path
        d="M20 14.5C17.5 14.5 16 16.2 16 18.2C16 20.8 18.2 22.5 20 24.5C21.8 22.5 24 20.8 24 18.2C24 16.2 22.5 14.5 20 14.5Z"
        className="fill-current"
      />
      <circle cx="17.5" cy="17.5" r="0.75" className="fill-current" />
      <circle cx="22.5" cy="17.5" r="0.75" className="fill-current" />
      <path
        d="M17 26.5C17.8 27.3 18.8 27.8 20 27.8C21.2 27.8 22.2 27.3 23 26.5"
        className="stroke-current"
        strokeWidth="1.2"
        strokeLinecap="round"
      />
    </svg>
  );
}
