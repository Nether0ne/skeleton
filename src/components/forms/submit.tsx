import { Box, TextField } from "@mui/material";
import { FC } from "react";
import { Controller, useForm } from "react-hook-form";
import { LoadingButton } from "@mui/lab";

interface Form {
  input: string;
}

export const TestForm: FC = () => {
  const {
    handleSubmit,
    control,
    formState: { isValid, isSubmitting },
  } = useForm<Form>({
    mode: "onChange",
  });

  const onSubmit = ({ input }: Form) => {
    return new Promise(async (resolve, reject) => {
      setTimeout(() => {
        alert(input);
        resolve(true);
      }, 5000);
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
      }}>
      <Controller
        name="input"
        control={control}
        defaultValue=""
        render={({ field: { onChange, value }, fieldState: { error } }) => (
          <TextField
            label="Test"
            variant="outlined"
            color={!!value ? "success" : !error ? "primary" : "error"}
            value={value}
            onChange={onChange}
            error={!!error}
            helperText={error ? error.message : " "}
          />
        )}
      />
      <LoadingButton
        type="submit"
        loading={isSubmitting}
        disabled={!isValid}
        variant="contained">
        Login
      </LoadingButton>
    </Box>
  );
};
