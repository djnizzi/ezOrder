import { LineEnding, OrderedItem, TxtItemData } from '../../types';

export interface TxtSerializerOptions {
  lineEnding?: LineEnding;
}

export function serializeTxt(items: OrderedItem<TxtItemData>[], defaultLineEnding: LineEnding = '\n', options: TxtSerializerOptions = {}): string {
  const ending = options.lineEnding || defaultLineEnding;
  return items.map((item) => item.data.text).join(ending);
}
