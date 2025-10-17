import { db } from "./config"
import { collection, addDoc } from "firebase/firestore"
import { auth } from "./config"

export async function logActivity(
  action: string,
  descriptionOrMetadata: string | Record<string, any>,
  userId?: string,
  metadata?: Record<string, any>,
) {
  try {
    // If second parameter is an object, use new format
    if (typeof descriptionOrMetadata === "object") {
      const metadataObj = descriptionOrMetadata
      const currentUser = auth.currentUser

      await addDoc(collection(db, "activity_logs"), {
        action,
        description: metadataObj.processTitle || metadataObj.userName || action,
        userId: metadataObj.userId || currentUser?.uid || "system",
        metadata: metadataObj,
        timestamp: new Date().toISOString(),
      })
    } else {
      // Old format: separate description and userId parameters
      await addDoc(collection(db, "activity_logs"), {
        action,
        description: descriptionOrMetadata,
        userId: userId || auth.currentUser?.uid || "system",
        metadata: metadata || {},
        timestamp: new Date().toISOString(),
      })
    }
  } catch (error) {
    console.error("Error logging activity:", error)
  }
}
