import { Image } from '@akashaorg/typings/lib/ui';

type FormLink = {
  id: string;
  href: string;
};

export type EditProfileFormValues = {
  name?: string;
  bio?: string;
  nsfw?: boolean;
  links: FormLink[];
  avatar?: Image | File;
  coverImage?: Image | File;
};
