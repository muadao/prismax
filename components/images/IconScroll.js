const IconArrow = ({ color = "white" }) => {
  return (
    <svg
      width="32"
      height="48"
      viewBox="0 0 32 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect
        x="0.55"
        y="0.55"
        width="30.9"
        height="46.9"
        rx="15.45"
        stroke={color}
        strokeOpacity="0.5"
        strokeWidth="1.1"
      />
      <path
        d="M16.55 15.0588C16.55 14.7551 16.3038 14.5088 16 14.5088C15.6962 14.5088 15.45 14.7551 15.45 15.0588L16.55 15.0588ZM15.6111 34.2713C15.8259 34.4861 16.1741 34.4861 16.3889 34.2713L19.8891 30.7711C20.1039 30.5563 20.1039 30.2081 19.8891 29.9933C19.6743 29.7785 19.3261 29.7785 19.1113 29.9933L16 33.1046L12.8887 29.9933C12.6739 29.7785 12.3257 29.7785 12.1109 29.9933C11.8961 30.2081 11.8961 30.5563 12.1109 30.7711L15.6111 34.2713ZM15.45 15.0588L15.45 33.8824L16.55 33.8824L16.55 15.0588L15.45 15.0588Z"
        fill={color}
        fillOpacity="0.5"
      />
    </svg>
  );
};

export default IconArrow;
