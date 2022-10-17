// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import {
  convertToBlackAndWhite,
  generateSkeleton,
  readImage,
} from "@helpers/processing/image";
import type { NextApiRequest, NextApiResponse } from "next";

type Data = {
  name: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Data>,
) {
  const img = await readImage();
  const baw = await convertToBlackAndWhite(img);
  const { img: skeleton } = await generateSkeleton(baw);
  res.status(200).json({ name: "John Doe" });
}
