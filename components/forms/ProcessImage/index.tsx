import {
  Box,
  Checkbox,
  Collapse,
  FormControlLabel,
  ImageList,
  ImageListItem,
  TextField,
} from "@mui/material";
import Image from "next/image";
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
  const [resultImage, setResultImage] = useState<string>("");
  const {
    getValues,
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
    const { w, h } = item;
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
        });

        if (res.status !== 200) {
          throw new Error(res.statusText);
        }

        const { base64, points, branches } =
          (await res.json()) as SkeletonSuccessResponse;
        const url = await base64ToURL(base64);
        resolve(setResultImage(url));
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
      sx={{
        display: "flex",
        flexDirection: "column",
        gap: 2,
        minWidth: "30rem",
      }}>
      {selectedImage && selectedImage.src !== "" && (
        <Preview img={selectedImage.src} />
      )}

      {resultImage !== "" && <Preview img={resultImage} />}

      <ImageList
        cols={2}
        gap={8}
        sx={{
          maxHeight: "15rem",
          overflow: "scroll-y",
          cursor: !isSubmitting ? "pointer" : "wait",
        }}>
        {gallery.map((i) => (
          <ImageListItem
            key={i.src}
            sx={{
              border: selectedImage?.src === i.src ? "3px solid white" : "none",
            }}>
            <Image
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
        disabled={isSubmitting}
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
          />
        )}
        rules={{
          required: "Image width is required",
          min: {
            value: 1,
            message: "Image width cannot be less than 1px",
          },
          max: {
            value: 5000,
            message: "Image width cannot be more than 5000px",
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
            value: 5000,
            message: "Image height cannot be more than 5000px",
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
              sx={{ width: "100%" }}
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
              label="branches color"
              variant="outlined"
              value={value}
              onChange={onChange}
              sx={{ width: "100%" }}
            />
          )}
        />
      </Collapse>

      <LoadingButton
        type={"submit"}
        loading={isSubmitting}
        disabled={selectedImage === null}
        variant={"contained"}
        color={"primary"}>
        Generate skeleton
      </LoadingButton>
    </Box>
  );
};
