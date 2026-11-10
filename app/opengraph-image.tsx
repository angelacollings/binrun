import { createSocialImage, socialImageAlt, socialImageSize } from './social-image';

export const alt = socialImageAlt;
export const contentType = 'image/png';
export const size = socialImageSize;

export default function OpenGraphImage() {
  return createSocialImage();
}
