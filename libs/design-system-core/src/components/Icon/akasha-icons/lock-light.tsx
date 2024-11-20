import React from 'react';

const LockLight = (props: React.SVGProps<SVGSVGElement>) => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 20 20"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M10 1.25C7.58375 1.25 5.625 3.20875 5.625 5.625V8.125C4.24429 8.125 3.125 9.24429 3.125 10.625V16.25C3.125 17.6307 4.24429 18.75 5.625 18.75H14.375C15.7557 18.75 16.875 17.6307 16.875 16.25V10.625C16.875 9.24429 15.7557 8.125 14.375 8.125V5.625C14.375 3.20875 12.4162 1.25 10 1.25ZM13.125 8.125V5.625C13.125 3.89911 11.7259 2.5 10 2.5C8.27411 2.5 6.875 3.89911 6.875 5.625V8.125H13.125Z"
      fill="#BA9AE0"
    />
  </svg>
);

export default LockLight;
