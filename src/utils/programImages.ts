import { Program, ContentItem } from '../types';

const CATEGORY_IMAGES: Record<string, string> = {
  'Digital Training': 'https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&w=800&q=80',
  'Keterampilan Digital': 'https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&w=800&q=80',
  'Kepemudaan': 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=800&q=80',
  'Kewirausahaan': 'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?auto=format&fit=crop&w=800&q=80',
  'Sosial': 'https://images.unsplash.com/photo-1559027615-cd4628902d4a?auto=format&fit=crop&w=800&q=80',
  'Pengembangan Diri': 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=800&q=80',
  'Default': 'https://images.unsplash.com/photo-1517048676732-d65bc937f952?auto=format&fit=crop&w=800&q=80',
};

const CONTENT_TYPE_IMAGES: Record<string, string> = {
  article: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=800&q=80',
  audio: 'https://images.unsplash.com/photo-1478737270239-2f02b77fc618?auto=format&fit=crop&w=800&q=80',
  video: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=800&q=80',
  image: 'https://images.unsplash.com/photo-1618477461853-cf6ed80faba5?auto=format&fit=crop&w=800&q=80',
  campaign: 'https://images.unsplash.com/photo-1559027615-cd4628902d4a?auto=format&fit=crop&w=800&q=80',
  activity: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?auto=format&fit=crop&w=800&q=80',
};

export function getProgramImage(program: Program): string {
  if (program.cover_image_path && program.cover_image_path.trim() !== '') {
    return program.cover_image_path;
  }
  return CATEGORY_IMAGES[program.category] || CATEGORY_IMAGES['Default'];
}

export function getContentImage(content: ContentItem): string {
  if (content.thumbnail_path) return content.thumbnail_path;
  if (
    content.media_path &&
    ['article', 'image', 'campaign', 'activity'].includes(content.content_type)
  ) {
    return content.media_path;
  }
  return CONTENT_TYPE_IMAGES[content.content_type] || CONTENT_TYPE_IMAGES['article'];
}
