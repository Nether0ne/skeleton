import { Box, CircularProgress, ImageListItem } from "@mui/material";
import { ChangeEvent, FC, useRef, useState } from "react";
import AddIcon from "@mui/icons-material/Add";
import { useSnackbar } from "notistack";

const fileTypes = ["jpeg", "png", "bmp"].reduce((a, s) => `${a}, image/${s}`);

interface Props {
  onAdd: (p: string) => void;
}

export const AddImageForm: FC<Props> = ({ onAdd }) => {
  const { enqueueSnackbar } = useSnackbar();
  const [isUploading, setIsUploading] = useState(false);
  const inputFile = useRef<HTMLInputElement>(null);

  const onClick = () => {
    setIsUploading(true);
    // @ts-ignore
    inputFile.current.click();
  };

  const onChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newImage = e.target.files[0];

      if (newImage) {
        const newPhotoUrl = URL.createObjectURL(newImage);
        onAdd(newPhotoUrl);
        e.target.files = null;
      }
    }
    setIsUploading(false);
  };

  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        width: "100%",
        height: "100%",
        transition: "background-color .5s ease-out",
        pointerEvents: !isUploading ? "auto" : "none",
        "&:hover": {
          backgroundColor: "#382E7E",
          transition: "background-color .5s ease-out",
          cursor: !isUploading ? "pointer" : "wait",
        },
      }}
      onClick={onClick}>
      <ImageListItem key="addPhotoButton">
        {!isUploading ? (
          <AddIcon
            sx={{
              fontSize: "5rem",
            }}
          />
        ) : (
          <CircularProgress />
        )}
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
