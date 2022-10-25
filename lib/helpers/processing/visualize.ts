import { ColoredBranchesOption, ColoredEdgesOption } from "types";
import Jimp from "jimp";

const black = Jimp.rgbaToInt(255, 255, 255, 255);

const getSkeletonEdges = (img: Jimp): number[][] => {
  const height = img.getHeight();
  const width = img.getWidth();

  let s: boolean[][] = [];

  for (let y = 0; y < height; y++) {
    s[y] = [];
    for (let x = 0; x < width; x++) {
      s[y].push(img.getPixelColor(x, y) === black);
    }
  }

  const edges = [];

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      if (s[y][x]) {
        const p1 = s[y][x],
          p2 = x + 1 !== width ? s[y][x + 1] : p1,
          p3 = x + 1 !== width && y + 1 !== height ? s[y + 1][x + 1] : p1,
          p4 = y + 1 !== height ? s[y + 1][x] : p1,
          p5 = x - 1 > 0 && y + 1 !== height ? s[y + 1][x - 1] : p1,
          p6 = x - 1 > 0 ? s[y][x - 1] : p1,
          p7 = x - 1 > 0 && y - 1 > 0 ? s[y - 1][x - 1] : p1,
          p8 = y - 1 > 0 ? s[y - 1][x] : p1,
          p9 = y - 1 > 0 && x + 1 !== width ? s[y - 1][x + 1] : p1;

        const merges =
          Number(p1 && p2) +
          Number(p1 && p3) +
          Number(p1 && p4) +
          Number(p1 && p5) +
          Number(p1 && p6) +
          Number(p1 && p7) +
          Number(p1 && p8) +
          Number(p1 && p9);

        // if only 1 point has the same color - we have an edge point
        if (merges === 1) {
          edges.push([x, y]);
        }
      }
    }
  }

  return edges;
};

const getSkeletonBranches = (img: Jimp): number[][] => {
  const height = img.getHeight();
  const width = img.getWidth();

  let s: boolean[][] = [];

  for (let y = 0; y < height; y++) {
    s[y] = [];
    for (let x = 0; x < width; x++) {
      s[y].push(img.getPixelColor(x, y) === black);
    }
  }

  const branches = [];

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      if (s[y][x]) {
        const p1 = s[y][x],
          p2 = x + 1 !== width ? s[y][x + 1] : p1,
          p3 = x + 1 !== width && y + 1 !== height ? s[y + 1][x + 1] : p1,
          p4 = y + 1 !== height ? s[y + 1][x] : p1,
          p5 = x - 1 > 0 && y + 1 !== height ? s[y + 1][x - 1] : p1,
          p6 = x - 1 > 0 ? s[y][x - 1] : p1,
          p7 = x - 1 > 0 && y - 1 > 0 ? s[y - 1][x - 1] : p1,
          p8 = y - 1 > 0 ? s[y - 1][x] : p1,
          p9 = y - 1 > 0 && x + 1 !== width ? s[y - 1][x + 1] : p1;

        const merges =
          Number(p1 && p2) +
          Number(p1 && p3) +
          Number(p1 && p4) +
          Number(p1 && p5) +
          Number(p1 && p6) +
          Number(p1 && p7) +
          Number(p1 && p8) +
          Number(p1 && p9);

        // if more than 2 points are the same color - we have a branch point
        if (merges > 2) {
          branches.push([x, y]);
        }
      }
    }
  }

  return branches;
};

const modifyImage = (
  img: Jimp,
  edges?: ColoredEdgesOption,
  branches?: ColoredBranchesOption,
): Jimp => {
  const modifiedImage = img.clone();

  if (edges && edges.required) {
    const { r: rEdges, color: cEdges } = edges;
    const edgesArray = getSkeletonEdges(img);
    for (const [x, y] of edgesArray) {
      drawCircle(modifiedImage, x, y, rEdges, cEdges);
    }
  }

  if (branches && branches.required) {
    const { r: rBranches, color: cBranches } = branches;
    const branchesArray = getSkeletonBranches(img);
    for (const [x, y] of branchesArray) {
      drawCircle(modifiedImage, x, y, rBranches, cBranches);
    }
  }

  return modifiedImage;
};

const drawCircle = (
  img: Jimp,
  xo: number,
  yo: number,
  r: number,
  color: string,
) => {
  let angle;

  for (let i = 0; i < 100; i++) {
    // Change the angle
    angle = i * 2 * (Math.PI / 100);

    img.setPixelColor(
      Jimp.cssColorToHex(color),
      xo + Math.cos(angle) * r,
      yo + Math.sin(angle) * r,
    );
  }
};

export { getSkeletonEdges, getSkeletonBranches, modifyImage };
