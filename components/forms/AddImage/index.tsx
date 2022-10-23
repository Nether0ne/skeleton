import { Box, ImageListItem } from "@mui/material";
import { ChangeEvent, FC, useRef, useState } from "react";
import AddIcon from "@mui/icons-material/Add";
import { GalleryItem } from "types";

const fileTypes = ["jpg", "jpeg", "png", "bmp"].reduce(
  (a, s) => `${a}, image/${s}`,
);

interface Props {
  disabled: boolean;
  onAdd: (p: GalleryItem) => void;
}

export const AddImageForm: FC<Props> = ({ disabled, onAdd }) => {
  const inputFile = useRef<HTMLInputElement>(null);

  const onClick = () => {
    inputFile?.current?.click();
  };

  const onChange = async (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newImage = e.target.files[0];

      if (newImage) {
        const img = new Image();
        const getDimensions = (): Promise<{ w: number; h: number }> =>
          new Promise((resolve, reject) => {
            img.onload = () => {
              const w = img.naturalWidth;
              const h = img.naturalHeight;
              resolve({ w, h });
            };
            img.onerror = reject;
          });

        const newPhotoUrl = URL.createObjectURL(newImage);
        img.src = newPhotoUrl;
        const { w, h } = await getDimensions();
        onAdd({ src: newPhotoUrl, w, h });
        console.log({ src: newPhotoUrl, w, h });
        e.target.value = "";
      }
    }
  };

  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        transition: "background-color .5s ease-out",
        pointerEvents: !disabled ? "auto" : "none",
        "&:hover": {
          backgroundColor: "#382E7E",
          transition: "background-color .5s ease-out",
          cursor: !disabled ? "pointer" : "wait",
        },
      }}
      onClick={onClick}>
      <ImageListItem key="addPhotoButton">
        <AddIcon
          sx={{
            fontSize: "5rem",
          }}
        />
      </ImageListItem>
      <input
        type="file"
        name="file"
        accept={fileTypes}
        ref={inputFile}
        style={{ display: "none" }}
        onChange={onChange}
      />
    </Box>
  );
};
