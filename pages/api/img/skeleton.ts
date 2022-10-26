import {
  DecolorizeSuccessResponse,
  NextApiRequestWithImage,
  SkeletonRequest,
} from "types";
import { generateSkeleton } from "@helpers/processing/image";
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
      const { options } = req.body as SkeletonRequest;
      let parsedOptions = JSON.parse(options);
      parsedOptions.w = parseInt(parsedOptions.w);
      parsedOptions.h = parseInt(parsedOptions.h);
      parsedOptions.edges.additional.r = parseInt(
        parsedOptions.edges.additional.r as string,
      );
      parsedOptions.branches.additional.r = parseInt(
        parsedOptions.branches.additional.r as string,
      );

      if (!req.files || req.files.image.length === 0 || !req.files.image[0]) {
        throw new Error("No image provided");
      }

      const jimp = await Jimp.read(req.files.image[0].path);
      const result = await generateSkeleton(jimp, parsedOptions);

      res.status(200).json(result);
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
    responseLimit: "4mb",
  },
};

export default handler;
