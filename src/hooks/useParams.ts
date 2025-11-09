import { useRouter } from "./useRouter";

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
