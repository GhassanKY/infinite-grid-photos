import { getPhotos } from "./actions/getPhotos";
import PhotoGallery from "./components/PhotoGallery";

export default async function Home() {
  const response = await getPhotos(1)
  return (
    <PhotoGallery initialData={response || []} />
  );
}
