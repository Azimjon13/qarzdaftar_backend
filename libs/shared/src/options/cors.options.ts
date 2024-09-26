export const whiteList: RegExp[] = [
  /http:\/\/localhost:[0-9]{4}$/,
  /https:\/\/[^\.]*\.anysoft\.uz$/,
];
export const corsOptions = {
  origin: function (
    origin: string,
    callback: (arg0: null, arg1: boolean) => void,
  ) {
    if (!origin || whiteList.some((w) => origin.match(w))) {
      callback(null, true);
    } else {
      callback(null, false);
    }
  },
};
