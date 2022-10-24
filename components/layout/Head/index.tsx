import { FC } from "react";
import Head from "next/head";

interface Props {
  pageName: string;
}

export const CustomHead: FC<Props> = ({ pageName }) => {
  return (
    <Head>
      <title>{pageName}</title>
      <meta name="viewport" content="initial-scale=1.0, width=device-width" />
    </Head>
  );
};
