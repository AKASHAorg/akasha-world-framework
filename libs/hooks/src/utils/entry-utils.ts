import getSDK from '@akashaorg/core-sdk';
import { Logger } from '@akashaorg/core-sdk';
import type {
  BeamData,
  RawBeamData,
  RawReflectionData,
  ReflectionData,
  SlateDescendant,
} from '@akashaorg/typings/lib/ui';

/**
 * Utility to decode base64 slate content
 */
export const decodeb64SlateContent = (base64Content: string, logger?: Logger) => {
  try {
    const stringContent = window.atob(base64Content);
    const stringified = fromBinary(stringContent);
    const result = JSON.parse(stringified);
    return result;
  } catch (err) {
    if (logger) {
      logger.error(`Error parsing content: ${err.message}`);
    }
    return null;
  }
};

/**
 * Utility to encode slate content to base64
 */
export const encodeSlateToBase64 = (slateContent: SlateDescendant[]) => {
  const stringified = JSON.stringify(slateContent);
  const binary = toBinary(stringified);
  const encoded = window.btoa(binary);
  return encoded;
};

function toBinary(data: string) {
  const codeUnits = new Uint16Array(data.length);
  for (let i = 0; i < codeUnits.length; i++) {
    codeUnits[i] = data.charCodeAt(i);
  }
  return String.fromCharCode(...new Uint8Array(codeUnits.buffer));
}

function fromBinary(binary: string) {
  let result = binary;

  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < bytes.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  result = String.fromCharCode(...new Uint16Array(bytes.buffer));

  return result;
}

/**
 * Utility to map reflect entry data
 * @deprecated Use selectors and pass only the required data to child components.
 */
export const mapReflectEntryData = (reflection?: RawReflectionData): ReflectionData => {
  if (!reflection) return null;

  return {
    id: reflection.id,
    active: reflection.active,
    authorId: reflection.author.id,
    createdAt: reflection.createdAt,
    content: reflection.content,
    nsfw: reflection?.nsfw,
    beamID: reflection.beam?.id,
  };
};

/**
 * Utility to map beam entry data
 * @deprecated Use selectors and pass only the required data to child components.
 * For example if you have a component that expects an object representing the beam data, but it does not
 * use all the properties:
 *
 * ```
 * const beamReq = useGetBeamsById();
 * <MyBeam beamData={{
 *   id: selectBeamId(beamReq.data),
 *   createdAt: selectCreatedAt(beamReq.data)
 * }}>
 *
 * // now you can easily decouple MyBeam component
 * const MyBeam = (props: {beamData: {id: string, createdAt: string}})
 * ```
 * Any kind of manipulation and transform of data should happen as close to the displaying component as possible.
 * If the component that receives the data is not using (only passing it down) it should not modify it!
 *
 * If an external or third party library is required to do the transforms,then do it in the last child that has access
 * to that library. Example: Image component requires the src to be a valid URL but the src you have from the
 * model is multiAddr and requires transformation using the SDK.
 * In this case you would do the transform it exactly before passing it to the image:
 * ```
 * <Image src={sdk.services.multiAddrToURL(selectImageSrc(props.beamData))} />
 * ```
 */
export const mapBeamEntryData = (beam?: RawBeamData): BeamData => {
  if (!beam) return null;
  const sdk = getSDK();
  return {
    id: beam.id,
    active: beam.active,
    authorId: beam.author.id,
    createdAt: beam.createdAt,
    content: beam.content,
    nsfw: beam?.nsfw,
    tags: beam?.tags
      ?.filter(labeledTag => labeledTag.labelType === sdk.services.gql.labelTypes.TAG)
      .map(labeledTag => labeledTag.value),
    reflectionsCount: beam?.reflectionsCount,
    appVersionID: beam.appVersionID,
    appID: beam.appID,
  };
};
