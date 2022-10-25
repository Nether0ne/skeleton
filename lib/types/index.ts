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
  edges?: number[][];
  branches?: number[][];
}

export interface VisualizeOptions {
  w: number;
  h: number;
  edges: EdgesOption;
  branches: BranchesOption;
}

export interface Option {
  required: boolean;
}

export interface EdgesOption extends Option {
  additional?: ColoredEdgesOption;
}

export interface ColoredEdgesOption extends Option {
  color: string;
  r: number;
}

export interface BranchesOption extends Option {
  additional?: ColoredBranchesOption;
}

export interface ColoredBranchesOption extends Option {
  color: string;
  r: number;
}

export interface ZhangSuenResult {
  img: Jimp;
  edges?: number[][];
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
