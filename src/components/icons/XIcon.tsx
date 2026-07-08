import type { SVGProps } from "react";

export function XIcon({ className, ...props }: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      className={className}
      {...props}
    >
      <path d="M18.244 2H21.5l-7.5 8.575L22.5 22h-6.844l-5.36-6.997L4.16 22H.9l8.02-9.169L1.5 2h7.02l4.85 6.41L18.244 2Zm-1.2 18h1.9L7.05 4H5.05l11.994 16Z" />
    </svg>
  );
}
