import cn from "classnames";
import Link from "next/link";
import Image from "next/image";
import { withBasePath } from "@/lib/base-path";

type Props = {
  title: string;
  src: string;
  href?: string;
};

const CoverImage = ({ title, src, href }: Props) => {
  const image = (
    <Image
      src={withBasePath(src)}
      alt={`Cover Image for ${title}`}
      className={cn("shadow-sm w-full", {
        "hover:shadow-lg transition-shadow duration-200": href,
      })}
      width={1300}
      height={630}
    />
  );
  return (
    <div className="sm:mx-0">
      {href ? (
        <Link href={href} aria-label={title}>
          {image}
        </Link>
      ) : (
        image
      )}
    </div>
  );
};

export default CoverImage;
