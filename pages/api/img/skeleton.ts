import { ResponseError, SkeletonRequest, SkeletonSuccessResponse } from "types";
import { base64ToJimp, generateSkeleton } from "@helpers/processing/image";
import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<SkeletonSuccessResponse | ResponseError>,
) {
  try {
    const { base64, options } = req.body as SkeletonRequest;
    const jimp = await base64ToJimp(base64);
    const result = await generateSkeleton(jimp, options);

    res.status(200).json({ success: true, ...result });
  } catch (e: unknown) {
    if (e instanceof Error) {
      res.status(500).json({ success: false, error: e.message });
    } else {
      res
        .status(500)
        .json({ success: false, error: "Unknown error has occured." });
    }
  }
}
