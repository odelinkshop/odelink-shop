import { useEffect, useState } from 'react';

export default function useProductGalleryState(productId) {
  const [selectedImage, setSelectedImage] = useState('');
  const [zoomOpen, setZoomOpen] = useState(false);
  const [zoomIndex, setZoomIndex] = useState(0);
  const [mainImageReady, setMainImageReady] = useState(false);
  const [buyOpening, setBuyOpening] = useState(false);

  useEffect(() => {
    setSelectedImage('');
    setZoomOpen(false);
    setZoomIndex(0);
    setMainImageReady(false);
    setBuyOpening(false);
  }, [productId]);

  useEffect(() => {
    setMainImageReady(false);
  }, [selectedImage]);

  return {
    selectedImage,
    setSelectedImage,
    zoomOpen,
    setZoomOpen,
    zoomIndex,
    setZoomIndex,
    mainImageReady,
    setMainImageReady,
    buyOpening,
    setBuyOpening
  };
}
