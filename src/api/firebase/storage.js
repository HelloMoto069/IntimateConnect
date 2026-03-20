import storage from '@react-native-firebase/storage';

export const uploadFile = async (storagePath, localUri, metadata = {}) => {
  const ref = storage().ref(storagePath);
  await ref.putFile(localUri, metadata);
  const downloadURL = await ref.getDownloadURL();
  return downloadURL;
};

export const downloadURL = async storagePath => {
  const ref = storage().ref(storagePath);
  return await ref.getDownloadURL();
};

export const deleteFile = async storagePath => {
  const ref = storage().ref(storagePath);
  await ref.delete();
};

export const uploadProfilePhoto = async (userId, imageUri) => {
  const path = `profiles/${userId}/avatar.jpg`;
  return await uploadFile(path, imageUri, {contentType: 'image/jpeg'});
};
