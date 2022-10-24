import { Box, ImageListItem } from "@mui/material";
import { ChangeEvent, FC, useRef } from "react";
import AddIcon from "@mui/icons-material/Add";
import { GalleryItem } from "types";
import { useSnackbar } from "notistack";

const fileTypes = ["jpg", "jpeg", "png", "bmp"].map((s) => `image/${s}`);

interface Props {
  disabled: boolean;
  onAdd: (p: GalleryItem) => void;
}

export const AddImageForm: FC<Props> = ({ disabled, onAdd }) => {
  const { enqueueSnackbar } = useSnackbar();
  const inputFile = useRef<HTMLInputElement>(null);

  const onClick = () => {
    inputFile?.current?.click();
  };

  const onChange = async (e: ChangeEvent<HTMLInputElement>) => {
    try {
      if (e.target.files) {
        const newImage = e.target.files[0];

        if (fileTypes.indexOf(newImage.type) === -1) {
          throw new Error("File with unsupported extension provided.");
        }

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
          let { w, h } = await getDimensions();

          const max = 1250;

          // resize if more than allowed
          if (w > max) {
            let tempW = w;
            w = max;
            h = Math.round(h * (max / tempW));
          } else if (h > max) {
            let tempH = h;
            h = max;
            w = Math.round(w * (max / tempH));
          }

          onAdd({ src: newPhotoUrl, w, h });
        }
      }
    } catch (e: unknown) {
      let message = "Unknown error has appeared.";
      if (e instanceof Error) {
        message = e.message;
      }
      enqueueSnackbar(message, { variant: "error", autoHideDuration: 3000 });
    } finally {
      e.target.value = "";
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
        ref={inputFile}
        style={{ display: "none" }}
        onChange={onChange}
      />
    </Box>
  );
};
