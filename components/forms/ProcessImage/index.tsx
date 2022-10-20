import { Box, ImageList, ImageListItem } from "@mui/material";
import Image from "next/image";
import { FC, useEffect, useState } from "react";
import { AddImageForm } from "@components/forms/AddImage";
import { DecolorizeForm } from "@components/forms/Decolorize";

const images = ["test1.png", "test2.jpg", "test3.bmp"].map(
  (i) => "/input/" + i,
);

export const ProcessImageForm: FC = () => {
  const [gallery, setGallery] = useState(images);
  const [selectedImage, setSelectedImage] = useState(images[0]);
  const [selectedFile, setSelectedFile] = useState<string>("");

  const handleAdd = (p: string) => {
    setGallery([...gallery, p]);
    setSelectedImage(p);
  };

  useEffect(() => {
    (async () => {
      const selectedImageUrl = URL.createObjectURL(selectedImage);
      const blob = new Blob([selectedImage], { type: "image/png" });
      console.log(selectedImage);
      // Convert to file
      const base64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onerror = () => reject(null);
        reader.onloadend = () => resolve(reader.result as string);
        reader.readAsDataURL(blob);
      });
      setSelectedFile(base64);
      console.log(base64);
    })();
  }, [selectedImage]);

  return (
    <Box
      component="form"
      sx={{
        display: "flex",
        flexDirection: "column",
        gap: 2,
      }}>
      <ImageList
        cols={2}
        gap={8}
        sx={{ maxHeight: "15rem", overflow: "scroll-y" }}>
        {gallery.map((img) => (
          <ImageListItem
            key={img}
            sx={{
              border: selectedImage === img ? "3px solid white" : "none",
            }}>
            <Image
              src={img}
              alt={"alt"}
              loading="lazy"
              width={"200rem"}
              height={"200rem"}
              onClick={() => {
                setSelectedImage(img);
                console.log(selectedImage);
              }}
            />
          </ImageListItem>
        ))}
        <AddImageForm onAdd={handleAdd} />
      </ImageList>
      <DecolorizeForm />
    </Box>
  );
};
