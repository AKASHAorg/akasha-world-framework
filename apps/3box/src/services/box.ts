// @ts-ignore
import Box from '3box';
// @ts-ignore
import * as boxConfig from '3box/src/config';
import { IUpdateProfilePayload } from '../state';
import { IBoxImage } from '../utils/box-image-utils';

export interface IBoxSettings {
  pinningNode: string;
  addressServer: string;
}

let box: Box;

export const getProfile = async (ethAddress: string) => {
  return Box.getProfile(ethAddress);
};

export const getEthAddress = async (
  cache: { entries: { has: (arg0: string) => any }; get: (arg0: string) => any },
  web3Instance: { getSigner: () => any },
): Promise<string> => {
  let ethAddress: string = '';
  const signer = await web3Instance.getSigner();
  if (cache.entries.has('auth')) {
    const authValue = cache.get('auth');
    if (authValue.hasOwnProperty('ethAddress')) {
      ethAddress = authValue.ethAddress;
    }
  }
  if (!ethAddress) {
    try {
      ethAddress = await signer.getAddress();
    } catch (err) {
      throw new Error('Cannot get ethereum address!');
    }
  }
  return ethAddress;
};
const getEthProvider = (
  signer: { signMessage: (arg0: any) => Promise<any> },
  web3Utils: { toUtf8String: (arg0: any) => any; joinSignature: (arg0: any) => any },
) => ({
  sendAsync: function sendAsync(data: any, cb: any) {
    signer
      .signMessage(web3Utils.toUtf8String(data.params[0]))
      .then((result: any) => cb(null, { result: web3Utils.joinSignature(result) }));
  },
});

const getPublicProfileData = async (ethAddress: string) => {
  const profile = await box.public.all();
  return {
    ethAddress,
    profileData: profile,
  };
};

export const authenticateBox = async (
  web3Instance: { getSigner: () => any },
  web3Utils: { toUtf8String: (arg0: any) => any; joinSignature: (arg0: any) => any },
  settings: IBoxSettings,
  ethAddress: string,
  ipfsInstance?: any,
) => {
  try {
    const signer = await web3Instance.getSigner();
    let currentSettings = getDefaultBoxSettings();
    if (settings) {
      currentSettings = settings;
    }
    // tslint:disable-next-line:no-console
    console.log(ipfsInstance);
    box = await Box.openBox(ethAddress, getEthProvider(signer, web3Utils), {
      pinningNode: currentSettings.pinningNode,
      addressServer: currentSettings.addressServer,
      // iframeCache: !ipfsInstance,
      // ipfs: ipfsInstance,
    });
    const space = await box.openSpace('akasha-ewa');
    await box.syncDone;
    await space.syncDone;
    return getPublicProfileData(ethAddress);
  } catch (err) {
    throw new Error(err.message);
  }
};

export const updateBoxData = async (
  profileData: Omit<IUpdateProfilePayload, 'avatar' | 'coverImage'> & {
    image?: IBoxImage[] | null;
    coverImage?: IBoxImage[] | null;
  },
) => {
  const { ethAddress, image, coverImage, ...newProfileData } = profileData;
  if (!ethAddress) {
    // tslint:disable-next-line:no-console
    console.error('ethereum address not provided!');
  }
  // auth user if it's not logged in
  if (!Box.isLoggedIn(ethAddress) && box) {
    await box.auth(['akasha-ewa'], { address: ethAddress });
  }
  // update profile data
  // Keys with values are updated
  // Keys with null values are removed
  // keys with undefined values.. well.. remains undefined (not stored)
  await box.syncDone;
  try {
    const fieldsToUpdate = Object.keys(newProfileData).filter(
      (key: string) =>
        newProfileData[key] && (newProfileData[key] !== undefined || newProfileData[key] !== null),
    );

    const fieldsToRemove = Object.keys(newProfileData)
      .filter((key: string) => newProfileData[key] === null)
      .map(keyToRm => box.public.remove(keyToRm));

    const values = fieldsToUpdate.map((fieldKey: string) => newProfileData[fieldKey]);
    if (image) {
      fieldsToUpdate.push('image');
      values.push(image);
    } else if (image === null) {
      fieldsToRemove.push(box.public.remove('image'));
    }
    if (coverImage) {
      fieldsToUpdate.push('coverPhoto');
      values.push(coverImage);
    } else if (coverImage === null) {
      fieldsToRemove.push(box.public.remove('coverPhoto'));
    }
    const updateSuccess = await box.public.setMultiple(fieldsToUpdate, values);
    const rmSuccess = await Promise.all(fieldsToRemove);
    if (updateSuccess && rmSuccess) {
      // get fresh data
      await box.syncDone;
      const fetchedProfileData = await box.public.all();
      return {
        ethAddress,
        profileData: fetchedProfileData,
      };
    }
    throw new Error('Cannot update your profile data. This is a 3Box response!');
  } catch (err) {
    throw new Error(err.message);
  }
};

export const getDefaultBoxSettings = () => {
  return {
    pinningNode: boxConfig.pinning_node,
    addressServer: boxConfig.address_server_url,
  };
};
