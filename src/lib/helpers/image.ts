import Jimp from "jimp";

const white = 0xffffff;
const black = 0x000000;

const imageToPixels = async (
  pathToFile: string = "/test.png"
): Promise<number[][]> => {
  const image = await Jimp.read(pathToFile);
  const height = image.getHeight();
  const width = image.getWidth();

  let pixels = new Array(height).fill(new Array(width));

  for (let i = 0; i < height; i++) {
    pixels[i] = [];

    for (let j = 0; j < width; j++) {
      const color = image.getPixelColor(i, j);
      pixels[i][j] = color;
    }
  }

  return pixels;
};

const toBinaryColors = (pixels: number[][]) => {
  for (let i = 0; i < pixels.length; i++) {
    for (let j = 0; j < pixels[i].length; j++) {
      if ((pixels[i][j] & 0xff) > 256 / 2) {
        pixels[i][j] = white;
      } else {
        pixels[i][j] = black;
      }
    }
  }
};

const generateSkeleton = async (pixels: number[][]) => {
  let open = false;

  for (let y = 0; y < pixels.length; y++) {
    for (let x = 0; x < pixels[y].length; x++) {
      let start = 0;

      if (!open) {
        if (pixels[y][x] === white) {
          open = true;
          start = x;
        }
      } else {
        if (pixels[y][x] === black) {
          open = false;

          let x0 = x - 1;
          let c = Math.round((start + x0) / 2);
          drawLine(pixels, start, y, c - 1, y, white);
          drawLine(pixels, c + 1, y, x0, y, white);
        }
      }
    }
  }
};

const drawLine = (
  pixels: number[][],
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  color: number
) => {
  const dx = x2 - x1;
  const dy = y2 - y1;

  for (let x = x1; x1 < x2; x++) {
    const y = y1 + (dy * (x - x1)) / dx;
    pixels[y][x] = color;
  }
};

const pixelsToImage = async (pixels: number[][]): Promise<string> => {
  const image = new Jimp(pixels);

  for (let i = 0; i < pixels.length; i++) {
    for (let j = 0; j < pixels[i].length; j++) {
      image.setPixelColor(i, j, pixels[i][j]);
    }
  }

  await image.write("/test_result.png");
  return "test.png";
};

export { imageToPixels, toBinaryColors, pixelsToImage, generateSkeleton };
