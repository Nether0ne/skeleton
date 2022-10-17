import Jimp from "jimp";
import { zhangSuenThinning } from "@helpers/processing/zhangSuen";
import { ZhangSuenResponse } from "@customTypes/system";

const readImage = async (
  pathToFile: string = "https://i.imgur.com/wLhwSTm.png",
): Promise<Jimp> => {
  const img: Jimp = await Jimp.read(pathToFile);
  return resizeImage(img, 150, 150);
};

const writeImage = async (img: Jimp, path: string): Promise<string> => {
  const d = new Date();
  const route = `${path}${d.getUTCDate()}_${d.getUTCMonth()}_${d.getUTCFullYear()}_${d.getUTCHours()}${d.getUTCMinutes()}${d.getUTCSeconds()}.png`;
  await img.writeAsync(route);
  console.log("wrote to " + route);
  return route;
};

const resizeImage = (
  source: Jimp,
  resizeWidth: number = 150,
  resizeHeight: number = 150,
): Jimp => {
  return source.resize(resizeWidth, resizeHeight, source.getMIME());
};

const convertToBlackAndWhite = (source: Jimp): Jimp => {
  return source.greyscale().contrast(1);
};

const generateSkeleton = async (source: Jimp): Promise<ZhangSuenResponse> => {
  const { img: skeleton } = await zhangSuenThinning(source);
  await writeImage(skeleton, "./public/output/");
  return zhangSuenThinning(source);
};

export { readImage, convertToBlackAndWhite, generateSkeleton };
