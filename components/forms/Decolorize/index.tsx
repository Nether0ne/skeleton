import { FC, useState } from "react";
import { useSnackbar } from "notistack";
import { LoadingButton } from "@mui/lab";
import { URL2Base64, URL2Blob } from "@helpers/processing/image";
import { DecolorizeSuccessResponse } from "types";

interface Props {
  afterAction: (a: string, b: string) => Promise<void>;
  img: string;
}

export const DecolorizeForm: FC<Props> = ({ img, afterAction }) => {
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
        throw new Error(res.statusText);
      }

      const { base64 } = (await res.json()) as DecolorizeSuccessResponse;

      await afterAction(img, base64);
    } catch (e: unknown) {
      let message = "Unknown error has occurred: ";
      if (e instanceof Error) {
        message = e.message;
      }
      enqueueSnackbar(message, { variant: "error" });
    } finally {
      setIsConverting(false);
    }
  };

  return (
    <LoadingButton
      variant={"contained"}
      loading={isConverting}
      // loading={false}
      onClick={handleClick}>
      Decolorize
    </LoadingButton>
  );
};
