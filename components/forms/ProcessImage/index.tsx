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
import { SaveAsForm } from "@components/forms/SaveImage";

const defaultValues = {
  w: 0,
  h: 0,
  edges: {
    required: true,
    additional: {
      required: false,
      color: "#3f51b5",
      r: 1,
    },
  },
  branches: {
    required: true,
    additional: {
      required: false,
      color: "#a33ed5",
      r: 1,
    },
  },
};

export const ProcessImageForm: FC = () => {
  const { enqueueSnackbar } = useSnackbar();
  const [gallery, setGallery] = useState<GalleryItem[]>([]);
  const [selectedImage, setSelectedImage] = useState<GalleryItem | null>(null);
  const [resultImage, setResultImage] = useState<GalleryItem | null>(null);
  const [resultEdges, setResultEdges] = useState<string>("");
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

  const coloredEdges = useWatch({
    control,
    name: "edges.additional.required",
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

  const resetResult = () => {
    setResultImage(null);
    setResultEdges("");
    setResultBranches("");
  };

  const onSubmit = (data: VisualizeOptions) => {
    resetResult();

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
        });

        if (res.status !== 200) {
          if (res.status === 504) {
            throw new Error("Request timeout.");
          } else {
            throw new Error(res.statusText);
          }
        }

        const { base64, edges, branches } =
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
        setResultEdges(
          edges
            ? edges.reduce(
                (a, b) => a + `[${b[0]}, ${b[1]}]\n`,
                `Count: ${edges.length}\n`,
              )
            : "",
        );
        setResultBranches(
          branches
            ? branches.reduce(
                (a, b) => a + `[${b[0]}, ${b[1]}]\n`,
                `Count: ${branches.length}\n`,
              )
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
            mb: 4,
            maxHeight: "7rem",
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
              type={"number"}
              label="Result image width"
              variant="outlined"
              color={!!value ? "success" : !error ? "primary" : "error"}
              value={value}
              onChange={onChange}
              error={!!error}
              helperText={error ? error.message : " "}
              sx={{ mt: 4, mb: error ? 2 : 0 }}
              margin={"normal"}
            />
          )}
          rules={{
            required: "Image width is required",
            min: {
              value: 1,
              message: "Image width cannot be less than 1px",
            },
            max: {
              value: 1250,
              message: "Image width cannot be more than 1250px",
            },
          }}
        />

        <Controller
          name="h"
          control={control}
          render={({ field: { onChange, value }, fieldState: { error } }) => (
            <TextField
              disabled={isSubmitting}
              type={"number"}
              label="Result image height"
              variant="outlined"
              color={!!value ? "success" : !error ? "primary" : "error"}
              value={value}
              onChange={onChange}
              error={!!error}
              helperText={error ? error.message : " "}
              margin={"normal"}
            />
          )}
          rules={{
            required: "Image height is required",
            min: {
              value: 1,
              message: "Image height cannot be less than 1px",
            },
            max: {
              value: 1250,
              message: "Image height cannot be more than 1250px",
            },
          }}
        />

        <Controller
          name="edges.required"
          control={control}
          render={({ field: { onChange, value } }) => (
            <FormControlLabel
              disabled={isSubmitting}
              control={<Checkbox checked={value} onChange={onChange} />}
              label="Show edge coordinates"
            />
          )}
        />

        <Controller
          name="edges.additional.required"
          control={control}
          render={({ field: { onChange, value } }) => (
            <FormControlLabel
              disabled={isSubmitting}
              control={<Checkbox checked={value} onChange={onChange} />}
              label="Color edges on the result image"
            />
          )}
        />

        <Collapse in={coloredEdges}>
          <Box display={"flex"} flexDirection={"row"} width={"100%"} gap={2}>
            <Controller
              name="edges.additional.color"
              control={control}
              render={({ field: { onChange, value } }) => (
                <TextField
                  disabled={isSubmitting}
                  type="color"
                  label="Edges color"
                  variant="outlined"
                  value={value}
                  onChange={onChange}
                  sx={{ width: "50%" }}
                  margin={"normal"}
                />
              )}
            />
            <Controller
              name="edges.additional.r"
              control={control}
              render={({
                field: { onChange, value },
                fieldState: { error },
              }) => (
                <TextField
                  disabled={isSubmitting}
                  type={"number"}
                  label="Edges radius (px)"
                  variant="outlined"
                  value={value}
                  onChange={onChange}
                  error={!!error}
                  color={!!value ? "success" : !error ? "primary" : "error"}
                  helperText={error ? error.message : " "}
                  sx={{ width: "50%" }}
                  margin={"normal"}
                />
              )}
              rules={{
                required: coloredEdges && "Edges radius is required",
                min: coloredEdges
                  ? {
                      value: 1,
                      message: "Edges radius cannot be less than 1px",
                    }
                  : undefined,
              }}
            />
          </Box>
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
          <Box display={"flex"} flexDirection={"row"} width={"100%"} gap={2}>
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
                  sx={{ width: "50%" }}
                  margin={"normal"}
                />
              )}
            />
            <Controller
              name="branches.additional.r"
              control={control}
              render={({
                field: { onChange, value },
                fieldState: { error },
              }) => (
                <TextField
                  disabled={isSubmitting}
                  type={"number"}
                  label="Branches radius (px)"
                  variant="outlined"
                  value={value}
                  onChange={onChange}
                  error={!!error}
                  color={!!value ? "success" : !error ? "primary" : "error"}
                  helperText={error ? error.message : " "}
                  sx={{ width: "50%" }}
                  margin={"normal"}
                />
              )}
              rules={{
                required: coloredBranches && "Branches radius is required",
                min: coloredBranches
                  ? {
                      value: 1,
                      message: "Branches radius cannot be less than 1px",
                    }
                  : undefined,
              }}
            />
          </Box>
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

        <Collapse in={resultEdges !== "" || resultBranches !== ""}>
          <Box display={"flex"} flexDirection={"row"} gap={2} mb={2}>
            {resultEdges !== "" && (
              <TextField
                variant={"standard"}
                multiline
                label={"Edges"}
                maxRows={4}
                disabled
                value={resultEdges}
                sx={{ width: "50%" }}
                margin={"normal"}
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
                margin={"normal"}
              />
            )}
          </Box>
        </Collapse>

        {resultImage && resultImage.src && <SaveAsForm img={resultImage.src} />}
      </Box>
    </Box>
  );
};
