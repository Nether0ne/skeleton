import Jimp from "jimp/*";
import { NextApiRequest } from "next";

export interface Image {
  fieldName: string;
  originalFileName: string;
  path: string;
  headers: { [key: string]: string };
  size: number;
}

export interface NextApiRequestWithImage extends NextApiRequest {
  files: {
    image: Image[];
  };
}

export interface SkeletonSuccessResponse extends SkeletonResult {}

export interface SkeletonRequest {
  base64: string;
  options: string;
}

export interface SkeletonResult {
  base64: string;
  points?: number[][];
  branches?: number[][];
}

export interface VisualizeOptions {
  w: number;
  h: number;
  points: PointsOption;
  branches: BranchesOption;
}

export interface Option {
  required: boolean;
}

export interface PointsOption extends Option {
  additional: ColoredPointsOption;
}

export interface ColoredPointsOption extends Option {
  color?: string;
}

export interface BranchesOption extends Option {
  additional: ColoredBranchesOption;
}

export interface ColoredBranchesOption extends Option {
  color?: string;
  r?: number;
}

export interface ZhangSuenResult {
  img: Jimp;
  points?: number[][];
  branches?: number[][];
}

export interface DecolorizeRequest {
  base64: string;
}

export interface DecolorizeSuccessResponse {
  base64: string;
}

export interface GalleryItem {
  src: string;
  w: number;
  h: number;
}
