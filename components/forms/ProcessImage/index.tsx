import {
  Box,
  Checkbox,
  Collapse,
  FormControlLabel,
  ImageList,
  ImageListItem,
  TextField,
} from "@mui/material";
import { default as NextImage } from "next/image";
import { FC, useEffect, useState } from "react";
import { AddImageForm } from "@components/forms/AddImage";
import { DecolorizeForm } from "@components/forms/Decolorize";
import { Preview } from "@components/misc/gallery/Preview";
import { GalleryItem, SkeletonSuccessResponse, VisualizeOptions } from "types";
import { Controller, useForm, useWatch } from "react-hook-form";
import { base64ToURL, URL2Blob } from "@helpers/processing/image";
import { useSnackbar } from "notistack";
import { LoadingButton } from "@mui/lab";

const defaultValues = {
  w: 0,
  h: 0,
  points: {
    required: true,
    additional: {
      required: false,
      color: "#3f51b5",
    },
  },
  branches: {
    required: true,
    additional: {
      r: 1,
      required: false,
      color: "#a33ed5",
    },
  },
};

export const ProcessImageForm: FC = () => {
  const { enqueueSnackbar } = useSnackbar();
  const [gallery, setGallery] = useState<GalleryItem[]>([]);
  const [selectedImage, setSelectedImage] = useState<GalleryItem | null>(null);
  const [resultImage, setResultImage] = useState<GalleryItem>();
  const [resultPoints, setResultPoints] = useState<string>("");
  const [resultBranches, setResultBranches] = useState<string>("");

  const {
    setValue,
    handleSubmit,
    control,
    formState: { isValid, isSubmitting },
  } = useForm<VisualizeOptions>({
    mode: "onChange",
    defaultValues,
  });

  const coloredPoints = useWatch({
    control,
    name: "points.additional.required",
  });

  const coloredBranches = useWatch({
    control,
    name: "branches.additional.required",
  });

  useEffect(() => {
    if (selectedImage) {
      const { w, h } = selectedImage;
      setValue("w", w || 150);
      setValue("h", h || 150);
    }
  }, [selectedImage, setValue]);

  const handleAdd = (item: GalleryItem) => {
    setGallery([...gallery, item]);
    setSelectedImage(item);
  };

  const handleDecolorize = async (curr: string, decolorized: string) => {
    const currItem = gallery.find(({ src }) => curr === src) as GalleryItem;
    const decolorizedItem = { ...currItem, src: decolorized };
    const newGallery = gallery.map((item) =>
      item.src === curr ? decolorizedItem : item,
    );
    setGallery(newGallery);
    setSelectedImage(decolorizedItem);
  };

  const onSubmit = (data: VisualizeOptions) => {
    return new Promise(async (resolve, reject) => {
      try {
        if (!selectedImage) {
          throw new Error("No image selected!");
        }

        const body = new FormData();
        body.append(
          "image",
          new File(
            [await URL2Blob(selectedImage.src as string)],
            new Date().getTime().toString(),
          ),
        );

        body.append("options", JSON.stringify(data));

        const res = await fetch("/api/img/skeleton", {
          method: "POST",
          body,
          // @ts-ignore
          signal: AbortSignal.timeout(25000),
        });

        if (res.status !== 200) {
          if (res.status === 504) {
            throw new Error("Request timeout.");
          } else {
            throw new Error(res.statusText);
          }
        }

        const { base64, points, branches } =
          (await res.json()) as SkeletonSuccessResponse;
        const src = await base64ToURL(base64);

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

        img.src = src;
        const { w, h } = await getDimensions();
        setResultImage({ src, w, h });

        setResultPoints(
          points ? points.reduce((a, b) => a + `[${b[0]}, ${b[1]}]\n`, "") : "",
        );
        setResultBranches(
          branches
            ? branches.reduce((a, b) => a + `[${b[0]}, ${b[1]}]\n`, "")
            : "",
        );

        resolve(() => {});
      } catch (e: unknown) {
        let message = "Unknown error has occurred: ";
        if (e instanceof Error) {
          message = e.message;
        }
        enqueueSnackbar(message, { variant: "error", autoHideDuration: 3000 });
        reject();
      }
    });
  };

  return (
    <Box
      component="form"
      onSubmit={handleSubmit(onSubmit)}
      sx={(theme) => ({
        display: "flex",
        gap: 2,
        justifyContent: "center",
        width: "100%",
        pt: 3,
        px: 3,
        [theme.breakpoints.up("md")]: {
          flexDirection: "row",
        },
        [theme.breakpoints.down("md")]: {
          flexDirection: "column-reverse",
        },
      })}>
      <Box sx={{ display: "flex", flexDirection: "column" }}>
        <ImageList
          cols={3}
          gap={8}
          sx={{
            maxHeight: "15rem",
            // hide scroll ff
            "::-webkit-scrollbar": {
              display: "none",
            },
            // hide scroll chrome
            msOverflowStyle: "none",
            cursor: !isSubmitting ? "pointer" : "wait",
          }}>
          {gallery.map((i) => (
            <ImageListItem
              key={i.src}
              sx={{
                border:
                  selectedImage?.src === i.src ? "3px solid white" : "none",
              }}>
              <NextImage
                src={i.src}
                alt={"alt"}
                loading="lazy"
                width={"100%"}
                height={"100%"}
                onClick={() => (!isSubmitting ? setSelectedImage(i) : null)}
              />
            </ImageListItem>
          ))}
          <AddImageForm onAdd={handleAdd} disabled={isSubmitting} />
        </ImageList>

        <DecolorizeForm
          img={selectedImage?.src || ""}
          afterAction={handleDecolorize}
          disabled={isSubmitting || selectedImage === null}
        />

        <Controller
          name="w"
          control={control}
          render={({ field: { onChange, value }, fieldState: { error } }) => (
            <TextField
              disabled={isSubmitting}
              inputMode="numeric"
              label="Result image width"
              variant="outlined"
              color={!!value ? "success" : !error ? "primary" : "error"}
              value={value}
              onChange={onChange}
              error={!!error}
              helperText={error ? error.message : " "}
              sx={{ mt: 4, mb: error ? 2 : 0 }}
            />
          )}
          rules={{
            required: "Image width is required",
            min: {
              value: 1,
              message: "Image width cannot be less than 1px",
            },
            max: {
              value: 2500,
              message: "Image width cannot be more than 2500px",
            },
          }}
        />

        <Controller
          name="h"
          control={control}
          render={({ field: { onChange, value }, fieldState: { error } }) => (
            <TextField
              disabled={isSubmitting}
              inputMode="numeric"
              label="Result image height"
              variant="outlined"
              color={!!value ? "success" : !error ? "primary" : "error"}
              value={value}
              onChange={onChange}
              error={!!error}
              helperText={error ? error.message : " "}
            />
          )}
          rules={{
            required: "Image height is required",
            min: {
              value: 1,
              message: "Image height cannot be less than 1px",
            },
            max: {
              value: 2500,
              message: "Image height cannot be more than 2500px",
            },
          }}
        />

        <Controller
          name="points.required"
          control={control}
          render={({ field: { onChange, value } }) => (
            <FormControlLabel
              disabled={isSubmitting}
              control={<Checkbox checked={value} onChange={onChange} />}
              label="Show points coordinates"
            />
          )}
        />

        <Controller
          name="points.additional.required"
          control={control}
          render={({ field: { onChange, value } }) => (
            <FormControlLabel
              disabled={isSubmitting}
              control={<Checkbox checked={value} onChange={onChange} />}
              label="Color points on the result image"
            />
          )}
        />

        <Collapse in={coloredPoints}>
          <Controller
            name="points.additional.color"
            control={control}
            render={({ field: { onChange, value } }) => (
              <TextField
                disabled={isSubmitting}
                type="color"
                label="Points color"
                variant="outlined"
                value={value}
                onChange={onChange}
                sx={{ width: "100%", mt: 1 }}
              />
            )}
          />
        </Collapse>

        <Controller
          name="branches.required"
          control={control}
          render={({ field: { onChange, value } }) => (
            <FormControlLabel
              disabled={isSubmitting}
              control={<Checkbox checked={value} onChange={onChange} />}
              label="Show branches coordinates"
            />
          )}
        />

        <Controller
          name="branches.additional.required"
          control={control}
          render={({ field: { onChange, value } }) => (
            <FormControlLabel
              disabled={isSubmitting}
              control={<Checkbox checked={value} onChange={onChange} />}
              label="Color branches on the result image"
            />
          )}
        />

        <Collapse in={coloredBranches}>
          <Controller
            name="branches.additional.color"
            control={control}
            render={({ field: { onChange, value } }) => (
              <TextField
                disabled={isSubmitting}
                type="color"
                label="Branches color"
                variant="outlined"
                value={value}
                onChange={onChange}
                sx={{ width: "100%", mt: 1 }}
              />
            )}
          />
        </Collapse>

        <LoadingButton
          type={"submit"}
          loading={isSubmitting}
          disabled={selectedImage === null}
          variant={"contained"}
          color={"primary"}
          sx={{ mt: 2 }}>
          Generate skeleton
        </LoadingButton>
      </Box>

      <Box display={"flex"} flexDirection="column">
        <Box
          display={"flex"}
          sx={(theme) => ({
            [theme.breakpoints.up("md")]: {
              flexDirection: "row",
            },
            [theme.breakpoints.down("md")]: {
              flexDirection: "column",
            },
          })}>
          <Box maxWidth={"20rem"} m={1}>
            {selectedImage && selectedImage.src !== "" && (
              <Preview item={selectedImage} />
            )}
          </Box>

          <Box maxWidth={"20rem"} m={1}>
            {resultImage && resultImage.src !== "" ? (
              <Preview item={resultImage} />
            ) : null}
          </Box>
        </Box>

        <Collapse in={resultPoints !== "" || resultBranches !== ""}>
          <Box display={"flex"} flexDirection={"row"} gap={2}>
            {resultPoints !== "" && (
              <TextField
                variant={"standard"}
                multiline
                label={"Points"}
                maxRows={4}
                disabled
                value={resultPoints}
                sx={{ width: "50%" }}
              />
            )}

            {resultBranches !== "" && (
              <TextField
                variant={"standard"}
                multiline
                label={"Branches"}
                maxRows={4}
                disabled
                value={resultBranches}
                sx={{ width: "50%" }}
              />
            )}
          </Box>
        </Collapse>
      </Box>
    </Box>
  );
};
