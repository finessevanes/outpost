import { useState, useRef, useCallback, useEffect } from 'react';
import { Button } from '@/components/ui/button';
// @ts-ignore - exif-js doesn't have TypeScript definitions
import EXIF from 'exif-js';

interface ReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  hotelName: string;
  hotelId: number;
  hotelCoordinates: { lat: number; lng: number };
  onSubmitReview: (data: ReviewData) => void;
  onIssueCredential: (hotelName: string, locationData: any) => Promise<void>;
}

interface ReviewData {
  image: File;
  travelType: 'solo' | 'group' | 'mixed';
  location?: { lat: number; lng: number };
  reviewText?: string;
  rating?: number;
}

export function ReviewModal({ isOpen, onClose, hotelName, hotelId, hotelCoordinates, onSubmitReview, onIssueCredential }: ReviewModalProps) {
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [travelType, setTravelType] = useState<'solo' | 'group' | 'mixed' | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [locationStatus, setLocationStatus] = useState<'checking' | 'verified' | 'failed' | null>(null);
  const [photoLocation, setPhotoLocation] = useState<{lat: number, lng: number} | null>(null);
  const [photoLocationError, setPhotoLocationError] = useState<string | null>(null);
  const [credentialIssued, setCredentialIssued] = useState(false);
  const [isIssuingCredential, setIsIssuingCredential] = useState(false);
  const [showReviewWriting, setShowReviewWriting] = useState(false);
  const [reviewText, setReviewText] = useState('');
  const [rating, setRating] = useState<number>(5);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const extractGPSFromImage = (file: File): Promise<{lat: number, lng: number} | null> => {
    return new Promise((resolve) => {
      // @ts-ignore - EXIF.js typing issues
      EXIF.getData(file, function() {
        // @ts-ignore - EXIF.js typing issues  
        const lat = EXIF.getTag(this, "GPSLatitude");
        // @ts-ignore - EXIF.js typing issues
        const latRef = EXIF.getTag(this, "GPSLatitudeRef");
        // @ts-ignore - EXIF.js typing issues
        const lng = EXIF.getTag(this, "GPSLongitude");
        // @ts-ignore - EXIF.js typing issues
        const lngRef = EXIF.getTag(this, "GPSLongitudeRef");

        if (lat && lng && latRef && lngRef) {
          // Convert DMS to decimal degrees
          const latDecimal = convertDMSToDD(lat, latRef);
          const lngDecimal = convertDMSToDD(lng, lngRef);
          
          console.log(`📍 Photo GPS: ${latDecimal}, ${lngDecimal}`);
          resolve({ lat: latDecimal, lng: lngDecimal });
        } else {
          console.log('📍 No GPS data found in image');
          resolve(null);
        }
      });
    });
  };

  const convertDMSToDD = (dms: number[], ref: string): number => {
    let dd = dms[0] + dms[1]/60 + dms[2]/3600;
    if (ref === "S" || ref === "W") dd = dd * -1;
    return dd;
  };

  const handleImageSelect = useCallback(async (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }

    // Check for supported formats
    const supportedFormats = ['image/jpeg', 'image/jpg', 'image/png'];
    if (!supportedFormats.some(format => file.type.toLowerCase().includes(format.split('/')[1]))) {
      alert('Supported formats: JPEG, PNG only. Convert HEIC photos to JPEG first.');
      return;
    }

    setSelectedImage(file);
    
    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setImagePreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);

    // Extract GPS data from image
    try {
      console.log('📍 Extracting GPS data from image...');
      const gpsData = await extractGPSFromImage(file);
      setPhotoLocation(gpsData);
      
      if (gpsData) {
        console.log(`📍 Photo taken at: ${gpsData.lat}, ${gpsData.lng}`);
        
        // Check if photo was taken at the correct hotel
        const { lat: hotelLat, lng: hotelLng } = hotelCoordinates;
        const distance = Math.sqrt(
          Math.pow(gpsData.lat - hotelLat, 2) + Math.pow(gpsData.lng - hotelLng, 2)
        ) * 111000; // Convert to meters
        
        console.log(`📍 Photo distance from ${hotelName}: ${distance.toFixed(0)}m`);
        
        if (distance > 500) {
          setPhotoLocationError(`This photo was taken ${distance < 1000 ? distance.toFixed(0) + 'm' : (distance/1000).toFixed(1) + 'km'} away from ${hotelName}. Please upload a photo taken at this hotel, or proceed without photo GPS verification.`);
        } else {
          setPhotoLocationError(null);
        }
      } else {
        console.log('📍 No GPS data found in this image');
        setPhotoLocationError(null);
      }
    } catch (error) {
      console.error('Error extracting GPS data:', error);
      setPhotoLocation(null);
      setPhotoLocationError(null);
    }
  }, [hotelCoordinates, hotelName]);

  // Reset all states when modal opens/closes
  useEffect(() => {
    if (!isOpen) {
      setSelectedImage(null);
      setImagePreview(null);
      setTravelType(null);
      setLocationStatus(null);
      setPhotoLocation(null);
      setPhotoLocationError(null);
      setCredentialIssued(false);
      setIsIssuingCredential(false);
      setShowReviewWriting(false);
      setReviewText('');
      setRating(5);
    }
  }, [isOpen]);

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleImageSelect(file);
    }
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) {
      handleImageSelect(file);
    }
  }, [handleImageSelect]);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleGetVerified = async () => {
    if (credentialIssued || isIssuingCredential) return;

    try {
      setIsIssuingCredential(true);
      console.log('🎫 User clicked Get Verified - issuing credential...');
      
      await onIssueCredential(hotelName, photoLocation);
      setCredentialIssued(true);
      setShowReviewWriting(true); // Show review writing modal after credential success
      
      console.log('✅ Credential issued successfully! Now showing review writing modal.');
    } catch (error) {
      console.error('❌ Failed to issue credential:', error);
      alert('Failed to issue credential. Please try again.');
    } finally {
      setIsIssuingCredential(false);
    }
  };

  // Check if ready for verification (location verified + travel type selected)
  const isReadyForVerification = (photoLocation && !photoLocationError) || locationStatus === 'verified';
  const canGetVerified = isReadyForVerification && travelType && !credentialIssued;

  const checkGeolocation = async (): Promise<boolean> => {
    setLocationStatus('checking');

    // Use the actual hotel coordinates passed from parent
    const { lat: hotelLat, lng: hotelLng } = hotelCoordinates;

    // First, check if we have GPS data from the uploaded photo
    if (photoLocation && !photoLocationError) {
      console.log(`📍 Checking photo location: ${photoLocation.lat}, ${photoLocation.lng}`);
      
      // Calculate distance from photo location to hotel
      const distance = Math.sqrt(
        Math.pow(photoLocation.lat - hotelLat, 2) + Math.pow(photoLocation.lng - hotelLng, 2)
      ) * 111000; // Rough conversion to meters
      
      console.log(`📍 Photo distance from ${hotelName}: ${distance.toFixed(0)}m`);
      
      // Allow if within 500m (photos should be taken at the hotel)
      if (distance < 500) {
        setLocationStatus('verified');
        console.log('✅ Photo location verified - taken near the hotel!');
        return true;
      }
    } else if (photoLocationError) {
      console.log('❌ Photo location error detected, using current location instead');
    } else {
      console.log('📍 No GPS data in photo, checking current location instead...');
    }

    // Fallback to current location if no photo GPS or photo GPS failed
    return new Promise((resolve) => {
      if (!navigator.geolocation) {
        console.log('Geolocation not supported');
        setLocationStatus('failed');
        resolve(false);
        return;
      }
      
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          
          // Calculate distance from current location
          const distance = Math.sqrt(
            Math.pow(latitude - hotelLat, 2) + Math.pow(longitude - hotelLng, 2)
          ) * 111000;
          
          console.log(`📍 Current location distance from ${hotelName}: ${distance.toFixed(0)}m`);
          
          // For demo: allow if within 100m OR if coordinates suggest you're in Bali area
          const isNearHotel = distance < 100;
          const isInBali = latitude > -9 && latitude < -8 && longitude > 115 && longitude < 116;
          
          if (isNearHotel || isInBali) {
            setLocationStatus('verified');
            resolve(true);
          } else {
            setLocationStatus('failed');
            resolve(false);
          }
        },
        (error) => {
          console.error('Geolocation error:', error);
          setLocationStatus('failed');
          resolve(false);
        },
        { enableHighAccuracy: true, timeout: 10000 }
      );
    });
  };

  const handleSubmit = async () => {
    if (!selectedImage || !travelType || !credentialIssued || !reviewText.trim()) {
      alert('Please complete all steps including writing your review');
      return;
    }

    setIsSubmitting(true);

    try {
      // Submit review data including the written review
      const reviewData: ReviewData = {
        image: selectedImage,
        travelType,
        location: photoLocation || { lat: hotelCoordinates.lat, lng: hotelCoordinates.lng },
        reviewText: reviewText.trim(),
        rating: rating
      };

      onSubmitReview(reviewData);
      
    } catch (error) {
      console.error('Review submission error:', error);
      alert('Failed to submit review. Please try again.');
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-end justify-center z-50">
      <div className="bg-white rounded-t-3xl w-full max-w-md max-h-[90vh] overflow-y-auto animate-in slide-in-from-bottom-4 duration-300">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold text-black">📸 Review {hotelName}</h2>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl"
          >
            ×
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Image Upload */}
          <div className="space-y-3">
            <label className="block text-sm font-medium text-black">
              Upload a photo from your stay
            </label>
            
            {!imagePreview ? (
              <div
                className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-blue-400 transition-colors cursor-pointer"
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onClick={() => fileInputRef.current?.click()}
              >
                <div className="text-4xl mb-2">📷</div>
                <p className="text-black mb-2">Tap to select or drag & drop</p>
                <p className="text-xs text-black">JPEG, PNG supported</p>
              </div>
            ) : (
              <div className="relative">
                <img 
                  src={imagePreview} 
                  alt="Preview" 
                  className="w-full h-48 object-cover rounded-xl"
                />
                                 <button
                   onClick={() => {
                     setSelectedImage(null);
                     setImagePreview(null);
                     setPhotoLocation(null);
                     setPhotoLocationError(null);
                     setLocationStatus(null);
                     setCredentialIssued(false);
                     setIsIssuingCredential(false);
                     setShowReviewWriting(false);
                     setReviewText('');
                     setRating(5);
                   }}
                   className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-8 h-8 flex items-center justify-center hover:bg-red-600"
                 >
                   ×
                 </button>
              </div>
            )}
            
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/jpg,image/png"
              onChange={handleFileInput}
              className="hidden"
            />
          </div>

          {/* Travel Type */}
          <div className="space-y-3">
            <label className="block text-sm font-medium text-black">
              How did you travel?
            </label>
            <div className="grid grid-cols-3 gap-3">
              {[
                { value: 'solo', label: '🚶‍♀️ Solo', desc: 'Traveling alone' },
                { value: 'group', label: '👥 Group', desc: 'With friends' },
                { value: 'mixed', label: '🌟 Mixed', desc: 'Met people there' }
              ].map((option) => (
                <button
                  key={option.value}
                  onClick={() => setTravelType(option.value as any)}
                  className={`p-3 rounded-xl border-2 text-center transition-colors ${
                    travelType === option.value
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="text-sm font-medium text-black">{option.label}</div>
                  <div className="text-xs text-black mt-1">{option.desc}</div>
                </button>
              ))}
            </div>
          </div>

                     {/* Photo GPS Status */}
           {selectedImage && (
             <div className={`p-4 rounded-lg text-sm border ${
               photoLocationError 
                 ? 'bg-red-50 text-red-700 border-red-200' 
                 : photoLocation 
                   ? 'bg-green-50 text-green-700 border-green-200' 
                   : 'bg-amber-50 text-amber-800 border-amber-200'
             }`}>
               {photoLocationError ? (
                 <div>
                   <div className="font-medium mb-2">❌ Photo location mismatch</div>
                   <div className="mb-3">{photoLocationError}</div>
                   <div className="font-medium text-xs">Options:</div>
                   <ul className="text-xs ml-4 mt-1 space-y-1">
                     <li>• Upload a different photo taken at {hotelName}</li>
                     <li>• Continue with current location verification</li>
                   </ul>
                 </div>
               ) : photoLocation ? (
                 <div>
                   <div className="font-medium mb-1">✅ Photo GPS found!</div>
                   <div>📍 Taken at {photoLocation.lat.toFixed(4)}, {photoLocation.lng.toFixed(4)}</div>
                   <div className="text-xs mt-1 font-medium">Photo location verified for {hotelName}</div>
                 </div>
               ) : (
                 <div>
                   <div className="font-medium mb-2">⚠️ No GPS data in this photo</div>
                   <div className="mb-2">This could be because:</div>
                   <ul className="text-xs ml-4 mb-3 space-y-1">
                     <li>• Photo was edited or shared via social media</li>
                     <li>• Location services were disabled when photo was taken</li>
                     <li>• Photo was converted from HEIC format</li>
                   </ul>
                   <div className="font-medium">You can still proceed - we'll verify using your current location instead.</div>
                 </div>
               )}
             </div>
           )}

           {/* Location Status */}
           {locationStatus && (
             <div className={`p-3 rounded-lg text-sm ${
               locationStatus === 'checking' ? 'bg-blue-50 text-blue-700' :
               locationStatus === 'verified' ? 'bg-green-50 text-green-700' :
               'bg-red-50 text-red-700'
             }`}>
               {locationStatus === 'checking' && '📍 Verifying location...'}
               {locationStatus === 'verified' && photoLocation && '✅ Photo location verified! You were at this hotel.'}
               {locationStatus === 'verified' && !photoLocation && '✅ Current location verified! You are at this hotel.'}
               {locationStatus === 'failed' && '❌ Could not verify location. Make sure photo was taken at the hotel.'}
             </div>
           )}

           {/* Progress Steps */}
           <div className="space-y-3">
             {/* Step 1: Photo Upload */}
             <div className={`flex items-center gap-3 p-3 rounded-lg ${
               selectedImage ? 'bg-green-50 border border-green-200' : 'bg-gray-50 border border-gray-200'
             }`}>
               <span className="text-lg">{selectedImage ? '✅' : '1️⃣'}</span>
               <div className="text-sm">
                 <div className="font-medium text-black">Upload photo from your stay</div>
                 <div className="text-black">{selectedImage ? 'Photo uploaded ✓' : 'Please upload a photo'}</div>
               </div>
             </div>

             {/* Step 2: Travel Type */}
             <div className={`flex items-center gap-3 p-3 rounded-lg ${
               travelType ? 'bg-green-50 border border-green-200' : 'bg-gray-50 border border-gray-200'
             }`}>
               <span className="text-lg">{travelType ? '✅' : '2️⃣'}</span>
               <div className="text-sm">
                 <div className="font-medium text-black">Select travel type</div>
                 <div className="text-black">{travelType ? `${travelType} travel selected ✓` : 'How did you travel?'}</div>
               </div>
             </div>

             {/* Step 3: Get Verified */}
             <div className={`flex items-center gap-3 p-3 rounded-lg ${
               credentialIssued ? 'bg-green-50 border border-green-200' : 
               canGetVerified ? 'bg-blue-50 border border-blue-200' : 
               'bg-gray-50 border border-gray-200'
             }`}>
               <span className="text-lg">
                 {credentialIssued ? '✅' : isIssuingCredential ? '🔄' : canGetVerified ? '3️⃣' : '3️⃣'}
               </span>
               <div className="text-sm">
                 <div className="font-medium text-black">Get verified credential</div>
                 <div className="text-black">
                   {credentialIssued ? 'Credential issued ✓' :
                    isIssuingCredential ? 'Issuing credential...' :
                    canGetVerified ? 'Ready to verify!' :
                    'Complete steps 1 & 2 first'}
                 </div>
               </div>
             </div>

             {/* Step 4: Write Review */}
             <div className={`flex items-center gap-3 p-3 rounded-lg ${
               showReviewWriting ? 'bg-blue-50 border border-blue-200' : 
               credentialIssued ? 'bg-green-50 border border-green-200' : 
               'bg-gray-50 border border-gray-200'
             }`}>
               <span className="text-lg">
                 {reviewText.trim() ? '✅' : showReviewWriting ? '4️⃣' : credentialIssued ? '4️⃣' : '4️⃣'}
               </span>
               <div className="text-sm">
                 <div className="font-medium text-black">Write your review</div>
                 <div className="text-black">
                   {reviewText.trim() ? 'Review written ✓' :
                    showReviewWriting ? 'Write your review below!' :
                    credentialIssued ? 'Ready to write review!' :
                    'Get verified first'}
                 </div>
               </div>
             </div>
           </div>

           {/* Review Writing Section - Shows after credential issued */}
           {showReviewWriting && (
             <div className="space-y-4 p-4 bg-green-50 border border-green-200 rounded-lg">
               <h3 className="text-lg font-semibold text-black">✅ Write Your Review</h3>
               <p className="text-sm text-black">Great! You're verified. Now share your experience at {hotelName}:</p>
               
               {/* Rating */}
               <div className="space-y-2">
                 <label className="block text-sm font-medium text-black">Rating</label>
                 <div className="flex gap-1">
                   {[1, 2, 3, 4, 5].map((star) => (
                     <button
                       key={star}
                       onClick={() => setRating(star)}
                       className={`text-2xl transition-colors ${
                         star <= rating ? 'text-yellow-500' : 'text-gray-300'
                       }`}
                     >
                       ⭐
                     </button>
                   ))}
                 </div>
               </div>

               {/* Review Text */}
               <div className="space-y-2">
                 <label className="block text-sm font-medium text-black">
                   Your Review
                 </label>
                 <textarea
                   value={reviewText}
                   onChange={(e) => setReviewText(e.target.value)}
                   placeholder="Share your experience... What did you like? Any tips for other travelers?"
                   className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 min-h-[100px] resize-none text-black"
                   maxLength={500}
                 />
                 <div className="text-xs text-black text-right">
                   {reviewText.length}/500 characters
                 </div>
               </div>
             </div>
           )}

           {/* Get Verified Button (Step 3) */}
           {canGetVerified && (
             <Button
               onClick={handleGetVerified}
               disabled={isIssuingCredential}
               className="w-full py-3 text-lg font-medium bg-blue-600 hover:bg-blue-700"
             >
               {isIssuingCredential ? '🔄 Getting Verified...' : '🎫 Get Verified'}
             </Button>
           )}

           {/* Write Review Button - Shows after credential issued but before review written */}
           {credentialIssued && !showReviewWriting && (
             <Button
               onClick={() => setShowReviewWriting(true)}
               className="w-full py-3 text-lg font-medium bg-blue-600 hover:bg-blue-700"
             >
               ✍️ Write Review
             </Button>
           )}

           {/* Submit Review Button - Shows only after review is written */}
           {showReviewWriting && reviewText.trim() && (
             <Button
               onClick={handleSubmit}
               disabled={isSubmitting}
               className="w-full py-3 text-lg font-medium bg-green-600 hover:bg-green-700"
             >
               {isSubmitting ? 'Submitting Review...' : '📝 Submit Review'}
             </Button>
           )}
        </div>
      </div>
    </div>
  );
} 