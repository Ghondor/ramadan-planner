import Image from "next/image";

const MainLogo = ({
  width = 200,
  height = 200,
  className,
}: {
  width?: number;
  height?: number;
  className?: string;
}) => {
  return (
    <Image
      src="/icons/logo.svg"
      alt="Ramadan Planner"
      width={width}
      height={height}
      className={className}
      priority
    />
  );
};

export default MainLogo;
