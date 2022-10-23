import { Box, ImageList, ImageListItem } from "@mui/material";
import Image from "next/image";
import { FC, useState } from "react";
import { AddImageForm } from "@components/forms/AddImage";
import { DecolorizeForm } from "@components/forms/Decolorize";
import { base64ToURL } from "@helpers/processing/image";
import { Preview } from "@/components/misc/gallery/Preview";

export const ProcessImageForm: FC = () => {
  const [gallery, setGallery] = useState<string[]>([]);
  const [selectedImage, setSelectedImage] = useState<string>("");

  const handleAdd = (p: string) => {
    setGallery([...gallery, p]);
    setSelectedImage(p);
  };

  const handleDecolorize = async (curr: string, decolorized: string) => {
    const blob = await base64ToURL(decolorized);
    const newGallery = gallery.map((a) => (a === curr ? blob : a));
    setGallery(newGallery);
    setSelectedImage(blob);
  };

  return (
    <Box
      component="form"
      sx={{
        display: "flex",
        flexDirection: "column",
        gap: 2,
        minWidth: "30rem",
      }}>
      {selectedImage !== "" && <Preview img={selectedImage} />}
      <ImageList
        cols={2}
        gap={8}
        sx={{ maxHeight: "15rem", overflow: "scroll-y", cursor: "pointer" }}>
        {gallery.map((img) => (
          <ImageListItem
            key={img}
            sx={{ border: selectedImage === img ? "3px solid white" : "none" }}>
            <Image
              src={img}
              alt={"alt"}
              loading="lazy"
              width={"100%"}
              height={"100%"}
              onClick={() => {
                setSelectedImage(img);
              }}
            />
          </ImageListItem>
        ))}
        <AddImageForm onAdd={handleAdd} />
      </ImageList>
      <DecolorizeForm img={selectedImage} afterAction={handleDecolorize} />
    </Box>
  );
};
