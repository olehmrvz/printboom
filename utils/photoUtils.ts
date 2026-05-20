import { Photo, PhotoFilter } from "@/types";
import { v4 as uuid } from "uuid";

export function createPhoto(file: File): Promise<Photo> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      resolve({
        id: uuid(),
        src: reader.result as string,
        file,
        filter: "none",
        zoom: 1,
        offsetX: 0,
        offsetY: 0,
      });
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export function createPhotos(files: File[]): Promise<Photo[]> {
  return Promise.all(files.map(createPhoto));
}

export function applyFilter(ctx: CanvasRenderingContext2D, filter: PhotoFilter, width: number, height: number) {
  const imageData = ctx.getImageData(0, 0, width, height);
  const data = imageData.data;

  switch (filter) {
    case "bw": {
      for (let i = 0; i < data.length; i += 4) {
        const gray = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
        data[i] = gray;
        data[i + 1] = gray;
        data[i + 2] = gray;
      }
      break;
    }
    case "contrast": {
      const contrast = 1.4;
      const factor = (259 * (contrast * 255 + 255)) / (255 * (259 - contrast * 255 + 255));
      for (let i = 0; i < data.length; i += 4) {
        data[i] = factor * (data[i] - 128) + 128;
        data[i + 1] = factor * (data[i + 1] - 128) + 128;
        data[i + 2] = factor * (data[i + 2] - 128) + 128;
      }
      break;
    }
    case "grain": {
      for (let i = 0; i < data.length; i += 4) {
        const noise = (Math.random() - 0.5) * 40;
        data[i] += noise;
        data[i + 1] += noise;
        data[i + 2] += noise;
      }
      break;
    }
  }

  ctx.putImageData(imageData, 0, 0);
}

export function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}
