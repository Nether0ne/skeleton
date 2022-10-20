import { Box, Button, CircularProgress, ImageListItem } from "@mui/material";
import { ChangeEvent, FC, useRef, useState } from "react";
import { useSnackbar } from "notistack";
import { LoadingButton } from "@mui/lab";

interface Props {
  f: File;
}

export const DecolorizeForm: FC<Props> = ({ f }) => {
  const { enqueueSnackbar } = useSnackbar();
  const [isConverting, setIsConverting] = useState(false);

  const handleClick = () => {
    setIsConverting(true);
    // @ts-ignore
    inputFile.current.click();
  };

  return (
    <LoadingButton
      variant={"contained"}
      loading={isConverting}
      onClick={handleClick}>
      Decolorize
    </LoadingButton>
  );
};
