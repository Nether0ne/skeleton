import Jimp from "jimp";
import {
  getSkeletonBranches,
  getSkeletonPoints,
  modifyImage,
} from "@helpers/processing/visualize";
import { VisualizeOptions, ZhangSuenResponse } from "@customTypes/system";

const white = Jimp.rgbaToInt(0, 0, 0, 255);
const black = Jimp.rgbaToInt(255, 255, 255, 255);

const image2Bool = async (img: Jimp): Promise<boolean[][]> => {
  const width = img.getWidth();
  const height = img.getHeight();
  let s: boolean[][] = [];

  for (let y = 0; y < width; y++) {
    s[y] = [];
    for (let x = 0; x < height; x++) {
      s[y].push(img.getPixelColor(x, y) === black);
    }
  }

  return s;
};

const bool2Image = (
  s: boolean[][],
  height: number,
  width: number,
  ext: Jimp.MIMEType,
): Jimp => {
  const img = new Jimp(height, width, ext);

  for (let y = 0; y < width; y++) {
    for (let x = 0; x < height; x++) {
      const color = s[y][x] ? black : white;

      img.setPixelColor(color, x, y);
    }
  }

  return img;
};

const zhangSuenThinning = async (
  img: Jimp,
  options?: VisualizeOptions,
): Promise<ZhangSuenResponse> => {
  let s = await image2Bool(img);
  const { points, branches } = options || {};

  let temp: boolean[][] = s.slice().map((i) => i.slice());
  let count = 0;
  do // the missing iteration
  {
    count = step(1, temp, s);
    temp = s.slice().map((i) => i.slice()); // ..and on each..
    count += step(2, temp, s);
    temp = s.slice().map((i) => i.slice()); // ..call!
  } while (count > 0);

  const skeleton = bool2Image(
    s,
    img.getHeight(),
    img.getWidth(),
    img.getMIME(),
  );

  return {
    points:
      points && points.required ? await getSkeletonPoints(skeleton) : undefined,
    branches:
      branches && branches.required
        ? await getSkeletonBranches(skeleton)
        : undefined,
    img:
      points || branches
        ? await modifyImage(
            skeleton,
            points ? points.color : undefined,
            branches ? branches.color : undefined,
          )
        : skeleton,
  };
};

const step = (stepNo: number, temp: boolean[][], s: boolean[][]): number => {
  let count = 0;

  for (let a = 1; a < temp.length - 1; a++) {
    for (let b = 1; b < temp[0].length - 1; b++) {
      if (suenThinningAlg(a, b, temp, stepNo === 2)) {
        // still changes happening?
        if (s[a][b]) count++;
        s[a][b] = false;
      }
    }
  }
  return count;
};

const suenThinningAlg = (
  x: number,
  y: number,
  s: boolean[][],
  even: boolean,
): boolean => {
  const p2 = s[x][y - 1],
    p3 = s[x + 1][y - 1],
    p4 = s[x + 1][y],
    p5 = s[x + 1][y + 1],
    p6 = s[x][y + 1],
    p7 = s[x - 1][y + 1],
    p8 = s[x - 1][y],
    p9 = s[x - 1][y - 1];

  const bp1 = numberOfNonZeroNeighbors(x, y, s);
  if (bp1 >= 2 && bp1 <= 6) {
    //2nd condition
    if (numberOfZeroToOneTransitionFromP9(x, y, s) === 1) {
      if (even) {
        if (!(p2 && p4 && p8)) {
          if (!(p2 && p6 && p8)) {
            return true;
          }
        }
      } else {
        if (!(p2 && p4 && p6)) {
          if (!(p4 && p6 && p8)) {
            return true;
          }
        }
      }
    }
  }
  return false;
};

const numberOfZeroToOneTransitionFromP9 = (
  x: number,
  y: number,
  s: boolean[][],
): number => {
  const p2 = s[x][y - 1],
    p3 = s[x + 1][y - 1],
    p4 = s[x + 1][y],
    p5 = s[x + 1][y + 1],
    p6 = s[x][y + 1],
    p7 = s[x - 1][y + 1],
    p8 = s[x - 1][y],
    p9 = s[x - 1][y - 1];

  return (
    Number(!p2 && p3) +
    Number(!p3 && p4) +
    Number(!p4 && p5) +
    Number(!p5 && p6) +
    Number(!p6 && p7) +
    Number(!p7 && p8) +
    Number(!p8 && p9) +
    Number(!p9 && p2)
  );
};

const numberOfNonZeroNeighbors = (
  x: number,
  y: number,
  s: boolean[][],
): number => {
  let count = 0;
  if (s[x - 1][y]) count++;
  if (s[x - 1][y + 1]) count++;
  if (s[x - 1][y - 1]) count++;
  if (s[x][y + 1]) count++;
  if (s[x][y - 1]) count++;
  if (s[x + 1][y]) count++;
  if (s[x + 1][y + 1]) count++;
  if (s[x + 1][y - 1]) count++;
  return count;
};

// Another implementation of zhang suen algorithm, which provides worse resutls
//
// const zhangSuenThinning = async (img: Jimp): Promise<ZhangSuenResponse> => {
//   const height = img.getHeight();
//   const width = img.getWidth();
//   let s = await image2Bool(img);

//   const drawLine = (
//     s: boolean[][],
//     x1: number,
//     y1: number,
//     x2: number,
//     y2: number,
//     val: boolean,
//   ) => {
//     const dx = x2 - x1;
//     const dy = y2 - y1;

//     for (let x = x1; x < x2; x++) {
//       const y = y1 + (dy * (x - x1)) / dx;
//       s[x][y] = val;
//     }
//   };

//   let open = false;
//   for (let y = 0; y < height; y++) {
//     let start = y;
//     for (let x = 0; x < width; x++) {
//       if (!open) {
//         if (s[x][y]) {
//           open = true;
//           start = x;
//         }
//       } else if (!s[x][y]) {
//         open = false;
//         const x0 = x - 1;
//         const c = Math.round((start + x0) / 2);
//         drawLine(s, start, y, c - 1, y, false);
//         drawLine(s, c + 1, y, x0, y, false);
//       }
//     }
//   }

//   open = false;

//   for (let x = 0; x < width; x++) {
//     let start = x;
//     for (let y = 0; y < height; y++) {
//       if (!open) {
//         if (s[x][y]) {
//           open = true;
//           start = y;
//         }
//       } else if (!s[x][y]) {
//         open = false;
//         const y0 = y - 1;
//         const c = Math.round((start + y0) / 2);
//         s[x][c] = true;
//       }
//     }
//   }

//   return { img: bool2Image(s, height, width, img.getMIME()) };
// };

export { zhangSuenThinning };
