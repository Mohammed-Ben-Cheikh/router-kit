export const useQuery = (): { [key: string]: string } => {
  const query: { [key: string]: string } = {};
  if (typeof window === "undefined") return query;
  const usp = new URLSearchParams(window.location.search);
  usp.forEach((value, key) => {
    query[key] = value;
  });
  return query;
};
