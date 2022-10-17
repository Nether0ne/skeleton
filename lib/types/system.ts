import Jimp from "jimp";

export interface ZhangSuenResponse {
  img: Jimp;
  points?: number[][];
  branches?: number[][];
}

export interface VisualizeOptions {
  points?: Option;
  branches?: Option;
}

export interface Option {
  color?: string;
  required?: boolean;
}
