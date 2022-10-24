import { FC } from "react";
import Image from "next/image";
import { GalleryItem } from "types";

interface Props {
  item: GalleryItem;
}

export const Preview: FC<Props> = ({ item: { src, w, h } }) => {
  return (
    <a href={src} target="_blank" rel="noreferrer">
      <Image src={src} width={w} height={h} alt="Preview" />
    </a>
  );
};
