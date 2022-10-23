import { FC } from "react";
import Image from "next/image";

interface Props {
  img: string;
}

export const Preview: FC<Props> = ({ img }) => {
  return <Image src={img} width={"100%"} height={"100%"} alt="Preview" />;
};
