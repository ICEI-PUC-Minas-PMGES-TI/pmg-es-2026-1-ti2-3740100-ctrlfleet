const iconMap = {
  alert: (
    <path
      d="M12 8.5v4m0 4h.01M5.8 18h12.4c1.1 0 1.8-1.2 1.2-2.2L13.2 5.2c-.5-.9-1.9-.9-2.4 0L4.6 15.8c-.6 1 .1 2.2 1.2 2.2Z"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.8"
    />
  ),
  calendar: (
    <>
      <rect
        fill="none"
        height="14"
        rx="2.2"
        stroke="currentColor"
        strokeWidth="1.8"
        width="16"
        x="4"
        y="6"
      />
      <path d="M8 3.5v5M16 3.5v5M4 10.5h16" fill="none" stroke="currentColor" strokeWidth="1.8" />
    </>
  ),
  chart: (
    <>
      <path d="M4 19.5h16" fill="none" stroke="currentColor" strokeLinecap="round" strokeWidth="1.8" />
      <path d="M7 15v-4M12 15V8M17 15v-7" fill="none" stroke="currentColor" strokeLinecap="round" strokeWidth="1.8" />
    </>
  ),
  check: (
    <path
      d="m5.5 12.5 4 4 9-10"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.8"
    />
  ),
  chevronDown: (
    <path
      d="m7 10 5 5 5-5"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.8"
    />
  ),
  chevronLeft: (
    <path
      d="m14.5 6-6 6 6 6"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.8"
    />
  ),
  chevronRight: (
    <path
      d="m9.5 6 6 6-6 6"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.8"
    />
  ),
  clipboard: (
    <>
      <rect
        fill="none"
        height="15"
        rx="2.1"
        stroke="currentColor"
        strokeWidth="1.8"
        width="12"
        x="6"
        y="5.5"
      />
      <path
        d="M9 5.5V4.8C9 3.8 9.8 3 10.8 3h2.4C14.2 3 15 3.8 15 4.8v.7M9 11h6M9 15h4"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeWidth="1.8"
      />
    </>
  ),
  close: (
    <path
      d="m6 6 12 12M18 6 6 18"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.8"
    />
  ),
  dashboard: (
    <>
      <rect fill="none" height="6.5" rx="1.5" stroke="currentColor" strokeWidth="1.8" width="6.5" x="4" y="4" />
      <rect fill="none" height="6.5" rx="1.5" stroke="currentColor" strokeWidth="1.8" width="6.5" x="13.5" y="4" />
      <rect fill="none" height="6.5" rx="1.5" stroke="currentColor" strokeWidth="1.8" width="6.5" x="4" y="13.5" />
      <rect fill="none" height="6.5" rx="1.5" stroke="currentColor" strokeWidth="1.8" width="6.5" x="13.5" y="13.5" />
    </>
  ),
  document: (
    <>
      <path
        d="M8 3.8h5.7L18.5 8v12.2c0 .5-.4.8-.8.8H8c-.5 0-.8-.4-.8-.8V4.6c0-.4.3-.8.8-.8Z"
        fill="none"
        stroke="currentColor"
        strokeLinejoin="round"
        strokeWidth="1.8"
      />
      <path d="M13.5 3.8v4.1h4.1M9.6 12h4.8M9.6 16h6.8" fill="none" stroke="currentColor" strokeLinecap="round" strokeWidth="1.8" />
    </>
  ),
  edit: (
    <>
      <path
        d="m4.8 16.8-.8 3.2 3.2-.8 9.3-9.3-2.4-2.4-9.3 9.3Z"
        fill="none"
        stroke="currentColor"
        strokeLinejoin="round"
        strokeWidth="1.8"
      />
      <path d="m12.8 6.8 2.4 2.4M4.8 16.8l2.4 2.4" fill="none" stroke="currentColor" strokeLinecap="round" strokeWidth="1.8" />
    </>
  ),
  eye: (
    <>
      <path
        d="M2.8 12s3.3-5.5 9.2-5.5 9.2 5.5 9.2 5.5-3.3 5.5-9.2 5.5S2.8 12 2.8 12Z"
        fill="none"
        stroke="currentColor"
        strokeLinejoin="round"
        strokeWidth="1.8"
      />
      <circle cx="12" cy="12" fill="none" r="2.8" stroke="currentColor" strokeWidth="1.8" />
    </>
  ),
  fleet: (
    <>
      <path
        d="M4.2 13.5 6 8.8c.3-.8 1.1-1.3 2-1.3h8c.9 0 1.7.5 2 1.3l1.8 4.7"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.8"
      />
      <rect fill="none" height="4.6" rx="1.8" stroke="currentColor" strokeWidth="1.8" width="17.6" x="3.2" y="12.2" />
      <path d="M6.8 16.8v1.7M17.2 16.8v1.7M7.5 10.7h9" fill="none" stroke="currentColor" strokeLinecap="round" strokeWidth="1.8" />
    </>
  ),
  logout: (
    <>
      <path d="M10 5H6a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h4" fill="none" stroke="currentColor" strokeLinecap="round" strokeWidth="1.8" />
      <path d="m13 8 4 4-4 4M8 12h9" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" />
    </>
  ),
  maintenance: (
    <path
      d="m13.8 4.3 5.9 5.9-2.1 2.1-5.9-5.9a3.5 3.5 0 1 0-4.9 4.9l5.9 5.9-2.1 2.1-5.9-5.9a6.5 6.5 0 1 1 9.1-9.1Z"
      fill="none"
      stroke="currentColor"
      strokeLinejoin="round"
      strokeWidth="1.8"
    />
  ),
  menu: (
    <path
      d="M4 7h16M4 12h16M4 17h16"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeWidth="1.8"
    />
  ),
  plus: (
    <path
      d="M12 5v14M5 12h14"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeWidth="1.8"
    />
  ),
  preventive: (
    <>
      <circle cx="12" cy="12" fill="none" r="8.5" stroke="currentColor" strokeWidth="1.8" />
      <path d="M12 7.5v5l3.5 2" fill="none" stroke="currentColor" strokeLinecap="round" strokeWidth="1.8" />
    </>
  ),
  reports: (
    <>
      <path
        d="M7 4.5h10c1.1 0 2 .9 2 2v11c0 1.1-.9 2-2 2H7c-1.1 0-2-.9-2-2v-11c0-1.1.9-2 2-2Z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
      />
      <path d="M8.5 15.5h7M8.5 12h7M8.5 8.5h4" fill="none" stroke="currentColor" strokeLinecap="round" strokeWidth="1.8" />
    </>
  ),
  reservations: (
    <>
      <path
        d="M7 5.5h10a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2v-9a2 2 0 0 1 2-2Z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
      />
      <path d="M5 9.5h14M9 3.8v3.4M15 3.8v3.4" fill="none" stroke="currentColor" strokeLinecap="round" strokeWidth="1.8" />
    </>
  ),
  search: (
    <>
      <circle cx="11" cy="11" fill="none" r="6" stroke="currentColor" strokeWidth="1.8" />
      <path d="m16 16 4 4" fill="none" stroke="currentColor" strokeLinecap="round" strokeWidth="1.8" />
    </>
  ),
  shield: (
    <path
      d="M12 3.8 18 6v5.4c0 4.3-2.7 7-6 8.8-3.3-1.8-6-4.5-6-8.8V6l6-2.2Z"
      fill="none"
      stroke="currentColor"
      strokeLinejoin="round"
      strokeWidth="1.8"
    />
  ),
  steering: (
    <>
      <circle cx="12" cy="12" fill="none" r="7.8" stroke="currentColor" strokeWidth="1.8" />
      <circle cx="12" cy="12" fill="none" r="2.2" stroke="currentColor" strokeWidth="1.8" />
      <path d="M4.8 11.2h14.4M8.2 18.3l2.6-4.8M15.8 18.3l-2.6-4.8" fill="none" stroke="currentColor" strokeLinecap="round" strokeWidth="1.8" />
    </>
  ),
  users: (
    <>
      <circle cx="9" cy="9.5" fill="none" r="3" stroke="currentColor" strokeWidth="1.8" />
      <path d="M4.5 18c.7-2.5 2.8-4 5.5-4s4.8 1.5 5.5 4M17.2 8.1c1.6.3 2.8 1.7 2.8 3.4 0 1.6-1.2 3-2.8 3.4M17.7 18c-.3-1.3-1-2.4-2-3.2" fill="none" stroke="currentColor" strokeLinecap="round" strokeWidth="1.8" />
    </>
  ),
};

export function Icon({ className, name }) {
  return (
    <svg
      aria-hidden="true"
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
    >
      {iconMap[name] ?? iconMap.dashboard}
    </svg>
  );
}
