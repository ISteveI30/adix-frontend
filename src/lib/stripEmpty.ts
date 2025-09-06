export const stripEmpty = <T extends Record<string, any>>(o: T): T =>
  Object.fromEntries(
    Object.entries(o).filter(([, v]) => v !== "" && v !== null && v !== undefined)
  ) as T;
