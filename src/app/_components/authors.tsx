import { type Author } from "@/interfaces/author";
import Avatar from "./avatar";

type Props = {
  authors: Author[];
};

const Authors = ({ authors }: Props) => {
  if (authors.length === 1) {
    return <Avatar name={authors[0].name} picture={authors[0].picture} />;
  }

  return (
    <div className="flex flex-col gap-3">
      {authors.map((author) => (
        <Avatar key={author.name} name={author.name} picture={author.picture} />
      ))}
    </div>
  );
};

export default Authors;
