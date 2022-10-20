import {
  DecolorizeRequest,
  DecolorizeSuccessResponse,
  ResponseError,
} from "types";
import {
  base64ToJimp,
  convertToBlackAndWhite,
  jimpToBase64,
} from "@helpers/processing/image";
import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<DecolorizeSuccessResponse | ResponseError>,
) {
  try {
    const { base64 } = req.body as DecolorizeRequest;
    const jimp = await base64ToJimp(base64);
    const newBase64 = await jimpToBase64(convertToBlackAndWhite(jimp));

    res.status(200).json({ success: true, base64: newBase64 });
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
