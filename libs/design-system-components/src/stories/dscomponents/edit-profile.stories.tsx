import type { Meta, StoryObj } from '@storybook/react';
import EditProfile, { EditProfileProps } from '../../components/EditProfile';

const meta: Meta<EditProfileProps> = {
  title: 'DSComponents/Profile/Edit',
  component: EditProfile,
};

type Story = StoryObj<EditProfileProps>;

export const Default: Story = {
  args: {
    header: {
      title: 'Avatar & Cover Image',
      profileId: 'did:key:003410490050000320006570034567114572000',
      coverImage: {
        default: {
          src: 'https://static.licdn.com/sc/h/55k1z8997gh8dwtihm11aajyq',
          height: 360,
          width: 360,
        },
      },
      avatar: { default: { src: 'https://placebeard.it/360x360', height: 360, width: 360 } },
      cancelLabel: 'Cancel',
      deleteLabel: 'Delete',
      saveLabel: 'Save',
      imageTitle: {
        avatar: { label: 'Edit Avatar' },
        coverImage: { label: 'Edit Cover' },
      },
      deleteTitle: {
        avatar: { label: 'Delete Avatar' },
        coverImage: { label: 'Delete Cover' },
      },
      confirmationLabel: {
        avatar: 'Are you sure you want to delete your avatar?',
        coverImage: 'Are you sure you want to delete your cover?',
      },
      cropErrorLabel: 'Erro cropping image',
      publicImagePath: '/images',
      dragToRepositionLabel: 'Drag to reposition',
      isSavingImage: false,
      onImageSave: () => ({}),
      transformSource: () => ({
        src: 'https://placebeard.it/360x360',
        width: 360,
        height: 360,
      }),
    },
    name: { label: 'Name', initialValue: 'Mr. Snowman' },
    bio: {
      label: 'Bio',
      initialValue: 'Bio',
    },
    cancelButton: {
      label: 'Cancel',
      handleClick: () => ({}),
    },
    saveButton: {
      label: 'Save',
      handleClick: () => ({}),
    },
    linkLabel: 'External URLs',
    addNewLinkButtonLabel: 'Add new',
    description: 'You can add your personal websites or social links to be shared on your profile',
    nsfw: {
      label: 'Select NSFW if your profile contains mature or explicit content.',
      description: '',
      initialValue: false,
    },
  },
};

export default meta;
