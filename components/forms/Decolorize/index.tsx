import { FC, useState } from "react";
import { useSnackbar } from "notistack";
import { LoadingButton } from "@mui/lab";
import { base64ToURL, URL2Blob } from "@helpers/processing/image";
import { DecolorizeSuccessResponse } from "types";
import { Tooltip } from "@mui/material";
import { InfoOutlined } from "@mui/icons-material";

interface Props {
  disabled: boolean;
  afterAction: (a: string, b: string) => Promise<void>;
  img: string;
}

export const DecolorizeForm: FC<Props> = ({ disabled, img, afterAction }) => {
  const { enqueueSnackbar } = useSnackbar();
  const [isConverting, setIsConverting] = useState(false);

  const handleClick = async () => {
    try {
      setIsConverting(true);
      const body = new FormData();
      body.append(
        "image",
        new File([await URL2Blob(img)], new Date().getTime().toString()),
      );

      const res = await fetch("/api/img/decolorize", {
        method: "POST",
        body,
      });

      if (res.status !== 200) {
        if (res.status === 504) {
          throw new Error("Request timeout.");
        } else if (res.status === 413) {
          throw new Error("File size exceeds 4MB limit.");
        } else {
          throw new Error(res.statusText);
        }
      }

      const { base64 } = (await res.json()) as DecolorizeSuccessResponse;
      const url = await base64ToURL(base64);

      await afterAction(img, url);
    } catch (e: unknown) {
      let message = "Unknown error has occurred: ";
      if (e instanceof Error) {
        message = e.message;
      }
      enqueueSnackbar(message, { variant: "error", autoHideDuration: 3000 });
    } finally {
      setIsConverting(false);
    }
  };

  return (
    <>
      <Tooltip
        title={
          "This algorithm works with black and white images only. Decolorize image if necessary"
        }>
        <LoadingButton
          variant={"contained"}
          loading={isConverting}
          onClick={handleClick}
          disabled={disabled}
          color={"secondary"}
          size="small"
          startIcon={<InfoOutlined />}>
          Convert image to black and white
        </LoadingButton>
      </Tooltip>
    </>
  );
};
