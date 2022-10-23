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

const url2Blob = async (url: string) => {
  return await fetch(url).then((r) => r.blob());
};

const blob2Base64 = (blob: Blob): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(blob);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });

const base64ToBlob = async (base64: string): Promise<Blob> => {
  const res = await fetch(base64);
  return res.blob();
};

export const base64ToURL = async (base64: string): Promise<string> => {
  return URL.createObjectURL(await base64ToBlob(base64));
};

export const URL2Base64 = async (url: string): Promise<string> => {
  return await blob2Base64(await url2Blob(url));
};

export const jimpToBase64 = async (source: Jimp): Promise<string> => {
  return await source.getBase64Async(source.getMIME());
};

export const URL2Blob = async (base64: string): Promise<Blob> => {
  const res = await fetch(base64);
  return res.blob();
};
