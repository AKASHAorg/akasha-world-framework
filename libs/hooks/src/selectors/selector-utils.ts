export type NotEmpty<T> =
  T extends Record<string, unknown> ? (keyof T extends never ? never : T) : never;

/*
 *  type predicate to check if data has `node` property and node has an `id` property
 *  @returns true - if `data.node.id`
 */
export const isNodeWithId = <T extends { node?: { id?: string } }>(
  data: T,
): data is T & { node: NotEmpty<NonNullable<T['node']>> } => {
  return !!data?.node && typeof data.node === 'object' && 'id' in data.node;
};
/*
 *  type predicate to check if data has `node` property and node contains `isViewer` property
 *  @returns true - if `data.node.isViewer`
 */
export const isNodeWithIsViewer = <T extends { node?: { isViewer?: boolean } }>(
  data: T,
): data is T & { node: NotEmpty<NonNullable<T['node']>> } => {
  return !!data?.node && typeof data.node === 'object' && 'isViewer' in data.node;
};

/*
 *  type predicate to check if data has `node` property and `data.node` is not empty
 *  returns true - if  typeof `data.node` === object
 * */
export const isNodeObject = <T extends { node?: Record<string, unknown> }>(
  data: T,
): data is T & {
  node: NotEmpty<NonNullable<T['node']>>;
} => {
  return !!data?.node && typeof data.node === 'object' && Object.keys(data.node).length > 0;
};
