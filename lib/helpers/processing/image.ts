import Jimp from "jimp";
import { zhangSuenThinning } from "@helpers/processing/zhangSuen";
import { SkeletonResult, VisualizeOptions } from "types";

const resizeImage = (
  source: Jimp,
  resizeWidth: number,
  resizeHeight: number,
): Jimp => {
  return source.resize(resizeWidth, resizeHeight, source.getMIME());
};

export const convertToBlackAndWhite = (source: Jimp): Jimp => {
  return source.greyscale().contrast(1);
};

export const base64ToJimp = async (base64: string): Promise<Jimp> => {
  return await Jimp.read(Buffer.from(base64));
};

export const jimpToBase64 = async (source: Jimp): Promise<string> => {
  return await source.getBase64Async(source.getMIME());
};

export const generateSkeleton = async (
  source: Jimp,
  options?: VisualizeOptions,
): Promise<SkeletonResult> => {
  const thinning = await zhangSuenThinning(source, options);
  const { points, branches } = thinning;
  const { w, h } = options || {};
  const skeleton = w && h ? resizeImage(thinning.img, w, h) : thinning.img;
  const base64 = await jimpToBase64(skeleton);

  return { base64, points, branches };
};
