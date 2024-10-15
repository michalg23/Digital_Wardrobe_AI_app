// store.js
import { create } from 'zustand';

// Store 1: edit outfit Store
const useStore = create((set) => ({
    outfit: null,
    setOutfit: (outfit) => set({ outfit }),
    eraseOutfit: () => set({ outfit: null })  
}));

// Store 2: Outfit Store
export const useOutfitStore  = create((set) => ({
  NewOutfit: { images: [], eventName: '', selectedDate: null },
  
  // Set outfit with new data (event, date, or images)
  setOutfitwardrobe: (newOutfit) => set((state) => ({
    NewOutfit: { ...state.NewOutfit, ...newOutfit },
  })), 

    resetOutfit: () => set({ NewOutfit: { images: [], eventName: '', selectedDate: null } }),
  }));  

// Store 3: Image Store
export const useImageStore = create((set)  => ({
    deletedImagePath: '', // Store the path of the deleted image
    setDeletedImagePath: (path) => set({ deletedImagePath: path }), // Function to update deleted image path
    resetDeletedImagePath: () => set({ deletedImagePath: '' }) // Function to reset deleted image path

  }));




export default useStore;
