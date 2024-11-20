import { useEffect, useState } from "react";

interface Dimensions {
  width: number;
  height: number;
}

export const useContainerDimensions = (
  ref: React.RefObject<HTMLElement>,
): Dimensions => {
  const [dimensions, setDimensions] = useState<Dimensions>({
    width: 0,
    height: 0,
  });

  useEffect(() => {
    const getDimensions = (): Dimensions => {
      if (!ref.current) {
        return { width: 0, height: 0 };
      }
      return {
        width: ref.current.offsetWidth,
        height: ref.current.offsetHeight,
      };
    };

    const handleResize = (): void => {
      setDimensions(getDimensions());
    };

    if (ref.current) {
      setDimensions(getDimensions());
    }
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, [ref]);

  return dimensions;
};
