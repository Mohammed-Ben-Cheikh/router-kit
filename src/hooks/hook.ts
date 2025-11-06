import { useRouter } from "./useRouter";

// Retourne un objet { [paramName]: value }
export const useParams = (): { [key: string]: string } => {
  const { path, fullPathWithParams } = useRouter();
  const params: { [key: string]: string } = {};
  const fullSegments = fullPathWithParams.split("/").filter(Boolean);
  const pathSegments = path.split("/").filter(Boolean);
  fullSegments.forEach((seg: string, idx: number) => {
    if (seg.startsWith(":")) {
      const name = seg.slice(1);
      params[name] = pathSegments[idx] ?? "";
    }
  });
  return params;
};

// Parse la query string proprement (ex: ?a=1&b=2)
export const useQuery = (): { [key: string]: string } => {
  const query: { [key: string]: string } = {};
  if (typeof window === "undefined") return query;
  const usp = new URLSearchParams(window.location.search);
  usp.forEach((value, key) => {
    query[key] = value;
  });
  return query;
};
