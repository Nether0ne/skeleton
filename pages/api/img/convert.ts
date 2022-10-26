import { ConvertSuccessResponse, NextApiRequestWithImage } from "types";
import { jimpToBase64 } from "@helpers/processing/image";
import type { NextApiResponse } from "next";
import nextConnect from "next-connect";
import filesMiddleware from "@helpers/middleware/files";
import Jimp from "jimp";

const handler = nextConnect();
handler.use(filesMiddleware);

handler.post(
  async (
    req: NextApiRequestWithImage,
    res: NextApiResponse<ConvertSuccessResponse | string>,
  ) => {
    try {
      if (!req.files || req.files.image.length === 0 || !req.files.image[0]) {
        throw new Error("No image provided");
      }

      const path = req.files.image[0].path;
      const ext = path.split(".").pop();

      const jimp = await Jimp.read(req.files.image[0].path);
      const newBase64 = await jimpToBase64(jimp, ext);

      res.status(200).json({ base64: newBase64 });
    } catch (e: unknown) {
      if (e instanceof Error && e.message !== "") {
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
    responseLimit: "4mb",
  },
};

export default handler;
