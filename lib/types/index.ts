import Jimp from "jimp/*";

export interface Response {
  success: boolean;
}

export interface ResponseError {
  error: string;
}

export interface SkeletonSuccessResponse extends Response, SkeletonResult {}

export interface SkeletonRequest {
  base64: string;
  options: VisualizeOptions;
}

export interface SkeletonResult {
  base64: string;
  points?: number[][];
  branches?: number[][];
}

export interface VisualizeOptions {
  w?: number;
  h?: number;
  points?: PointsOption;
  branches?: BranchesOption;
}

export interface Option {
  required?: boolean;
}

export interface PointsOption extends Option {
  color?: string;
}

export interface BranchesOption extends Option {
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

export interface DecolorizeSuccessResponse extends Response {
  base64: string;
}
