import { DecolorizeSuccessResponse, NextApiRequestWithImage } from "types";
import {
  convertToBlackAndWhite,
  jimpToBase64,
} from "@helpers/processing/image";
import type { NextApiResponse } from "next";
import nextConnect from "next-connect";
import filesMiddleware from "@helpers/middleware/files";
import Jimp from "jimp";

const handler = nextConnect();
handler.use(filesMiddleware);

handler.post(
  async (
    req: NextApiRequestWithImage,
    res: NextApiResponse<DecolorizeSuccessResponse | string>,
  ) => {
    try {
      if (!req.files || req.files.image.length === 0 || !req.files.image[0]) {
        throw new Error("No image provided");
      }

      const jimp = await Jimp.read(req.files.image[0].path);
      const newBase64 = await jimpToBase64(convertToBlackAndWhite(jimp));

      res.status(200).json({ base64: newBase64 });
    } catch (e: unknown) {
      if (e instanceof Error) {
        res.statusMessage = e.message;
      } else {
        res.statusMessage = "Unknown error has occured.";
      }
      res.status(500).send("");
    }
  },
);

export const config = {
  api: {
    bodyParser: false,
  },
};

export default handler;