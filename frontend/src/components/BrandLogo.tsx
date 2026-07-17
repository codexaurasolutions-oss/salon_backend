type BrandLogoProps = {
  className?: string;
  iconClassName?: string;
  textClassName?: string;
  mode?: "full" | "mark";
};

const BrandLogo = ({
  className = "",
  iconClassName = "",
  textClassName = "",
  mode = "full",
}: BrandLogoProps) => {
  return (
    <div className={`inline-flex items-center gap-3 ${className}`.trim()}>
      <div
        className={`relative flex h-12 w-12 items-center justify-center overflow-hidden rounded-[1.35rem] bg-[#111111] shadow-[0_14px_30px_rgba(17,17,17,0.18)] ${iconClassName}`.trim()}
      >
        <div className="absolute inset-[1px] rounded-[1.25rem] bg-[linear-gradient(145deg,#1d1d1d_0%,#111111_60%,#2a2a2a_100%)]" />
        <svg
          viewBox="0 0 64 64"
          aria-hidden="true"
          className="relative z-10 h-[62%] w-[62%]"
        >
          <path
            d="M16 47V17h6.5l16 18.5V17H48v30h-6.3L25.5 28.5V47H16Z"
            fill="#F7EFE8"
          />
          <path
            d="M43 15.5c5.6 1.1 9.5 5.1 10.4 10.7"
            fill="none"
            stroke="#C6926B"
            strokeLinecap="round"
            strokeWidth="3.2"
          />
          <path
            d="M41.5 22c2.7.6 4.7 2.5 5.2 5.2"
            fill="none"
            stroke="#E7B18E"
            strokeLinecap="round"
            strokeWidth="2.6"
          />
        </svg>
      </div>

      {mode === "full" && (
        <div className={`leading-none ${textClassName}`.trim()}>
          <div className="font-['DM_Serif_Display'] text-[1.75rem] tracking-[0.02em] text-[#111111]">
            Noamskin
          </div>
          <div className="mt-1 text-[0.52rem] font-semibold uppercase tracking-[0.42em] text-[#8a6b55]">
            Aesthetic Clinic
          </div>
        </div>
      )}
    </div>
  );
};

export default BrandLogo;
