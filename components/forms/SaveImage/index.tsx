import { FC, useState } from "react";
import { useSnackbar } from "notistack";
import { LoadingButton } from "@mui/lab";
import { URL2Blob } from "@helpers/processing/image";
import { ConvertSuccessResponse } from "types";
import DownloadIcon from "@mui/icons-material/Download";
import { Menu, MenuItem } from "@mui/material";

const fileExtensions = ["png", "jpeg", "bmp"];

interface Props {
  img: string;
}

export const SaveAsForm: FC<Props> = ({ img }) => {
  const { enqueueSnackbar } = useSnackbar();
  const [isSaving, setIsSaving] = useState(false);

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleSave = async (ext: string) => {
    handleClose();

    try {
      setIsSaving(true);
      const body = new FormData();
      const fileName = `skeleton_${new Date().getTime().toString()}.${ext}`;
      body.append("image", new File([await URL2Blob(img)], fileName));

      const res = await fetch("/api/img/convert", {
        method: "POST",
        body,
      });

      if (res.status !== 200) {
        if (res.status === 504) {
          throw new Error("Request timeout.");
        } else if (res.status === 413) {
          throw new Error("File size exceeds 8MB limit.");
        } else {
          throw new Error(res.statusText);
        }
      }

      const { base64 } = (await res.json()) as ConvertSuccessResponse;

      // start image download
      const a = document.createElement("a");
      a.download = fileName;
      a.href = base64;
      a.click();
    } catch (e: unknown) {
      let message = "Unknown error has occurred: ";
      if (e instanceof Error) {
        message = e.message;
      }
      enqueueSnackbar(message, { variant: "error", autoHideDuration: 3000 });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <>
      <LoadingButton
        variant={"contained"}
        loading={isSaving}
        onClick={handleClick}
        color={"success"}
        startIcon={<DownloadIcon />}
        sx={(theme) => ({
          [theme.breakpoints.up("md")]: {
            width: "50%",
            margin: "0 auto",
          },
        })}>
        Save as
      </LoadingButton>

      <Menu
        id="basic-menu"
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        MenuListProps={{
          "aria-labelledby": "basic-button",
        }}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "center",
        }}>
        {fileExtensions.map((i) => (
          <MenuItem key={i} onClick={() => handleSave(i)}>
            {i.toUpperCase()}
          </MenuItem>
        ))}
      </Menu>
    </>
  );
};
