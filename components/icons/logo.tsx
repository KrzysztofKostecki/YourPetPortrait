export default function LogoIcon(props: React.ComponentProps<"svg">) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      viewBox="0 0 48 48"
      fill="none"
      {...props}
    >
      {/* Cameo frame */}
      <ellipse
        cx="24"
        cy="24"
        rx="16.5"
        ry="20.5"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <ellipse
        cx="24"
        cy="24"
        rx="13.8"
        ry="17.8"
        stroke="currentColor"
        strokeWidth="0.9"
        opacity="0.45"
      />
      {/* Dog bust in profile, eye as a cutout */}
      <path
        d="M13 26.5
           C13.2 25.4 14.8 23.4 18 21.5
           C19 20.9 20.3 19.9 21.5 18
           C22.2 15.5 23 12.8 24 11
           C25 12.8 26.2 15.6 27 17.5
           C28 18.3 29.5 19.5 30.2 21
           C31.5 23.5 32.6 26.5 33 30
           C33.2 32 32.8 34 31.5 35
           C27 36.5 21 36.5 18 35
           C16.8 33.4 15.6 30.4 15 28.5
           C14.4 27.6 13.6 27 13 26.5
           Z
           M20.55 23.4
           a0.95 0.95 0 1 1 -1.9 0
           a0.95 0.95 0 1 1 1.9 0
           Z"
        fill="currentColor"
        fillRule="evenodd"
      />
      {/* Preview sparkle */}
      <path
        d="M30.5 10.8
           Q31 12.2 32.4 12.7
           Q31 13.2 30.5 14.6
           Q30 13.2 28.6 12.7
           Q30 12.2 30.5 10.8
           Z"
        fill="currentColor"
        opacity="0.7"
      />
    </svg>
  );
}
