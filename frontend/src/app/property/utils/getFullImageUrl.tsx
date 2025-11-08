export const getFullImageUrl = (url: string) => {
  const baseUrl = "https://storageimages.blob.core.windows.net/images/";
  return url.startsWith("http") ? url : `${baseUrl}${url}`;
};
