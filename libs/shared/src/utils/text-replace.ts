export function textReplace(text: string, dataList: (number | string)[]) {
  for (const [index, dataItem] of dataList.entries()) {
    const dataItemStr =
      typeof dataItem === 'number' ? dataItem.toString() : dataItem;
    text = text.replace(`$${index + 1}`, dataItemStr);
  }
  return text;
}
