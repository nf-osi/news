import cn from "classnames";

type Props = {
  children?: React.ReactNode;
  className?: string;
  id?: string;
};

/** The site's single content measure — everything lines up to these edges. */
const Container = ({ children, className, id }: Props) => {
  return (
    <div id={id} className={cn("container mx-auto px-5", className)}>
      {children}
    </div>
  );
};

export default Container;
