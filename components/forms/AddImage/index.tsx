import { Box, CircularProgress, ImageListItem } from "@mui/material";
import { ChangeEvent, FC, useRef, useState } from "react";
import AddIcon from "@mui/icons-material/Add";
import { useSnackbar } from "notistack";

const fileTypes = ["jpg", "jpeg", "png", "bmp"].reduce(
  (a, s) => `${a}, image/${s}`,
);

interface Props {
  onAdd: (p: string) => void;
}

export const AddImageForm: FC<Props> = ({ onAdd }) => {
  const inputFile = useRef<HTMLInputElement>(null);

  const onClick = () => {
    inputFile?.current?.click();
  };

  const onChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newImage = e.target.files[0];

      if (newImage) {
        const newPhotoUrl = URL.createObjectURL(newImage);
        onAdd(newPhotoUrl);
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
        "&:hover": {
          backgroundColor: "#382E7E",
          transition: "background-color .5s ease-out",
          cursor: "pointer",
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
