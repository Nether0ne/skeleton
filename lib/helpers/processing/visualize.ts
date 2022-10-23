import Jimp from "jimp";

const white = Jimp.rgbaToInt(0, 0, 0, 255);
const black = Jimp.rgbaToInt(255, 255, 255, 255);

const getSkeletonPoints = (img: Jimp): number[][] => {
  const height = img.getHeight();
  const width = img.getWidth();

  let s: number[][] = [];

  for (let y = 0; y < height; y++) {
    s[y] = [];
    for (let x = 0; x < width; x++) {
      s[y].push(img.getPixelColor(x, y));
    }
  }

  const points = [];

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const p1 = s[y][x],
        p2 = x + 1 !== width ? s[y][x + 1] : p1,
        p3 = x + 1 !== width && y + 1 !== height ? s[y + 1][x + 1] : p1,
        p4 = y + 1 !== height ? s[y + 1][x] : p1,
        p5 = x - 1 > 0 && y + 1 !== height ? s[y + 1][x - 1] : p1,
        p6 = x - 1 > 0 ? s[y][x - 1] : p1,
        p7 = x - 1 > 0 && y - 1 > 0 ? s[y - 1][x - 1] : p1,
        p8 = y - 1 > 0 ? s[y - 1][x] : p1,
        p9 = y - 1 > 0 && x + 1 !== width ? s[y - 1][x + 1] : p1;

      if (p1 === p2 && p1 === p6) {
        // horizontal line, continue
        continue;
      } else if (p1 === p4 && p1 === p8) {
        // vertical line, continue
        continue;
      } else if (p1 === p3 && p1 === p7) {
        // diagonal line, continue
        continue;
      } else if (p1 === p5 && p1 === p9) {
        // another diagonal, continue
        continue;
      } else {
        // else we found line changes
        points.push([y, x]);
      }
    }
  }

  return points;
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

  const points = [];

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
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
        Number(!p2 && p3) +
        Number(!p3 && p4) +
        Number(!p4 && p5) +
        Number(!p5 && p6) +
        Number(!p6 && p7) +
        Number(!p7 && p8) +
        Number(!p8 && p9) +
        Number(!p9 && p2);

      // if more than 2 points are the same color - we have a branch point
      if (merges > 2) {
        points.push([y, x]);
      }
    }
  }

  return points;
};

const modifyImage = (img: Jimp, points?: string, branching?: string): Jimp => {
  const modifiedImage = img.clone();

  const pointsArray = getSkeletonPoints(img);

  if (points) {
    for (const [y, x] of pointsArray) {
      modifiedImage.setPixelColor(Jimp.cssColorToHex(points), x, y);
    }
  }

  if (branching) {
    const branchesArray = getSkeletonBranches(img);
    for (const [y, x] of branchesArray) {
      modifiedImage.setPixelColor(Jimp.cssColorToHex(branching), x, y);
    }
  }

  return modifiedImage;
};

export { getSkeletonPoints, getSkeletonBranches, modifyImage };
