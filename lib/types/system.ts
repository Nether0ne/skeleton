import Jimp from "jimp";

export interface ZhangSuenResponse {
  img: Jimp;
  points?: number[][];
  branches?: number[][];
}
