export const adaptDataForList = (category: string, data: any[]) => {
  return data.map((item) => {
    if (category === "owner") {
      return {
        ...item,
        name: `${item.firstName} ${item.lastName}`,
      };
    }
    return item;
  });
};
