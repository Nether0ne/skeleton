import nextConnect from "next-connect";
import multiparty from "multiparty";
import { NextApiRequestWithImage } from "@/lib/types";

const filesMiddleware = nextConnect();

filesMiddleware.use(async (req: NextApiRequestWithImage, _res, next) => {
  const form = new multiparty.Form();

  await form.parse(req, (_err, fields, files) => {
    req.body = fields;
    req.files = files;
    next();
  });
});

export default filesMiddleware;
