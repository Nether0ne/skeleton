import { FC } from "react";
import Image from "next/image";
import { GalleryItem } from "types";

interface Props {
  item: GalleryItem;
}

export const Preview: FC<Props> = ({ item: { src, w, h } }) => {
  return <Image src={src} width={w} height={h} alt="Preview" />;
};
